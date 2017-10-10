this.findIndentStringWithIdealLength =
function(idealLength) {
  var INLEN = this.indentString.length;
  ASSERT.call(this, idealLength % INLEN === 0, 'len'); // TODO: eliminate
  var level = idealLength / INLEN;

  var cache = this.indentCache, l = cache.length;
  if (level < l)
    return cache[level];

  var str = cache[l-1];
  ASSERT.call(this, l > 0, 'l');
  while (l <= level) {
    cache[l] = str = str + this.indentString;
    l++;
  }

  return str;
};

this.indentNextLine =
function() { this.nextLineIndent++; };

this.unindentNextLine =
function() {
  ASSERT.call(this, this.nextLineIndent > 0, 'line has a <1 indent');
  this.nextLineIndent--;
};
