'use strict'
/* global require */

const o = require('ospec')
const translate = require('../') // test the built/transpiled module

o.spec('translate.js', () => {
  const translationsObject = {
    plain: 'I like this.',
    like: 'I like {thing}!',
    simpleCounter: 'The count is {n}.',
    hits: {
      0: 'No Hits',
      1: '{n} Hit',
      2: '{n} Hitse', // some slavic langs have multiple plural forms
      3: '{n} Hitses', // some slavic langs have multiple plural forms
      n: '{n} Hits', // default
    },
    icelandicSheep: {
      0: 'Engar kindur',
      s: '{n} kind', // some languages use singular for any number that ends with 1 (i.e. 101, 21, 31, 51)
      p: '{n} kindur',
      13: 'Baaahd luck!', // Aribtrary translation outside of pluralization rules
    },
    horses: {
      n: 'Pluralization keys are missing', // default fallback
    },
    date: {
      1: '{day}. January {year}',
      2: '{day}. February {year}',
      3: '{day}. March {year}',
      4: '{day}. April {year}',
      5: '{day}. May {year}',
      6: '{day}. June {year}',
      7: '{day}. July {year}',
      8: '{day}. August {year}',
      9: '{day}. September {year}',
      10: '{day}. October {year}',
      11: '{day}. November {year}',
      12: '{day}. December {year}',

      '*': 'WAT! {n}!?',
      n: 'Is always overridden by "*"',
    },

    'Prosa Key': 'This is prosa!',

    comboCounter: '{name} is {n} years old.',
    translationWithSubkeys: { foo: 'FOO' },
    translationWithDefaultSubkey: { '*': 'I am a default value' },
  }

  const t = translate(translationsObject)

  o('should return translationKey if no translation is found', () => {
    o(t('nonexistentkey')).equals('nonexistentkey')
  })

  o('should return translationKey when subkey is not provided', () => {
    // this is technically a special case of the test
    // "should treat any non-string translations as missing"
    // below
    o(t('translationWithSubkeys')).equals('translationWithSubkeys')
  })

  o(
    'should return undefiend if no translation is found ' +
      'and useKeyForMissingTranslation-option is set to false',
    () => {
      const t1 = translate({}, { useKeyForMissingTranslation: false })
      o(t1('nonexistentkey')).equals(undefined)
    }
  )

  o('should return a translated string', () => {
    o(t('plain')).equals('I like this.')
  })

  o('should return a translated string for prosa keys', () => {
    o(t('Prosa Key')).equals('This is prosa!')
  })

  o('should return a translated string and replace a placeholder ', () => {
    o(t('like', { thing: 'Sun' })).equals('I like Sun!')
  })

  o(
    'should treat replacement values in toString-able object form as strings',
    () => {
      o(t('like', { thing: { toString: () => 'Moon' } })).equals('I like Moon!')
    }
  )

  o('should return a not-translated string and replace a placeholder ', () => {
    o(t('This {thing} not translated, yet', { thing: 'string' })).equals(
      'This string not translated, yet'
    )
  })

  o('should return a translated string and show missing placeholders', () => {
    o(t('like')).equals('I like {thing}!')
  })

  o('should return a translated string and replace a count', () => {
    o(t('simpleCounter', 25)).equals('The count is 25.')
  })

  o(
    'should return a translated string according to a potential dynamic subkey',
    () => {
      const dynamicSubKey = 'foo'
      o(t('translationWithSubkeys', dynamicSubKey)).equals('FOO')
    }
  )

  o(
    'should return a translated string with the correct plural form (0)',
    () => {
      o(t('hits', 0)).equals('No Hits')
    }
  )

  o(
    'should return a translated string with the correct plural form (1)',
    () => {
      o(t('hits', 1)).equals('1 Hit')
    }
  )

  o(
    'should return a translated string with the correct plural form (2)',
    () => {
      o(t('hits', 2)).equals('2 Hitse')
    }
  )

  o(
    'should return a translated string with the correct plural form (3)',
    () => {
      o(t('hits', 3)).equals('3 Hitses')
    }
  )

  o(
    'should return a translated string with the correct plural form (4)',
    () => {
      o(t('hits', 4)).equals('4 Hits')
    }
  )

  o(
    'should return a translated string with the correct plural form and ' +
      'replaced placeholders: t(key, replacements, count)',
    () => {
      o(t('date', { day: '13', year: 2014 }, 2)).equals('13. February 2014')
    }
  )

  o(
    'should return a translated string with the correct plural form and ' +
      'replaced placeholders: t(key, count, replacements)',
    () => {
      o(t('date', 2, { day: '13', year: 2014 })).equals('13. February 2014')
    }
  )

  const placeholders = { name: 'Alice' }
  o('should handle combination of count and named placeholders', () => {
    o(t('comboCounter', 10, placeholders)).equals('Alice is 10 years old.')
    o(t('comboCounter', placeholders, 10)).equals('Alice is 10 years old.')
  })
  o("shouldn't modify the placeholder object", () => {
    o('n' in placeholders).equals(false)
  })

  const nonstringtranslations = {
    foo: 10,
    bar: [],
    baz: {},
    heh: null,
    ooh: true,
    happensToBeString: 'OK',
  }
  const t0 = translate(nonstringtranslations)
  o('should treat any non-string translations as missing', () => {
    o(t0('foo')).equals('foo')
    o(t0('bar')).equals('bar')
    o(t0('baz')).equals('baz')
    o(t0('heh')).equals('heh')
    o(t0('ooh')).equals('ooh')
    o(t0('happensToBeString')).equals('OK')
  })

  // custom isPlural function
  const pluralize_IS = function(n) {
    // Icelandic rules: Numbers ending in 1 are singular - unless ending in 11.
    return n % 10 !== 1 || n % 100 === 11 ? 'p' : 's'
  }
  const t3b = translate(translationsObject, { pluralize: pluralize_IS })
  o('should pluralize (0) correctly in Icelandic', () => {
    o(t3b('icelandicSheep', 0)).equals('Engar kindur')
  })
  o('should pluralize (1) correctly in Icelandic', () => {
    o(t3b('icelandicSheep', 1)).equals('1 kind')
  })
  o('should pluralize (2) correctly in Icelandic', () => {
    o(t3b('icelandicSheep', 2)).equals('2 kindur')
  })
  o('should pluralize (11) correctly in Icelandic', () => {
    o(t3b('icelandicSheep', 11)).equals('11 kindur')
  })
  o('should pluralize (21) correctly in Icelandic', () => {
    o(t3b('icelandicSheep', 21)).equals('21 kind')
  })
  o('should pluralize (29) correctly in Icelandic', () => {
    o(t3b('icelandicSheep', 29)).equals('29 kindur')
  })
  o(
    'should automatically return correct pluralization for negative counts',
    () => {
      o(t3b('icelandicSheep', -21)).equals('-21 kind')
      o(t3b('icelandicSheep', -29)).equals('-29 kindur')
    }
  )
  o(
    'should return explicit pluralization property regardless of pluralization function',
    () => {
      o(t3b('icelandicSheep', 13)).equals('Baaahd luck!')
    }
  )
  o(
    'should not match negative count with its explicitly defined positive counterpart',
    () => {
      o(t3b('icelandicSheep', -13)).equals('-13 kindur')
    }
  )
  o(
    'should default to the `n` key if some/all pluralization keys are missing',
    () => {
      o(t3b('horses', 7)).equals('Pluralization keys are missing')
    }
  )

  o('should ignore count/subkey if translation is a plain string', () => {
    o(t3b('plain', 666)).equals('I like this.')
    o(t3b('plain', 'nonexistentsubkey')).equals('I like this.')
  })
  o(
    'should ignore replacements object if translation is a plain string',
    () => {
      o(t3b('plain', { nonexistentreplacement: 'foo' })).equals('I like this.')
    }
  )
  o('should return the "*" subkey value if no subkey is passed', () => {
    o(t3b('translationWithDefaultSubkey')).equals('I am a default value')
  })
  o('should retry the "*" subkey value if passed subkey is missing', () => {
    o(t3b('translationWithDefaultSubkey', 'nonexistentsubkey')).equals(
      'I am a default value'
    )
    o(t3b('date', 13, { day: '13', year: 2013 })).equals('WAT! 13!?')
  })

  // wrong arguments
  const t4 = translate(translationsObject, 'asd')
  o(
    'should return a translated string with the correct plural form and ' +
      'replaced placeholders: t(key, count, replacements) [wrong optio arg]',
    () => {
      o(t4('date', 2, { day: '13', year: 2014 })).equals('13. February 2014')
    }
  )

  // debug enabled
  const t5 = translate(translationsObject, { debug: true })
  o(
    'should return @@translationKey@@/@@translationKey.subKey@@ if no translation ' +
      'is found and debug is true',
    () => {
      o(t5('nonexistentkey')).equals('@@nonexistentkey@@')
      o(t5('translationWithSubkeys', 'not there')).equals(
        '@@translationWithSubkeys.not there@@'
      )
      o(t5('translationWithSubkeys', 42)).equals(
        '@@translationWithSubkeys.42@@'
      )
      o(t5('nonexistentkey', 42)).equals('@@nonexistentkey.42@@')
    }
  )

  const t6Keys = {
    fruit: '{0} apples, {1} oranges, {2} kiwis',
    bread: '{0} buns, {n} scones',
    items: {
      1: '{0} item ({n})',
      n: '{0} items ({n})',
    },
  }
  const t6 = translate(t6Keys)
  o('should accept placeholder values in arrays', () => {
    o(t6('fruit', ['shiny', 'round'])).equals(
      'shiny apples, round oranges, {2} kiwis'
    )
  })
  o('should mix count and array placeholders', () => {
    o(t6('bread', 7, [10])).equals('10 buns, 7 scones')
    o(t6('bread', [7], 10)).equals('7 buns, 10 scones')
  })
  o('should mix array placeholders and pluralization', () => {
    o(t6('items', 1, ['Happy'])).equals('Happy item (1)')
    o(t6('items', 7, ['Funny'])).equals('Funny items (7)')
  })

  const tXKeys = {
    name: 'English',
    x: {
      13: 'Thirteen',
      99: 'Ninety-nine',
      n: 'Default',
    },
  }
  let tX

  o('should gracefully handle no parameters', () => {
    tX = translate()
    o(tX('name')).equals('name')
    o(tX('x', 1)).equals('x')
  })

  o('should gracefully handle nully (not falsey) parameters', () => {
    tX = translate(undefined, null)
    o(tX('name')).equals('name')
    o(tX('x', 1)).equals('x')
  })

  o('should expose .keys and .opts properties', () => {
    o(tX.keys && typeof tX.keys === 'object').equals(true)
    o(tX.keys && typeof tX.opts === 'object').equals(true)
    o(tX.keys).deepEquals({})
  })

  o('should allow late binding of translation keys', () => {
    tX.keys.foo = 'bar'
    o(tX('foo')).equals('bar')
  })

  o('should allow late binding of all translation keys', () => {
    tX.keys = tXKeys
    o(tX('foo')).equals('foo')
    o(tX('name')).equals('English')
    o(tX('x', 1)).equals('Default')
  })

  o('should allow late binding of pluralization', () => {
    tX.opts.pluralize = function(n) {
      return 99
    }
    o(tX('x', 1)).equals('Ninety-nine')
  })

  o('should gracefully handle completely overloading the opts', () => {
    tX.opts = {
      pluralize: function(n) {
        return 13
      },
    }
    o(tX('x', 1)).equals('Thirteen')
  })

  o('should gracefully handle accidental removal of opts', () => {
    delete tX.opts // Oops!
    o(tX('x', 1)).equals('Default') // no pluralization found
  })

  o('should handle adjacent placeholders', () => {
    const t = translate({ test: '{foo}{bar}' })
    o(t('test', { foo: 'Hello', bar: 'World' })).equals('HelloWorld')
  })

  o(
    'should handle the placeholder tokens used internally by `replacePlaceholders()`',
    () => {
      const t = translate({ test: '{x}' })
      o(t('test', { x: 'HelloWorld' })).equals('HelloWorld')
    }
  )
})

