module.exports = function(n) {
  return n % 10 !== 1 || n % 100 === 11 ? 'p' : 's'
}
