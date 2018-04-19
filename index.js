/**
 * Microlib for translations with support for placeholders and multiple plural forms.
 *
 *
 * Usage:
 *
 * var translate = require('translate.js')
 *
 * var messages = {
 *  translationKey: 'translationValue'
 * }
 *
 * var options = {
 *   // These are the defaults:
 *   debug: false,  //[Boolean]: Logs missing translations to console and add "@@" around output if `true`.
 *   array: false,  //[Boolean]: `true` returns translations with placeholder-replacements as Arrays.
 *   pluralize: function(n,translKey){ return Math.abs(n); } //[Function(count,translationKey)]: Provides a custom pluralization mapping function.
 * }
 *
 * var t = translate(messages, [options])
 *
 * t('translationKey')
 * t('translationKey', count)
 * t('translationKey', {replaceKey: 'replacevalue'})
 * t('translationKey', count, {replaceKey: 'replacevalue'})
 * t('translationKey', {replaceKey: 'replacevalue'}, count)
 *
 *
 * @author Jonas Girnatis <dermusterknabe@gmail.com>
 * @licence May be freely distributed under the MIT license.
 */

/* global console, module */
;(function () {
  'use strict'

  var isObject = function (obj) {
    return obj && typeof obj === 'object'
  }

  function assemble (parts, replacements, count, debug, asArray) {
    var result = asArray ? parts.slice() : parts[0]
    var len = parts.length
    for (var i = 1; i < len; i += 2) {
      var part = parts[i]
      var val = replacements[part]
      if (val == null) {
        if (part === 'n' && count != null) {
          val = count
        } else {
          debug && console.warn('No "' + part + '" in placeholder object:', replacements)
          val = '{' + part + '}'
        }
      }
      if (asArray) {
        result[i] = val
      } else {
        result += val + parts[i + 1]
      }
    }
    return result
  }

  var translatejs = function (messageObject, options) {
    options = options || {}
    if (options.resolveAliases) {
      messageObject = translatejs.resolveAliases(messageObject)
    }
    var debug = options.debug

    function getPluralValue (translation, count) {
      // Opinionated assumption: Pluralization rules are the same for negative and positive values.
      // By normalizing all values to positive, pluralization functions become simpler, and less error-prone by accident.
      var mappedCount = Math.abs(count)

      var plFunc = (tFunc.opts || {}).pluralize
      mappedCount = plFunc ? plFunc(mappedCount, translation) : mappedCount
      if (translation[mappedCount] != null) {
        return translation[mappedCount]
      }
      if (translation.n != null) {
        return translation.n
      }
    }

    var replCache = {}

    function replacePlaceholders (translation, replacements, count) {
      var result = replCache[translation]
      if (result == null) {
        var parts = translation
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
      result = result.pop ? assemble(result, replacements, count, debug, tFunc.opts.array) : result
      return result
    }

    var tFunc = function (translationKey, subKey, replacements) {
      var translation = tFunc.keys[translationKey]
      var complex = subKey != null || replacements != null

      if (complex) {
        if (isObject(subKey)) {
          var tmp = replacements
          replacements = subKey
          subKey = tmp
        }
        replacements = replacements || {}

        if (subKey !== null && isObject(translation)) {
          var propValue = translation[subKey]
          if (propValue != null) {
            translation = propValue
          } else if (typeof subKey === 'number') {
            // get appropriate plural translation string
            translation = getPluralValue(translation, subKey)
          }
        }
      }

      if (typeof translation !== 'string') {
        translation = translationKey
        if (debug) {
          if (subKey != null) {
            translation = '@@' + translationKey + '.' + subKey + '@@'
            console.warn('No translation or pluralization form found for "' + subKey + '" in' + translationKey)
          } else {
            translation = '@@' + translation + '@@'
            console.warn('Translation for "' + translationKey + '" not found.')
          }
        }
      }

      if (complex || debug) {
        translation = replacePlaceholders(translation, replacements, subKey)
      }
      return translation
    }

    // Convenience function.
    tFunc.arr = function () {
      var opts = tFunc.opts
      var normalArrayOption = opts.array
      opts.array = true
      var result = tFunc.apply(null, arguments)
      opts.array = normalArrayOption
      return result
    }

    tFunc.keys = messageObject || {}
    tFunc.opts = options

    return tFunc
  }

  function mapValues (obj, fn) {
    return Object.keys(obj).reduce(function (res, key) {
      res[key] = fn(obj[key], key)
      return res
    }, {})
  }

  translatejs.resolveAliases = function (translations) {
    var keysInProcess = {};
    function resolveAliases (translation) {
      if (isObject(translation)) {
        return mapValues(translation, resolveAliases)
      }
      return translation.replace(/{{(.*?)}}/g, function (_, token) {
        if (keysInProcess[token]) {
          throw new Error('Circular reference for "' + token + '" detected')
        }
        keysInProcess[token] = true
        var key = token
        var subKey = ''
        var keyParts = token.match(/^(.+)\[(.+)\]$/);
        if ( keyParts ) {
          key = keyParts[1];
          subKey = keyParts[2];
        }
        var target = translations[key];
        if (isObject(target)) {
          if ( subKey ) {
            target = target[subKey]
          } else {
            throw new Error('You can\'t alias objects')
          }
        }
        if (target == null) {
          throw new Error('No translation for alias "' + token + '"')
        }
        var translation = resolveAliases(target)
        keysInProcess[token] = false
        return translation
      })
    }
    return resolveAliases(translations)
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = translatejs
  } else {
    window.translatejs = translatejs
  }
})()
