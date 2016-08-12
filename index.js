/**
 * Microlib for translations with support for placeholders and multiple plural forms.
 *
 * v0.4.1
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
      if ( asArray ) {
        result[i] = val
      } else {
        result += val + parts[i+1]
      }
    }
    return result
  }

  var translatejs = function (messageObject, options) {
    options = options || {}
    var debug = options.debug

    function getPluralValue (translation, count) {
      // Opinionated assumption: Pluralization rules are the same for negative and positive values.
      // By normalizing all values to positive, pluralization functions become simpler, and less error-prone by accident.
      var mappedCount = Math.abs(count)

      if (translation[mappedCount] != null) {
        return translation[mappedCount]
      }
      var plFunc = (tFunc.opts || {}).pluralize
      mappedCount = plFunc ? plFunc(mappedCount, translation) : mappedCount
      if (translation[mappedCount] != null) {
        return translation[mappedCount]
      }
      if (translation.n != null) {
        return translation.n
      }
      debug && console.warn('No plural forms found for "' + count + '" in', translation)
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

    var tFunc = function (translationKey, arg1, arg2) {
      var translation = tFunc.keys[translationKey]
      var complex = arg1 != null || arg2 != null
      var count, replacements, subkey

      if (complex) {
        count = isObject(arg1) ? arg2 : arg1
        replacements = isObject(arg1) ? arg1 : arg2
        subkey = typeof count === 'string' && count
        count = typeof count === 'number' && count
        replacements = replacements || {}

        if (subkey && isObject(translation)) {
          translation = translation[subkey]
        }

        if (count !== false && isObject(translation)) {
          // get appropriate plural translation string
          translation = getPluralValue(translation, count)
        }
      }

      if (typeof translation !== 'string') {
        translation = translationKey
        if (debug) {
          if (subkey) {
            translation = '@@' + translationKey + '.' + subkey + '@@'
            console.warn(['Translation for ', translationKey, ' with subkey ', subkey, ' not found.'].join('"'))
          } else {
            translation = '@@' + translation + '@@'
            console.warn('Translation for "' + translationKey + '" not found.')
          }
        }
      } else if (complex || debug) {
        translation = replacePlaceholders(translation, replacements, count)
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
      };

    tFunc.keys = messageObject || {}
    tFunc.opts = options

    return tFunc
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = translatejs
  } else {
    window.translatejs = translatejs
  }
})()

