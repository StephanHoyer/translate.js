module.exports = function assemble (parts, replacements, count, debug) {
  var result = [].concat(parts)
  var len = parts.length
  for (var i = 1; i < len; i += 2) {
    var part = parts[i]
    var val = replacements[part]
    if (val == null) {
      if (part === 'n' && count != null) {
        val = count
      } else {
        debug && console.warn('No "' + part + '" in placeholder object:', replacements)
        val = '{' + part + '}'
      }
    }
    result[i] = val
  }
  return result
}
