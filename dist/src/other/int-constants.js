 export var INTBITLEN = (function() {
  var allOnes = ~0;
  var i = 0;
  while (allOnes) {
    allOnes >>>= 1;
    i++;
  }

  return i;
 }());


 export var D_INTBITLEN = 0, M_INTBITLEN = INTBITLEN - 1;
 while ( M_INTBITLEN >> (++D_INTBITLEN) );
