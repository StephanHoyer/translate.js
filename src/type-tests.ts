// This file is only to check if the TypeScript definitions are behaving ok.

import translate from './index'
import { plural_EN } from './plurals'

const opts = { pluralize: plural_EN }

const messages = {
  greeting: 'Hello',
  defaultName: 'World',
  foo: {
    bar: 'asdf',
  },
  foot: {
    1: 'bar',
    2: 'baz',
  },
  foos: 'bhasd',
  results: {
    s: '{n} result for „{q}“',
    p: '{n} results for „{q}“',
  } as Record<'s' | 'p', string>,
  wildcard: {
    '*': 'default',
  },
}

const t = translate(messages, opts)

let s: string

s = t('foo', 'bar')
s = t('foo', 'bar', { n: 2 })
s = t('foo', { n: 2 }, 'bar')
s = t('defaultName')
s = t('foos', { n: 2 })
s = t('results', 3)
s = t('results', 3, { q: 'foo' })
s = t('results', { q: 'foo' }, 3)
s = t('wildcard', 'foo')

// ExpectError
t('foo', 'barf', { n: 2 })
// ExpectError
t('foo', { n: 2 }, 'barf')
// ExpectError
t('foo', 'barss')
// ExpectError
t('foo')
