// Type definitions for translate.js 1.2.1
// Project: https://github.com/StephanHoyer/translate.js#readme
// Definitions by: Kurounin <https://github.com/Kurounin>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped
// TypeScript Version: 2.8

interface Params {
    [key: string]: string;
}

export interface Messages {
    [key: string]: string | Messages;
    [key: number]: string | Messages;
}

type translateFunc1<T> = (key: string) => T;
type translateFunc2<T> = (key: string, subKey: number | string) => T;
type translateFunc3<T> = (key: string, params: Params) => T;
type translateFunc4<T> = (key: string, subKey: number | string, params: Params) => T;
type translateFunc5<T> = (key: string, params: Params, subKey: number | string) => T;

export interface Options {
	debug?: boolean;
	array?: boolean;
	resolveAliases?: boolean;
	pluralize?: (n: number, translationKey: string) => number | string;
	useKeyForMissingTranslation?: boolean;
}

export interface ArrayOptions extends Options {
    array: true;
}

export type Translate<T extends ArrayOptions | Options> = {
	keys: Messages;
    arr: translateFunc1<any[]> & translateFunc2<any[]> & translateFunc3<any[]> & translateFunc4<any[]> & translateFunc5<any[]>;
	opts: T;
}
    & translateFunc1<T extends ArrayOptions ? any[] : string>
    & translateFunc2<T extends ArrayOptions ? any[] : string>
    & translateFunc3<T extends ArrayOptions ? any[] : string>
    & translateFunc4<T extends ArrayOptions ? any[] : string>
    & translateFunc5<T extends ArrayOptions ? any[] : string>;

type translateJsFunc1 = (messages: Messages) => Translate<Options>;
type translateJsFunc2 = (messages: Messages, options: ArrayOptions) => Translate<ArrayOptions>;
type translateJsFunc3 = (messages: Messages, options: Options) => Translate<Options>;

type translateJs = {
    resolveAliases: (messages: Messages) => Messages;
} & translateJsFunc1 & translateJsFunc2 & translateJsFunc3;

declare const translate: translateJs;

export default translate;
