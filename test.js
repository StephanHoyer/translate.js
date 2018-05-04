'use strict'

/* global require, describe, it */
const translate = require('.')
const expect = require('expect.js')

describe('translate.js', () => {
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

  it('should return translationKey if no translation is found', () => {
    expect(t('nonexistentkey')).to.equal('nonexistentkey')
  })

  it('should return a translated string', () => {
    expect(t('plain')).to.equal('I like this.')
  })

  it('should return a translated string for prosa keys', () => {
    expect(t('Prosa Key')).to.equal('This is prosa!')
  })

  it('should return a translated string and replace a placeholder ', () => {
    expect(t('like', { thing: 'Sun' })).to.equal('I like Sun!')
  })

  it('should return a not-translated string and replace a placeholder ', () => {
    expect(t('This {thing} not translated, yet', { thing: 'string' })).to.equal(
      'This string not translated, yet'
    )
  })

  it('should return a translated string and show missing placeholders', () => {
    expect(t('like')).to.equal('I like {thing}!')
  })

  it('should return a translated string and replace a count', () => {
    expect(t('simpleCounter', 25)).to.equal('The count is 25.')
  })

  it('should return a translated string according to a potential dynamic subkey', () => {
    const dynamicSubKey = 'foo'
    expect(t('translationWithSubkeys', dynamicSubKey)).to.equal('FOO')
  })

  it('should return a translated string with the correct plural form (0)', () => {
    expect(t('hits', 0)).to.equal('No Hits')
  })

  it('should return a translated string with the correct plural form (1)', () => {
    expect(t('hits', 1)).to.equal('1 Hit')
  })

  it('should return a translated string with the correct plural form (2)', () => {
    expect(t('hits', 2)).to.equal('2 Hitse')
  })

  it('should return a translated string with the correct plural form (3)', () => {
    expect(t('hits', 3)).to.equal('3 Hitses')
  })

  it('should return a translated string with the correct plural form (4)', () => {
    expect(t('hits', 4)).to.equal('4 Hits')
  })

  it('should return a translated string with the correct plural form and replaced placeholders: t(key, replacements, count)', () => {
    expect(t('date', { day: '13', year: 2014 }, 2)).to.equal(
      '13. February 2014'
    )
  })

  it('should return a translated string with the correct plural form and replaced placeholders: t(key, count, replacements)', () => {
    expect(t('date', 2, { day: '13', year: 2014 })).to.equal(
      '13. February 2014'
    )
  })

  const placeholders = { name: 'Alice' }
  it('should handle combination of count and named placeholders', () => {
    expect(t('comboCounter', 10, placeholders)).to.equal(
      'Alice is 10 years old.'
    )
    expect(t('comboCounter', placeholders, 10)).to.equal(
      'Alice is 10 years old.'
    )
  })
  it("shouldn't modify the placeholder object", () => {
    expect('n' in placeholders).to.equal(false)
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
  it('should treat any non-string translations as missing', () => {
    expect(t0('foo')).to.equal('foo')
    expect(t0('bar')).to.equal('bar')
    expect(t0('baz')).to.equal('baz')
    expect(t0('heh')).to.equal('heh')
    expect(t0('ooh')).to.equal('ooh')
    expect(t0('happensToBeString')).to.equal('OK')
  })

  // custom isPlural function
  const pluralize_IS = function(n /*, tarlationKey*/) {
    // Icelandic rules: Numbers ending in 1 are singular - unless ending in 11.
    return n % 10 !== 1 || n % 100 === 11 ? 'p' : 's'
  }
  const t3b = translate(translationsObject, { pluralize: pluralize_IS })
  it('should pluralize (0) correctly in Icelandic', () => {
    expect(t3b('icelandicSheep', 0)).to.equal('Engar kindur')
  })
  it('should pluralize (1) correctly in Icelandic', () => {
    expect(t3b('icelandicSheep', 1)).to.equal('1 kind')
  })
  it('should pluralize (2) correctly in Icelandic', () => {
    expect(t3b('icelandicSheep', 2)).to.equal('2 kindur')
  })
  it('should pluralize (11) correctly in Icelandic', () => {
    expect(t3b('icelandicSheep', 11)).to.equal('11 kindur')
  })
  it('should pluralize (21) correctly in Icelandic', () => {
    expect(t3b('icelandicSheep', 21)).to.equal('21 kind')
  })
  it('should pluralize (29) correctly in Icelandic', () => {
    expect(t3b('icelandicSheep', 29)).to.equal('29 kindur')
  })
  it('should automatically return correct pluralization for negative counts', () => {
    expect(t3b('icelandicSheep', -21)).to.equal('-21 kind')
    expect(t3b('icelandicSheep', -29)).to.equal('-29 kindur')
  })
  it('should return explicit pluralization property regardless of pluralization function', () => {
    expect(t3b('icelandicSheep', 13)).to.equal('Baaahd luck!')
  })
  it('should not match negative count with its explicitly defined positive counterpart', () => {
    expect(t3b('icelandicSheep', -13)).to.equal('-13 kindur')
  })
  it('should default to the `n` key if some/all pluralization keys are missing', () => {
    expect(t3b('horses', 7)).to.equal('Pluralization keys are missing')
  })

  it('should ignore count/subkey if translation is a plain string', () => {
    expect(t3b('plain', 666)).to.equal('I like this.')
    expect(t3b('plain', 'nonexistentsubkey')).to.equal('I like this.')
  })
  it('should ignore replacements object if translation is a plain string', () => {
    expect(t3b('plain', { nonexistentreplacement: 'foo' })).to.equal(
      'I like this.'
    )
  })
  it('should return the "*" subkey value if no subkey is passed', () => {
    expect(t3b('translationWithDefaultSubkey')).to.equal('I am a default value')
  })
  it('should retry the "*" subkey value if passed subkey is missing', () => {
    expect(t3b('translationWithDefaultSubkey', 'nonexistentsubkey')).to.equal(
      'I am a default value'
    )
    expect(t3b('date', 13, { day: '13', year: 2013 })).to.equal('WAT! 13!?')
  })

  // wrong arguments
  const t4 = translate(translationsObject, 'asd')
  it('should return a translated string with the correct plural form and replaced placeholders: t(key, count, replacements) [wrong optio arg]', () => {
    expect(t4('date', 2, { day: '13', year: 2014 })).to.equal(
      '13. February 2014'
    )
  })

  // debug enabled
  const t5 = translate(translationsObject, { debug: true })
  it('should return @@translationKey@@/@@translationKey.subKey@@ if no translation is found and debug is true', () => {
    expect(t5('nonexistentkey')).to.equal('@@nonexistentkey@@')
    expect(t5('translationWithSubkeys', 'not there')).to.equal(
      '@@translationWithSubkeys.not there@@'
    )
    expect(t5('translationWithSubkeys', 42)).to.equal(
      '@@translationWithSubkeys.42@@'
    )
    expect(t5('nonexistentkey', 42)).to.equal('@@nonexistentkey.42@@')
  })

  const t6Keys = {
    fruit: '{0} apples, {1} oranges, {2} kiwis',
    bread: '{0} buns, {n} scones',
    items: {
      1: '{0} item ({n})',
      n: '{0} items ({n})',
    },
  }
  const t6 = translate(t6Keys)
  it('should accept placeholder values in arrays', () => {
    expect(t6('fruit', ['shiny', 'round'])).to.equal(
      'shiny apples, round oranges, {2} kiwis'
    )
  })
  it('should mix count and array placeholders', () => {
    expect(t6('bread', 7, [10])).to.equal('10 buns, 7 scones')
    expect(t6('bread', [7], 10)).to.equal('7 buns, 10 scones')
  })
  it('should mix array placeholders and pluralization', () => {
    expect(t6('items', 1, ['Happy'])).to.equal('Happy item (1)')
    expect(t6('items', 7, ['Funny'])).to.equal('Funny items (7)')
  })

  const tXKeys = {
    name: 'English',
    x: {
      13: 'Thirteen',
      99: 'Ninety-nine',
      n: 'Default',
    },
  }
  const tX

  it('should gracefully handle no parameters', () => {
    tX = translate()
    expect(tX('name')).to.equal('name')
    expect(tX('x', 1)).to.equal('x')
  })

  it('should gracefully handle nully (not falsey) parameters', () => {
    tX = translate(undefined, null)
    expect(tX('name')).to.equal('name')
    expect(tX('x', 1)).to.equal('x')
  })

  it('should expose .keys and .opts properties', () => {
    expect(tX.keys).to.be.an('object')
    expect(tX.opts).to.be.an('object')
    expect(tX.keys).to.eql({})
  })

  it('should allow late binding of translation keys', () => {
    tX.keys.foo = 'bar'
    expect(tX('foo')).to.equal('bar')
  })

  it('should allow late binding of translation keys', () => {
    tX.keys = tXKeys
    expect(tX('foo')).to.equal('foo')
    expect(tX('name')).to.equal('English')
    expect(tX('x', 1)).to.equal('Default')
  })

  it('should allow late binding of pluralization', () => {
    tX.opts.pluralize = function(n) {
      return 99
    }
    expect(tX('x', 1)).to.equal('Ninety-nine')
  })

  it('should gracefully handle completely overloading the opts', () => {
    tX.opts = {
      pluralize: function(n) {
        return 13
      },
    }
    expect(tX('x', 1)).to.equal('Thirteen')
  })

  it('should gracefully handle accidental removal of opts', () => {
    delete tX.opts // Oops!
    expect(tX('x', 1)).to.equal('Default') // no pluralization found
  })

  it('should handle adjacent placeholders', () => {
    const t = translate({ test: '{foo}{bar}' })
    expect(t('test', { foo: 'Hello', bar: 'World' })).to.equal('HelloWorld')
  })

  it('should handle the placeholder tokens used internally by `replacePlaceholders()`', () => {
    const t = translate({ test: '{x}' })
    expect(t('test', { x: 'HelloWorld' })).to.equal('HelloWorld')
  })
})

describe('Return array option', () => {
  it('should return replacement-token translations as Arrays, when t.arr() is called', () => {
    const t = translate({
      test: 'abc {xyz} def',
    })
    expect(t.arr('test', { xyz: { foo: 'bar' } })).to.eql([
      'abc ',
      { foo: 'bar' },
      ' def',
    ])
  })
  it('should return replacement-token translations as Arrays, when `array` option is supplied', () => {
    const t = translate(
      {
        test: 'abc {xyz} def',
      },
      { array: true }
    )
    expect(t('test', { xyz: { foo: 'bar' } })).to.eql([
      'abc ',
      { foo: 'bar' },
      ' def',
    ])
  })
  it('should return simple translations as strings, even when t.arr() is called', () => {
    const t = translate({
      test1: 'simple',
      test2: { 4: 'simple' },
      test3: { subkey: 'simple' },
    })
    expect(t.arr('test1')).to.eql('simple')
    expect(t.arr('test2', 4)).to.eql('simple')
    expect(t.arr('test3', 'subkey')).to.eql('simple')
  })
})

describe('alias usage', () => {
  it('should work with simple translations', () => {
    expect(
      translate.resolveAliases({
        A: 'bar',
        B: 'foo {{A}} bar',
      })
    ).to.eql({
      A: 'bar',
      B: 'foo bar bar',
    })
  })
  it('should work with nested translations', () => {
    expect(
      translate.resolveAliases({
        A: 'bar',
        B: 'foo {{A}} bar',
        C: '< {{B}} >',
      })
    ).to.eql({
      A: 'bar',
      B: 'foo bar bar',
      C: '< foo bar bar >',
    })
  })
  it('should be agnostic to the order of key declarations', () => {
    expect(
      translate.resolveAliases({
        C: '< {{B}} >',
        B: 'foo {{A}} bar',
        A: 'bar',
      })
    ).to.eql(
      translate.resolveAliases({
        A: 'bar',
        B: 'foo {{A}} bar',
        C: '< {{B}} >',
      })
    )
  })
  it('should allow multiple aliases per string', () => {
    expect(
      translate.resolveAliases({
        A: 'bar',
        B: 'foo {{A}} {{A}}',
        C: 'foo {{B}} {{A}}',
      })
    ).to.eql({
      A: 'bar',
      B: 'foo bar bar',
      C: 'foo foo bar bar bar',
    })
  })
  it('should allow complex nesting with multiple aliases per string', () => {
    expect(
      translate.resolveAliases({
        A: 'A',
        B: 'B{{A}}B',
        C: 'C{{A}}C',
        D: 'D{{A}}{{B}}{{C}}D',
      })
    ).to.eql({
      A: 'A',
      B: 'BAB',
      C: 'CAC',
      D: 'DABABCACD',
    })
  })
  it('should work within pluralizations', () => {
    expect(
      translate.resolveAliases({
        A: 'bar',
        B: {
          1: '1 {{A}} bar',
          2: '2 {{A}} bar',
          n: 'n {{A}} bar',
        },
      })
    ).to.eql({
      A: 'bar',
      B: {
        1: '1 bar bar',
        2: '2 bar bar',
        n: 'n bar bar',
      },
    })
  })
  it('should work within subkeys', () => {
    expect(
      translate.resolveAliases({
        A: 'bar',
        B: {
          hi: '1 {{A}} bar',
          ho: '2 {{A}} bar',
        },
      })
    ).to.eql({
      A: 'bar',
      B: {
        hi: '1 bar bar',
        ho: '2 bar bar',
      },
    })
  })
  it('should detect unknown aliases', () => {
    expect(() =>
      translate.resolveAliases({
        A: '{{B}}',
      })
    ).to.throwException((e) => {
      expect(e.message).to.be('No translation for alias "B"')
    })
  })
  it('should detect circle references', () => {
    expect(() =>
      translate.resolveAliases({
        A: '{{B}}',
        B: '{{A}}',
      })
    ).to.throwException((e) => {
      expect(e.message).to.be('Circular reference for "B" detected')
    })
  })
  it('should detect using complex translations (e.g. pluralized ones)', () => {
    expect(() =>
      translate.resolveAliases({
        A: {
          1: 'one',
        },
        B: '{{A}}',
      })
    ).to.throwException((e) => {
      expect(e.message).to.be("You can't alias objects")
    })
  })
  it('should allow targetting subkeys', () => {
    expect(
      translate.resolveAliases({
        A: { b: 'bar' },
        B: 'Foo {{A[b]}}',
        C: 'Foo {{A[b]}}',
      })
    ).to.eql({
      A: { b: 'bar' },
      B: 'Foo bar',
      C: 'Foo bar',
    })
  })
  it('should work with pluralized forms', () => {
    expect(
      translate.resolveAliases({
        A: { 1: '1 bar', n: '{n} bars' },
        B: {
          1: '1 Foo {{A[1]}}',
          n: '{n} Foo {{A[n]}}',
        },
      })
    ).to.eql({
      A: { 1: '1 bar', n: '{n} bars' },
      B: {
        1: '1 Foo 1 bar',
        n: '{n} Foo {n} bars',
      },
    })
  })
  it("should ignore alias' count/subkey if target is a plain string translation", () => {
    expect(
      translate.resolveAliases({
        A: 'bar',
        B: 'Foo {{A[b]}}',
        C: 'Foo {{A[b]}}',
      })
    ).to.eql({
      A: 'bar',
      B: 'Foo bar',
      C: 'Foo bar',
    })
  })
  it("should throw when targetted subkeys don't exist", () => {
    expect(() =>
      translate.resolveAliases({
        A: { b: 'bar' },
        B: 'Foo {{A[invalidSubkey]}}',
      })
    ).to.throwException((e) => {
      expect(e.message).to.be('No translation for alias "A[invalidSubkey]"')
    })
  })
  it('should detect circle references in subkeyed targets', () => {
    expect(() =>
      translate.resolveAliases({
        A: { a: '{{B}}' },
        B: 'Foo {{A[a]}}',
      })
    ).to.throwException((e) => {
      expect(e.message).to.be('Circular reference for "B" detected')
    })
    expect(() =>
      translate.resolveAliases({
        B: 'Foo {{A[a]}}',
        A: { a: '{{B}}' },
      })
    ).to.throwException((e) => {
      expect(e.message).to.be('Circular reference for "A[a]" detected')
    })
    expect(() =>
      translate.resolveAliases({
        A: { a: '{{B[b]}}' },
        B: { b: '{{A[a]}}' },
      })
    ).to.throwException((e) => {
      expect(e.message).to.be('Circular reference for "B[b]" detected')
    })
  })
  it('should not auto-resolve aliases when optionsflag is not set', () => {
    const t = translate({
      A: 'bar',
      B: 'foo {{A}} bar',
    })
    expect(t('B')).to.be('foo {{A}} bar')
  })
  it('should auto-resolve aliases when optionsflag is set', () => {
    const t = translate(
      {
        A: 'bar',
        B: 'foo {{A}} bar',
      },
      {
        resolveAliases: true,
      }
    )
    expect(t('B')).to.be('foo bar bar')
  })
})
