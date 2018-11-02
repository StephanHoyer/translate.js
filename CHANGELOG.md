# Change Log for Translate.js


## Upcoming...
<!-- Add features here -->
* ...



## 1.2.2
_2018-10-24_
* feat: Add `.d.ts` TypeScript type annotations ([#66](https://github.com/StephanHoyer/translate.js/pull/66))



## 1.2.1
_2018-09-27_
* No changes. Minor dependency updates.



## 1.2.0
_2018-09-20_
* feat: Add `useKeyForMissingTranslation` option to return `undefined` for missing translations



## 1.1.2
_2018-07-19_
* No changes. Minor dependency updates.



## 1.1.1
_2018-05-31_
* fix: Publish CommonJS module in ES5 syntax ([#48](https://github.com/StephanHoyer/translate.js/pull/48))



## 1.1.0
_2018-05-04_
* feat: Support default/"wild-card" `*` subkeys as fallback for missing subkey translations ([#37](https://github.com/StephanHoyer/translate.js/pull/37))



## 1.0.0
_2018-04-26_
* [BREAKING] chore: Drop support for direct `<script>` loading in browsers. (Only provide ES6 module and CommonJs module.)
* [BREAKING] chore: Convert the module to ES6 syntax.
* chore: Add Prettier auto-formatting and improved build and test scripts



## 0.7.1
_2018-04-19_
* feat: Support translation-keys written as inlined default translation ([#40](https://github.com/StephanHoyer/translate.js/pull/40))



## 0.7.0
_2017-03-09_
* feat: Support `{{aliases[withSubkeys]}}` pattern ([#33](https://github.com/StephanHoyer/translate.js/pull/33))
* docs/tests: Improve documentation and test support



## 0.6.0
_2017-01-05_
* feat: Support `{{aliases}}` within translation keys via a `translatejs.resolveAliases` pre-parser ([#31](https://github.com/StephanHoyer/translate.js/pull/31))
* feat: Add a few more pluralizer functions ([e60c7cf](https://github.com/StephanHoyer/translate.js/commit/e60c7cf08663cd0202eb8e513a24c878232f4221))



## 0.5.0
_2016-10-26_
* feat: Support translations with subkeys as strings, not just numerical `count` ([#27](https://github.com/StephanHoyer/translate.js/pull/27))
* docs/tests:Improve tests and documentation



## 0.4.1
_2016-01-30_
* refactor: Improve performance of `t.arr()` function ([#22](https://github.com/StephanHoyer/translate.js/pull/22))



## 0.4.0
_2016-01-29_
* feat: Add support for inserting VDOM/JSX nodes into translation results via `t.arr()` ([#21](https://github.com/StephanHoyer/translate.js/pull/21))



## 0.3.2
_2016-01-29_
* docs/style: Minor documentation changes and code-cleanup



## 0.3.1
_2015-12-18_
* style: Convert to Standard.js formatting



## 0.3.0
_2015-12-18_
* [BREAKING] Drop support for "namespaced" translation keys ([#15](https://github.com/StephanHoyer/translate.js/pull/15))



## 0.2.3
_2015-12-18_
* chore: Badges!



## 0.2.2
_2015-07-28_

* refactor: Speed up replacement-key processing



## 0.2.1
_2015-07-25_

* refactor: Massive performance improvements
* feat: Expose as `window.translatejs` in browsers



## 0.2.0
_2015-07-23_

* refactor: Improve performance on simple strings
* [BREAKING] feat: Make default pluralization functions return `s`,`p` instead of numerical tokens;
* feat: Resolve all namespacing ambiguities by making literal translation keys highest priority
* tests: Add tests to clarify behavior



## 0.1.0
_2015-06-17_

* fix: Improve handling/logging of missing translation keys
* fix: Make explicit `count` keys override pluralization function result
* feat: Add example pluralization functions (EN,IS)
* docs: Improved documentation



## 0.0.3
_2015-06-17_

* feat: Support custom pluralization functions  ([e66a590](https://github.com/StephanHoyer/translate.js/commit/e66a59009a73013a3669af3c81eaeab29e28c8d1))
* style: Code cleanup
* Initial release based on an early version of [musterknabe/translate.js](https://github.com/musterknabe/translate.js)


