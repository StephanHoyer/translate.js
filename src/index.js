const isObject = (obj) => obj && typeof obj === 'object'

function assemble(parts, replacements, count, opts) {
  let result = opts.array ? parts.slice() : parts[0]
  const len = parts.length
  for (let i = 1; i < len; i += 2) {
    const part = parts[i]
    let val = replacements[part]
    if (val == null) {
      if (part === 'n' && count != null) {
        val = count
      } else {
        opts.debug &&
          console.warn('No "' + part + '" in placeholder object:', replacements)
        val = '{' + part + '}'
      }
    }
    if (opts.array) {
      result[i] = val
    } else {
      result += val + parts[i + 1]
    }
  }
  return result
}

function getPluralValue(translation, count, plFunc) {
  // Opinionated assumption: Pluralization rules are the same for negative and positive values.
  // By normalizing all values to positive, pluralization functions become simpler, and less error-prone by accident.
  let mappedCount = Math.abs(count)

  mappedCount = plFunc ? plFunc(mappedCount) : mappedCount
  if (translation[mappedCount] != null) {
    return translation[mappedCount]
  }
  if (translation.n != null) {
    return translation.n
  }
}

function replacePlaceholders(
  translation,
  replacements,
  count,
  replCache,
  opts
) {
  let result = replCache[translation]
  if (result == null) {
    const parts = translation
      // turn both curly braces around tokens into the a unified
      // (and now unique/safe) token `{x}` signifying boundry between
      // replacement variables and static text.
      .replace(/\{(\w+)\}/g, '{x}$1{x}')
      // Adjacent placeholders will always have an empty string between them.
      // The array will also always start with a static string (at least a '').
      .split('{x}') // stupid but works™

    // NOTE: parts no consists of alternating [text,replacement,text,replacement,text]
    // Cache a function that loops over the parts array - unless there's only text
    // (i.e. parts.length === 1) - then we simply cache the string.
    result = parts.length > 1 ? parts : parts[0]
    replCache[translation] = result
  }
  result = result.pop ? assemble(result, replacements, count, opts) : result
  return result
}

function translate(
  translationKey,
  subKey,
  replacements,
  keys,
  opts,
  replCache
) {
  opts = opts || {}
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
      if (propValue != null) {
        translation = propValue
      } else if (typeof subKey === 'number') {
        // get appropriate plural translation string
        const plFunc = opts.pluralize
        translation = getPluralValue(translation, subKey, plFunc)
      }
    }
  }

  if (typeof translation !== 'string') {
    if (opts.useKeyForMissingTranslation === false) {
      return
    }
    translation = translationKey
    if (opts.debug) {
      if (subKey != null) {
        translation = '@@' + translationKey + '.' + subKey + '@@'
        console.warn(
          'No translation or pluralization form found for "' +
            subKey +
            '" in' +
            translationKey
        )
      } else {
        translation = '@@' + translation + '@@'
        console.warn('Translation for "' + translationKey + '" not found.')
      }
    }
  }

  if (complex) {
    return replacePlaceholders(
      translation,
      replacements,
      subKey,
      replCache,
      opts
    )
  }
  return translation
}

function translateToArray(...args) {
  const opts = this.opts
  const normalArrayOption = opts.array
  opts.array = true
  const result = this.apply(null, args)
  opts.array = normalArrayOption
  return result
}

function translatejs(messageObject, options) {
  messageObject = messageObject || {}
  options = options || {}

  if (options.resolveAliases) {
    messageObject = translatejs.resolveAliases(messageObject)
  }

  const replCache = {}

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

  tFunc.arr = translateToArray // Convenience function.

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
  const keysInProcess = {}
  function resolveAliases(translation) {
    if (isObject(translation)) {
      return mapValues(translation, resolveAliases)
    }
    return translation.replace(/{{(.*?)}}/g, (_, token) => {
      if (keysInProcess[token]) {
        throw new Error('Circular reference for "' + token + '" detected')
      }
      keysInProcess[token] = true
      let key = token
      let subKey = ''
      const keyParts = token.match(/^(.+)\[(.+)\]$/)
      if (keyParts) {
        key = keyParts[1]
        subKey = keyParts[2]
      }
      let target = translations[key]
      if (isObject(target)) {
        if (subKey) {
          target = target[subKey]
        } else {
          throw new Error("You can't alias objects")
        }
      }
      if (target == null) {
        throw new Error('No translation for alias "' + token + '"')
      }
      const translation = resolveAliases(target)
      keysInProcess[token] = false
      return translation
    })
  }
  return resolveAliases(translations)
}

export default translatejs
