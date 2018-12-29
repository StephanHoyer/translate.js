// Here's a large list of pluralization algorithms by language:
// http://docs.translatehouse.org/projects/localization-guide/en/latest/l10n/pluralforms.html?id=l10n/pluralforms).

const none = (n) => 'n'
const p_ne_1 = (n) => (n !== 1 ? 'p' : 's')
const p_gt_1 = (n) => (n > 1 ? 'p' : 's')

export const plural_CS = (n) => (n == 1 ? 's' : n >= 2 && n <= 4 ? 'p' : 'n')
export const plural_DA = p_ne_1
export const plural_DE = p_ne_1
export const plural_EN = p_ne_1
export const plural_ES = p_ne_1
export const plural_FR = p_gt_1
export const plural_IS = (n) => (n % 10 !== 1 || n % 100 === 11 ? 'p' : 's')
export const plural_IT = p_ne_1
export const plural_JA = none
export const plural_PT = p_ne_1
export const plural_SE = p_ne_1
