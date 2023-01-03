// Here's a large list of pluralization algorithms by language:
// http://docs.translatehouse.org/projects/localization-guide/en/latest/l10n/pluralforms.html?id=l10n/pluralforms).

/*
  // Convention for return values
  type ReturnValues =
    | 'z' // zero  (e.g. 0 in Arabic)
    | 's' // singular
    | 'd' // dual  (e.g. 2 in Hebrew, Arabic)
    | 'f' // few   (e.g. 2,3,4 in Polish and Czech)
    | 'p' // plural/other
    | 'm' // many  (e.g. 102, in Arabic)
*/

const none = (n) => 'n'
const p_ne_1 = (n) => (n !== 1 ? 'p' : 's')
const p_gt_1 = (n) => (n > 1 ? 'p' : 's')

export const plural_AR = (n) =>
  n == 0
    ? 'z'
    : n == 1
    ? 's'
    : n == 2
    ? 'd'
    : n % 100 >= 3 && n % 100 <= 10
    ? 'f'
    : n % 100 >= 11
    ? 'p'
    : 'm'
export const plural_CS = (n) => (n == 1 ? 's' : n >= 2 && n <= 4 ? 'p' : 'f')
export const plural_DA = p_ne_1
export const plural_DE = p_ne_1
export const plural_EN = p_ne_1
export const plural_ES = p_ne_1
export const plural_FI = p_gt_1
export const plural_FO = p_gt_1
export const plural_FR = p_gt_1
export const plural_IS = (n) => (n % 10 !== 1 || n % 100 === 11 ? 'p' : 's')
export const plural_IT = p_ne_1
export const plural_JA = none
export const plural_NB = p_ne_1
export const plural_NO = p_ne_1
export const plural_PT = p_ne_1
export const plural_PL = (n) =>
  n == 1
    ? 's'
    : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20)
    ? 'f'
    : 'p'
export const plural_SE = p_ne_1
export const plural_TH = none
