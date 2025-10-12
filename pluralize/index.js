const none = n => 'n'
const p_ne_1 = n => (n !== 1 ? 'p' : 's')
const p_gt_1 = n => (n > 1 ? 'p' : 's')

// ---------------------------------------------------------------------------

exports.plural_AR = n =>
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

exports.plural_CS = n => (n == 1 ? 's' : n >= 2 && n <= 4 ? 'p' : 'f')
exports.plural_DA = p_ne_1
exports.plural_DE = p_ne_1
exports.plural_EN = p_ne_1
exports.plural_ES = p_ne_1
exports.plural_FI = p_gt_1
exports.plural_FO = p_gt_1
exports.plural_FR = p_gt_1
exports.plural_IS = n => (n % 10 !== 1 || n % 100 === 11 ? 'p' : 's')
exports.plural_IT = p_ne_1
exports.plural_JA = none
exports.plural_NB = p_ne_1
exports.plural_NO = p_ne_1
exports.plural_PT = p_ne_1
exports.plural_PL = n =>
  n == 1
    ? 's'
    : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20)
    ? 'f'
    : 'p'
exports.plural_SE = p_ne_1
exports.plural_TH = none
