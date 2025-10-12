const isObject = v => v != null && typeof v === 'object'

const identity = v => v

const PLACEHOLDER_RE = /\{([^{}]+)\}/g
const ALIAS_RE = /{{(.*?)}}/g
const ALIAS_INDEX_RE = /^(.+)\[(.+)\]$/

function assemble(parts, replacements, count, { array, debug } = {}) {
  let result = array ? parts.slice() : parts[0]
  const len = parts.length
  for (let i = 1; i < len; i += 2) {
    const part = parts[i]
    let val = replacements[part]
    if (val == null) {
      if (part === 'n' && count != null) val = count
      else {
        debug &&
          console.warn(`No "${part}" in placeholder object:`, replacements)
        val = `{${part}}`
      }
    }
    if (array) result[i] = val
    else result += val + parts[i + 1]
  }
  return result
}

function getPluralValue(translation, count, pluralize) {
  // Opinionated assumption: Pluralization rules are the same for negative and positive values.
  // By normalizing all values to positive, pluralization functions become simpler, and less error-prone by accident.
  const mappedCount = pluralize(Math.abs(count))
  if (translation[mappedCount] != null) return translation[mappedCount]
  if (translation.n != null) return translation.n
}

function replacePlaceholders(
  translation,
  replacements,
  count,
  replCache,
  { array, debug } = {}
) {
  let result = replCache.get(translation)
  if (result == null) {
    const parts = translation
      // turn both curly braces around tokens into the a unified
      // (and now unique/safe) token `{x}` signifying boundary between
      // replacement variables and static text.
      .replace(PLACEHOLDER_RE, '{x}$1{x}')
      // Adjacent placeholders will always have an empty string between them.
      // The array will also always start with a static string (at least a '').
      .split('{x}') // stupid but works™

    // NOTE: parts no consists of alternating [text,replacement,text,replacement,text]
    // Cache a function that loops over the parts array - unless there's only text
    // (i.e. parts.length === 1) - then we simply cache the string.
    result = parts.length > 1 ? parts : parts[0]
    replCache.set(translation, result)
  }
  return Array.isArray(result)
    ? assemble(result, replacements, count, {
        array,
        debug,
      })
    : result
}

function translate(
  translationKey,
  subKey,
  replacements,
  keys,
  {
    useKeyForMissingTranslation = true,
    array = false,
    pluralize = identity,
    debug = false,
  } = {},
  replCache
) {
  let translation = keys[translationKey]
  const translationIsObject = isObject(translation)
  const complex = translationIsObject || subKey != null || replacements != null

  if (complex) {
    if (isObject(subKey)) {
      const tmp = replacements
      replacements = subKey
      subKey = tmp
    }
    replacements = replacements || {}

    if (translationIsObject) {
      const propValue =
        (subKey != null && translation[subKey]) || translation['*']
      if (propValue != null) translation = propValue
      else if (typeof subKey === 'number') {
        // get appropriate plural translation string
        translation = getPluralValue(translation, subKey, pluralize)
      }
    }
  }

  if (typeof translation !== 'string') {
    if (!useKeyForMissingTranslation) return
    translation = translationKey
    if (debug) {
      if (subKey != null) {
        translation = `@@${translationKey}.${subKey}@@`
        console.warn(
          `No translation or pluralization form found for "${subKey}" in ${translationKey}`
        )
      } else {
        translation = `@@${translation}@@`
        console.warn(`Translation for "${translationKey}" not found.`)
      }
    }
  }

  if (complex) {
    return replacePlaceholders(translation, replacements, subKey, replCache, {
      array,
    })
  }
  return translation
}

function translatejs(messageObject = {}, { resolveAliases, ...options } = {}) {
  if (resolveAliases) messageObject = translatejs.resolveAliases(messageObject)
  const replCache = new Map()

  function tFunc(translationKey, subKey, replacements) {
    return translate(
      translationKey,
      subKey,
      replacements,
      tFunc.keys,
      tFunc.opts,
      replCache
    )
  }

  tFunc.arr = (translationKey, subKey, replacements) =>
    translate(
      translationKey,
      subKey,
      replacements,
      tFunc.keys,
      { ...tFunc.opts, array: true },
      replCache
    )

  tFunc.keys = messageObject || {}
  tFunc.opts = options

  return tFunc
}

function mapValues(obj, fn) {
  return Object.keys(obj).reduce((res, key) => {
    res[key] = fn(obj[key], key)
    return res
  }, {})
}

translatejs.resolveAliases = function resolveAliases(translations) {
  const inProcess = new Set()

  function walk(translation) {
    if (isObject(translation)) return mapValues(translation, walk)
    return translation.replace(ALIAS_RE, (_, token) => {
      if (inProcess.has(token)) {
        throw new Error(`Circular reference for "${token}" detected`)
      }
      inProcess.add(token)

      let key = token,
        subKey = ''
      const m = ALIAS_INDEX_RE.exec(token)
      if (m) {
        key = m[1]
        subKey = m[2]
      }

      let target = translations[key]
      if (isObject(target)) {
        if (subKey) target = target[subKey]
        else throw new Error("You can't alias objects")
      }
      if (target == null) throw new Error(`No translation for alias "${token}"`)

      const resolved = walk(target)
      inProcess.delete(token)
      return resolved
    })
  }

  return walk(translations)
}

export default translatejs
