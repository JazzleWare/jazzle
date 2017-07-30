
function char2int(c) { return c.charCodeAt(0); }
var hexD = [ '1', '2', '3', '4', '5',
             '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f' ];
hexD = ['0'].concat(hexD);

function hex(number) {
  var str = "";
  str = hexD[number&0xf] + str
  str = hexD[(number>>=4)&0xf] + str ;
  str = hexD[(number>>=4)&0xf] + str ;
  str = hexD[(number>>=4)&0xf] + str ;
  
  return str;
}

function hex2(number) {
  var str = "";
  str = hexD[number&0xf] + str
  str = hexD[(number>>=4)&0xf] + str ;
  
  return str;
}

function fromRunLenCodes(runLenArray, bitm) {
  bitm = bitm || [];
  var bit = runLenArray[0];
  var runLenIdx = 1, bitIdx = 0;
  var runLen = 0;
  while (runLenIdx < runLenArray.length) {
    runLen = runLenArray[runLenIdx];
    while (runLen--) {
      while ((INTBITLEN * (bitm.length)) < bitIdx) bitm.push(0);
      if (bit) bitm[bitIdx >> D_INTBITLEN] |= (1 << (M_INTBITLEN & bitIdx));
      bitIdx++ ;
    }
    runLenIdx++ ;
    bit ^= 1;
  }
  return (bitm);
}

function asBitmap(str) {
  var bm = [], e = 0;
  while (e < str.length) {
    var ch = str.charCodeAt(e);
    var byteIndex = ch >> D_INTBITLEN;
    while (bm.length <= byteIndex) bm.push(0);
    bm[byteIndex] |= (1 << (ch & M_INTBITLEN));
    e++;
  }
  return bm;
}

function makeAcceptor(str) {
  var bm = asBitmap(str);
  return function(ch) {
    var byteIndex = ch >> D_INTBITLEN;
    if (byteIndex >= bm.length)
      return 0;
    return bm[byteIndex] & (1 << (ch & M_INTBITLEN));
  };
}

function arorev(l) {
  switch ( l ) {
     case 'arguments':
     case 'eval':
       return true;
  }

  return false;
};

function cp2sp(codePoint )  {
  if ( codePoint <= 0xFFFF)
    return String.fromCharCode(codePoint) ;

  return String.fromCharCode(
    ((codePoint-0x10000 )>>10)+0x0D800,
    ((codePoint-0x10000 )&(1024-1))+0x0DC00
  );
}

function core(n) { return n.type === PAREN ? n.expr : n; };

function hex2num(n) {
  return (n >= CH_0 && n <= CH_9) ? n - CH_0 :
         (n <= CH_f && n >= CH_a) ? 10 + n - CH_a :
         (n >= CH_A && n <= CH_F) ? 10 + n - CH_A : -1;
}

function createObj(baseObj) {
  function E() {} E.prototype = baseObj;
  return new E();
}

function getIDName(n) {
  if (n.type === 'Identifier')
    return n.name;
  if (n.type === 'Literal' &&
    typeof n.value === STRING_TYPE &&
    isIDName(n.value))
    return n.value;
  return "";
};

function isIDName(str) {
  var e = 0;
  if (str.length === 0)
    return false;
  var ch = str.charCodeAt(e++), ch2 = -1;
  if (ch >= 0x0d800 && ch <= 0x0dbff) {
    if (e < str.length)
      ch = surrogate(ch, str.charCodeAt(e++));
    else
      return false;
  }
  if (!isIDHead(ch))
    return false;
  while (e < str.length) {
    ch = str.charCodeAt(e++);
    if (ch >= 0x0d800 && ch <= 0x0dbff) {
      if (e < str.length)
        ch = surrogate(ch, str.charCodeAt(e++));
      else
        return false;
    }
    if (!isIDBody(ch))
      return false;
  }
  return true;
}

function CB(n) {
  ASSERT.call(this, HAS.call(n, '#c'), '#c');
  return n['#c'];
}

function cmn_ac(cb, name, list) {
  if (list === null)
    return;
  if (!HAS.call(cb, name) || cb[name] === null)
    cb[name] = list;
  else
    cb[name].mergeWith(list);
}

function cmn_erase(cb, name) {
  if (HAS.call(cb, name)) {
    var list = cb[name];
    cb[name] = null;
    return list;
  }
  return null;
}

function rec(n) {
  return n.type === '#Regex.CharSeq';
}

function recDash(n) {
  return rec(n) && n.cp === CH_MIN;
}

function isTemp(n) {
  return n.type === '#Untransformed' &&
    n.kind === 'temp';
}

function isInteger(n) { return (n|0) === n; }

function isResolvedName(n) {
  return n.type === '#Untransformed' &&
    n.kind === 'resolved-name';
}

function findElem(list, t) {
  var e = 0;
  while (e < list.length) {
    var elem = list[e];
    if (elem && elem.type === t)
      return e;
    e++;
  }
  return -1;
}

function needsConstCheck(n) {
  return n.type === '#ResolvedName' && n.constCheck;
}

function octStr2num(octStr) {
  var v = 0, e = 0;
  while (e < octStr.length)
    v = (v<<3)|(octStr.charCodeAt(e++)-CH_0);
  return v;
}

function surrogate(ch1, ch2) {
  return ((ch1-0x0d800)<<10)+(ch2-0x0dc00)+0x010000;
}

function isDirective(n) {
  return (
    n.type === 'Literal' &&
    typeof(n.value) === STRING_TYPE
  );
}
