[![Build Status](https://travis-ci.org/StephanHoyer/translate.js.svg)](https://travis-ci.org/StephanHoyer/translate.js)
[![rethink.js](https://img.shields.io/badge/rethink-js-yellow.svg)](https://github.com/rethinkjs/manifest)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)
![](http://img.badgesize.io/StephanHoyer/translate.js/master/index.js.svg?compression=gzip)

translate.js
============

Javascript micro library for translations (i18n) with support for placeholders and multiple plural forms.


Installation:
------

```sh
npm install translate.js
```

Usage:
------

```JavaScript
import translate from 'translate.js'
// var translate = require('translate.js')

var messages = {
    translationKey: 'Translation value'
}

var options = {
    // These are the defaults:
    debug: false,  //[Boolean]: Logs missing translations to console and add "@@" around output, if `true`.
    array: false,  //[Boolean]: Returns translations with placeholder-replacements as Arrays, if `true`.
    resolveAliases: false,  //[Boolean]: Parses all translations for aliases and replaces them, if `true`.
    pluralize: function(n, translationKey){ return Math.abs(n) }  //[Function(count, translationKey)]: Provides a custom pluralization mapping function, should return a number
}

var t = translate(messages, [options])

t('translationKey')
t('translationKey', subkey)
t('translationKey', {replaceKey: 'replacevalue'})
t('translationKey', subkey, {replaceKey: 'replacevalue'})
t('translationKey', {replaceKey: 'replacevalue'}, subkey)

```

Example:
--------

First create a language specific object for your translations:

```JavaScript
var messages = {
    like: 'I like this.',
    likeThing: 'I like {thing}!',
    likeTwoThings: 'I like {0} and {1}!',
    simpleCounter: 'The count is {n}.',
    hits: {
        0: 'No Hits',
        1: '{n} Hit',
        2: '{n} Hitse',  //some slavic langs have multiple plural forms
        3: '{n} Hitses', //some slavic langs have multiple plural forms
        n: '{n} Hits', // default for other numbers
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
    },
    saveButton: {
        label: 'Save',
        tooltip: 'Save unsaved changes',
    },
    simpleButton: 'Simple',

    hasDefaultSubkey: {
        foo: 'Foo subkey value',
        '*': 'Default value',
    },

    'Prosa Key': 'This is prosa!',  

}
```

Then bind the translation function to something short:
```JavaScript
import translate from 'translate.js'
// var translate = require('translate.js')
var t = translate(messages)
```

And use it like this:
```JavaScript
//simple
t('like') === 'I like this.'
t('Prosa Key') === 'This is prosa!'

//placeholders - named
t('likeThing', {thing: 'the Sun'}) === 'I like the Sun!'
//placeholders - array
t('likeTwoThings', ['Alice', 'Bob']) === 'I like Alice and Bob!'

//subkeys
t('saveButton', 'label') === 'Save'
t('saveButton', 'tooltip') === 'Save unsaved changes'

//simple translations ignore subkeys
t('simpleButton', 'label') === 'Simple'
t('simpleButton', 'tooltip') === 'Simple'

//default '*' subkey
t('hasDefaultSubkey', 'foo') === 'Foo subkey value'
t('hasDefaultSubkey', 'missing') === 'Default value'
t('hasDefaultSubkey') === 'Default value'


//numerical subkeys (count)
t('simpleCounter', 25) === 'The count is 25'
t('hits', 0) === 'No Hits'
t('hits', 1) === '1 Hit'
t('hits', 3) === '3 Hitses'
t('hits', 99) === '99 Hits'

//combined count/subkey and placeholders
t('date', 2, {day: '13', year: 2014}) === '13. February 2014'
```

It is flexible, so you can add/replace translations after the fact by modifying the `.keys` property, like so:

```js
//add/update keys
t.keys['add-key'] = 'Sorry I am late!'
t('add-key') === 'Sorry I am late!'

//replace keys object
t.keys = { 'new-key': 'All is new!' }
t('new-key') === 'All is new!'
t('add-key') === 'add-key' // (No longer translated)
t('like') === 'like'       // (No longer translated)
```

Immutability can be achieved with a simple wrapper:

```js
var t2 = function () {
    return t.apply(null,arguments)
}
```




### Pluralization

You can also do customized pluralization selection, like this:

```js
var messages_IS = {
    sheep: {
        0: 'Engar kindur',
        s: '{n} kind',
        p: '{n} kindur',
        13: 'Baaahd luck!',
    }
}
var pluralize_IS = function ( n, translationKey ) {
    // Icelandic rules: Numbers ending in 1 are singular - unless ending in 11.
    return (n%10 !== 1 || n%100 === 11) ? 'p' : 's'
}
var t = translate( messages_IS, {
    pluralize: pluralize_IS
})
```

With this setup, all failed numerical subkey lookups get passed through the pluralization function and the return value (in this case either 's' or 'p')
is then used as a subkey, like so.

```js
t('sheep', 0) === 'Engar kindur' // direct subkey hit takes precedence
t('sheep', 1) === '1 kind'  // pluralize_IS(1) === 's' 
t('sheep', 2) === '2 kindur'  // pluralize_IS(2) === 'p' 
t('sheep', 21) === '21 kind'  // pluralize_IS(21) === 's'
t('sheep', 13) === 'Baaahd luck'  // direct subkey hit 
```

Translate.js comes with a predefined `pluralize` functions for [several languages](plurals.js). These can be imported into your code as needed, like so:

```js
import { plural_IS } from 'translate.js/plurals'
// var plural_IS = require('translate.js/pluralize/is')
var t = translate( messages_IS, {
    pluralize: plural_IS
})
```

Here's a large list of [pluralization algorithms by language](http://docs.translatehouse.org/projects/localization-guide/en/latest/l10n/pluralforms.html?id=l10n/pluralforms).

## Aliases

Sometimes it's useful to have aliases for certain translations or to even reference
translations inside other ones. This is possible with the `translate.resolveAliases(translationsObj)` function
which returns a new translations object with all instances of `{{aliasedTranslationKey}}` in translation strings replaced with the corrsponding translation value:

```js
var messages = translate.resolveAliases({
  supportButton: 'Support Chat',
  supportDirections: 'Please use the {{supportButton}}',
  faq_supportChat: '...and then click the "{{supportButton}}" button below the text "{{supportDirections}}".'
})
var t = translate(messages)

t('faq_supportChat')
// => '...and then click the "Support Chat" button below the text "Please use the Support Chat".'
```

As seen in the example above, recursive aliases can be nested just fine.

Subkeys can be aliased by using a `{{key[subkey]}}` syntax, and such lookups
behave much the same as normal subkey lookups do.

```js
var messages = translate.resolveAliases({
  button1: { label: 'Save',  tooltip: 'Save Changes' },
  button2: 'Cancel',
  text1: 'Click the "{{button1[label]}}" button when done.',
  text2: 'Click the "{{button2[label]}}" button to exit.'
})
var t = translate(messages)

t('text1') === 'Click the "Save" button when done.'
t('text2') === 'Click the "Cancel" button to exit.'
```

This also works with pluralized translations. Nothing is done automatically
though. You have to define the counts explicitly.

```js
var messages = translate.resolveAliases({
  thing: {
    1: 'one thing',
    n: '{n} things'
  },
  other: {
    1: 'other {{thing[1]}}',
    n: 'other {{thing[n]}}',
  }
})
var t = translate(messages)

t('other', 2) === 'other 2 things'
```

**Note:** You can set an options flag to do this automatically during
initializisation. (This one-time operation causes no additional overhead during runtime.)

```js
var t = translate(messages, {
  resolveAliases: true
})

```


## Working with VDOM libraries

If you work with VDOM-libraries such as [mithril.js](http://mithril.js.org/) you sometimes want to include VDOM nodes into the translation. This is possible
by using the `arr`-helper. It does not convert the translation result to a
string but rather returns an array with all the placeholder-replacements left intact.

```js
var keys = { test: 'abc {fancyImage} def' }
var t = translate(keys)

t.arr('test', {
  fancyImage: m('img', { src: 'image.jpg' })
})
// results in ['abc ', { tag: 'img', ... }, ' def']
```

You can also set this as the default behaviour, by supplying `array:true` option when initializing the translation function.

```js
 t = translate(keys, { array: true })

t('test', {
  fancyImage: m('img', { src: 'image.jpg' })
})
// results in ['abc ', { tag: 'img', ... }, ' def']
```

## Namespace-Support

Namespace support was dropped in version 0.3.0. If you need it, use [version 0.2.2](https://github.com/StephanHoyer/translate.js/tree/v0.2.2).
