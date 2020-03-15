function none(n) {
  return 'n'
}
function p_ne_1(n) {
  return n !== 1 ? 'p' : 's'
}
function p_gt_1(n) {
  return n > 1 ? 'p' : 's'
}

// ---------------------------------------------------------------------------

exports.plural_CS = function(n) {
  return n == 1 ? 's' : n >= 2 && n <= 4 ? 'p' : 'n'
}
exports.plural_DA = p_ne_1
exports.plural_DE = p_ne_1
exports.plural_EN = p_ne_1
exports.plural_ES = p_ne_1
exports.plural_FR = p_gt_1
exports.plural_IS = function(n) {
  return n % 10 !== 1 || n % 100 === 11 ? 'p' : 's'
}
exports.plural_IT = p_ne_1
exports.plural_JA = none
exports.plural_PT = p_ne_1
exports.plural_SE = p_ne_1
