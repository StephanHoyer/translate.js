(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.translatejs = factory());
}(this, (function () { 'use strict';

  const isObject = obj => obj && typeof obj === 'object';

  function assemble(parts, replacements, count, debug, asArray) {
    let result = asArray ? parts.slice() : parts[0];
    const len = parts.length;
    for (let i = 1; i < len; i += 2) {
      const part = parts[i];
      let val = replacements[part];
      if (val == null) {
        if (part === 'n' && count != null) {
          val = count;
        } else {
          debug &&
            console.warn('No "' + part + '" in placeholder object:', replacements);
          val = '{' + part + '}';
        }
      }
      if (asArray) {
        result[i] = val;
      } else {
        result += val + parts[i + 1];
      }
    }
    return result
  }

  function translatejs(messageObject, options) {
    options = options || {};
    if (options.resolveAliases) {
      messageObject = translatejs.resolveAliases(messageObject);
    }
    const debug = options.debug;

    function getPluralValue(translation, count) {
      // Opinionated assumption: Pluralization rules are the same for negative and positive values.
      // By normalizing all values to positive, pluralization functions become simpler, and less error-prone by accident.
      let mappedCount = Math.abs(count);

      const plFunc = (tFunc.opts || {}).pluralize;
      mappedCount = plFunc ? plFunc(mappedCount, translation) : mappedCount;
      if (translation[mappedCount] != null) {
        return translation[mappedCount]
      }
      if (translation.n != null) {
        return translation.n
      }
    }

    const replCache = {};

    function replacePlaceholders(translation, replacements, count) {
      let result = replCache[translation];
      if (result == null) {
        const parts = translation
          // turn both curly braces around tokens into the a unified
          // (and now unique/safe) token `{x}` signifying boundry between
          // replacement variables and static text.
          .replace(/\{(\w+)\}/g, '{x}$1{x}')
          // Adjacent placeholders will always have an empty string between them.
          // The array will also always start with a static string (at least a '').
          .split('{x}'); // stupid but works™

        // NOTE: parts no consists of alternating [text,replacement,text,replacement,text]
        // Cache a function that loops over the parts array - unless there's only text
        // (i.e. parts.length === 1) - then we simply cache the string.
        result = parts.length > 1 ? parts : parts[0];
        replCache[translation] = result;
      }
      result = result.pop
        ? assemble(result, replacements, count, debug, tFunc.opts.array)
        : result;
      return result
    }

    function tFunc(translationKey, subKey, replacements) {
      let translation = tFunc.keys[translationKey];
      const complex = subKey != null || replacements != null;

      if (complex) {
        if (isObject(subKey)) {
          const tmp = replacements;
          replacements = subKey;
          subKey = tmp;
        }
        replacements = replacements || {};

        if (subKey !== null && isObject(translation)) {
          const propValue = translation[subKey];
          if (propValue != null) {
            translation = propValue;
          } else if (typeof subKey === 'number') {
            // get appropriate plural translation string
            translation = getPluralValue(translation, subKey);
          }
        }
      }

      if (typeof translation !== 'string') {
        translation = translationKey;
        if (debug) {
          if (subKey != null) {
            translation = '@@' + translationKey + '.' + subKey + '@@';
            console.warn(
              'No translation or pluralization form found for "' +
                subKey +
                '" in' +
                translationKey
            );
          } else {
            translation = '@@' + translation + '@@';
            console.warn('Translation for "' + translationKey + '" not found.');
          }
        }
      }

      if (complex || debug) {
        translation = replacePlaceholders(translation, replacements, subKey);
      }
      return translation
    }

    // Convenience function.
    tFunc.arr = function arr(...args) {
      const opts = tFunc.opts;
      const normalArrayOption = opts.array;
      opts.array = true;
      const result = tFunc.apply(null, args);
      opts.array = normalArrayOption;
      return result
    };

    tFunc.keys = messageObject || {};
    tFunc.opts = options;

    return tFunc
  }

  function mapValues(obj, fn) {
    return Object.keys(obj).reduce((res, key) => {
      res[key] = fn(obj[key], key);
      return res
    }, {})
  }

  translatejs.resolveAliases = function resolveAliases(translations) {
    const keysInProcess = {};
    function resolveAliases(translation) {
      if (isObject(translation)) {
        return mapValues(translation, resolveAliases)
      }
      return translation.replace(/{{(.*?)}}/g, (_, token) => {
        if (keysInProcess[token]) {
          throw new Error('Circular reference for "' + token + '" detected')
        }
        keysInProcess[token] = true;
        let key = token;
        let subKey = '';
        const keyParts = token.match(/^(.+)\[(.+)\]$/);
        if (keyParts) {
          key = keyParts[1];
          subKey = keyParts[2];
        }
        let target = translations[key];
        if (isObject(target)) {
          if (subKey) {
            target = target[subKey];
          } else {
            throw new Error("You can't alias objects")
          }
        }
        if (target == null) {
          throw new Error('No translation for alias "' + token + '"')
        }
        const translation = resolveAliases(target);
        keysInProcess[token] = false;
        return translation
      })
    }
    return resolveAliases(translations)
  };

  return translatejs;

})));
