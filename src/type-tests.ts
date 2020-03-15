// This file is only to check if the TypeScript definitions are behaving ok.

import translate from './index'

const t = translate({
  greeting: 'Hello',
  defaultName: 'World',
  foo: {
    bar: 'asdf',
  },
  foos: 'bhasd',
})

let s: string

s = t('foo', 'bar')
s = t('foo', 'bar', { n: 2 })
s = t('foo', { n: 2 }, 'bar')
s = t('defaultName')
s = t('foos', { n: 2 })

// ExpectError
t('foo', 'barf', { n: 2 })
// ExpectError
t('foo', { n: 2 }, 'barf')
// ExpectError
t('foo', 'barss')
// ExpectError
t('foo')
