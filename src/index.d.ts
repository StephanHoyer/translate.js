// Type definitions for translate.js 1.2.4
// Project: https://github.com/StephanHoyer/translate.js#readme
// Definitions by: Kurounin <https://github.com/Kurounin>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped
// TypeScript Version: 2.8

interface WildCard {
  '*': string
}

type translateFunc1<M extends Messages, T> = <K extends keyof M>(
  key: M[K] extends string ? K : never
) => T
type translateFunc2<M extends Messages, T> = <K extends keyof M>(
  key: K,
  params: M[K] extends string ? object : never
) => T
type translateFunc3<M extends Messages, T> = <K extends keyof M>(
  key: K,
  subKey: M[K] extends object
    ? (M[K] extends WildCard ? string : keyof M[K]) | number
    : number,
  params?: object
) => T
type translateFunc4<M extends Messages, T> = <K extends keyof M>(
  key: K,
  params: object,
  subKey: M[K] extends object
    ? (M[K] extends WildCard ? string : keyof M[K]) | number
    : number
) => T

import { pluralizer } from './plurals'

export interface Options {
  debug?: boolean
  array?: boolean
  resolveAliases?: boolean
  pluralize?: pluralizer
  useKeyForMissingTranslation?: boolean
}

export interface ArrayOptions extends Options {
  array: true
}

export interface Messages {
  [key: string]: string | Record<string | number, string>
}

export type Translate<
  M extends Messages,
  T extends ArrayOptions | Options,
  R = T extends ArrayOptions ? any[] : string
> = {
  keys: M
  arr: translateFunc1<M, any[]> &
    translateFunc2<M, any[]> &
    translateFunc3<M, any[]> &
    translateFunc4<M, any[]>
  opts: T
} & translateFunc1<M, R> &
  translateFunc2<M, R> &
  translateFunc3<M, R> &
  translateFunc4<M, R>

type translateJsFunc1 = <M extends Messages>(
  messages: M
) => Translate<M, Options>
type translateJsFunc2 = <M extends Messages>(
  messages: M,
  options: ArrayOptions
) => Translate<M, ArrayOptions>
type translateJsFunc3 = <M extends Messages>(
  messages: M,
  options: Options
) => Translate<M, Options>

type translateJs = {
  resolveAliases: <M extends Messages>(messages: M) => M
} & translateJsFunc1 &
  translateJsFunc2 &
  translateJsFunc3

declare const translate: translateJs

export default translate