o.spec('Return array option', () => {
  o(
    'should return replacement-token translations as Arrays, when t.arr() is called',
    () => {
      const t = translate({
        test: 'abc {xyz} def',
      })
      o(t.arr('test', { xyz: { foo: 'bar' } })).deepEquals([
        'abc ',
        { foo: 'bar' },
        ' def',
      ])
    }
  )
  o(
    'should return replacement-token translations as Arrays, when `array` option is supplied',
    () => {
      const t = translate(
        {
          test: 'abc {xyz} def',
        },
        { array: true }
      )
      o(t('test', { xyz: { foo: 'bar' } })).deepEquals([
        'abc ',
        { foo: 'bar' },
        ' def',
      ])
    }
  )
  o(
    'should return simple translations as strings, even when t.arr() is called',
    () => {
      const t = translate({
        test1: 'simple',
        test2: { 4: 'simple' },
        test3: { subkey: 'simple' },
      })
      o(t.arr('test1')).deepEquals('simple')
      o(t.arr('test2', 4)).deepEquals('simple')
      o(t.arr('test3', 'subkey')).deepEquals('simple')
    }
  )
})

o.spec('alias usage', () => {
  o('should work with simple translations', () => {
    o(
      translate.resolveAliases({
        A: 'bar',
        B: 'foo {{A}} bar',
      })
    ).deepEquals({
      A: 'bar',
      B: 'foo bar bar',
    })
  })
  o('should work with nested translations', () => {
    o(
      translate.resolveAliases({
        A: 'bar',
        B: 'foo {{A}} bar',
        C: '< {{B}} >',
      })
    ).deepEquals({
      A: 'bar',
      B: 'foo bar bar',
      C: '< foo bar bar >',
    })
  })
  o('should be agnostic to the order of key declarations', () => {
    o(
      translate.resolveAliases({
        C: '< {{B}} >',
        B: 'foo {{A}} bar',
        A: 'bar',
      })
    ).deepEquals(
      translate.resolveAliases({
        A: 'bar',
        B: 'foo {{A}} bar',
        C: '< {{B}} >',
      })
    )
  })
  o('should allow multiple aliases per string', () => {
    o(
      translate.resolveAliases({
        A: 'bar',
        B: 'foo {{A}} {{A}}',
        C: 'foo {{B}} {{A}}',
      })
    ).deepEquals({
      A: 'bar',
      B: 'foo bar bar',
      C: 'foo foo bar bar bar',
    })
  })
  o('should allow complex nesting with multiple aliases per string', () => {
    o(
      translate.resolveAliases({
        A: 'A',
        B: 'B{{A}}B',
        C: 'C{{A}}C',
        D: 'D{{A}}{{B}}{{C}}D',
      })
    ).deepEquals({
      A: 'A',
      B: 'BAB',
      C: 'CAC',
      D: 'DABABCACD',
    })
  })
  o('should work within pluralizations', () => {
    o(
      translate.resolveAliases({
        A: 'bar',
        B: {
          1: '1 {{A}} bar',
          2: '2 {{A}} bar',
          n: 'n {{A}} bar',
        },
      })
    ).deepEquals({
      A: 'bar',
      B: {
        1: '1 bar bar',
        2: '2 bar bar',
        n: 'n bar bar',
      },
    })
  })
  o('should work within subkeys', () => {
    o(
      translate.resolveAliases({
        A: 'bar',
        B: {
          hi: '1 {{A}} bar',
          ho: '2 {{A}} bar',
        },
      })
    ).deepEquals({
      A: 'bar',
      B: {
        hi: '1 bar bar',
        ho: '2 bar bar',
      },
    })
  })
  o('should detect unknown aliases', () => {
    o(() =>
      translate.resolveAliases({
        A: '{{B}}',
      })
    ).throws('No translation for alias "B"')
  })
  o('should detect circle references', () => {
    o(() =>
      translate.resolveAliases({
        A: '{{B}}',
        B: '{{A}}',
      })
    ).throws('Circular reference for "B" detected')
  })
  o('should detect using complex translations (e.g. pluralized ones)', () => {
    o(() =>
      translate.resolveAliases({
        A: {
          1: 'one',
        },
        B: '{{A}}',
      })
    ).throws("You can't alias objects")
  })
  o('should allow targetting subkeys', () => {
    o(
      translate.resolveAliases({
        A: { b: 'bar' },
        B: 'Foo {{A[b]}}',
        C: 'Foo {{A[b]}}',
      })
    ).deepEquals({
      A: { b: 'bar' },
      B: 'Foo bar',
      C: 'Foo bar',
    })
  })
  o('should work with pluralized forms', () => {
    o(
      translate.resolveAliases({
        A: { 1: '1 bar', n: '{n} bars' },
        B: {
          1: '1 Foo {{A[1]}}',
          n: '{n} Foo {{A[n]}}',
        },
      })
    ).deepEquals({
      A: { 1: '1 bar', n: '{n} bars' },
      B: {
        1: '1 Foo 1 bar',
        n: '{n} Foo {n} bars',
      },
    })
  })
  o(
    "should ignore alias' count/subkey if target is a plain string translation",
    () => {
      o(
        translate.resolveAliases({
          A: 'bar',
          B: 'Foo {{A[b]}}',
          C: 'Foo {{A[b]}}',
        })
      ).deepEquals({
        A: 'bar',
        B: 'Foo bar',
        C: 'Foo bar',
      })
    }
  )
  o("should throw when targetted subkeys don't exist", () => {
    o(() =>
      translate.resolveAliases({
        A: { b: 'bar' },
        B: 'Foo {{A[invalidSubkey]}}',
      })
    ).throws('No translation for alias "A[invalidSubkey]"')
  })
  o('should detect circle references in subkeyed targets', () => {
    o(() =>
      translate.resolveAliases({
        A: { a: '{{B}}' },
        B: 'Foo {{A[a]}}',
      })
    ).throws('Circular reference for "B" detected')
    o(() =>
      translate.resolveAliases({
        B: 'Foo {{A[a]}}',
        A: { a: '{{B}}' },
      })
    ).throws('Circular reference for "A[a]" detected')
    o(() =>
      translate.resolveAliases({
        A: { a: '{{B[b]}}' },
        B: { b: '{{A[a]}}' },
      })
    ).throws('Circular reference for "B[b]" detected')
  })
  o('should not auto-resolve aliases when optionsflag is not set', () => {
    const t = translate({
      A: 'bar',
      B: 'foo {{A}} bar',
    })
    o(t('B')).equals('foo {{A}} bar')
  })
  o('should auto-resolve aliases when optionsflag is set', () => {
    const t = translate(
      {
        A: 'bar',
        B: 'foo {{A}} bar',
      },
      {
        resolveAliases: true,
      }
    )
    o(t('B')).equals('foo bar bar')
  })
})
