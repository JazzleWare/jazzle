this.regClass =
function() {
  var c0 = this.c, loc0 = this.loc(), list = [];
  var e = null, latest = null;
  var n = null;

  var inverse = false;
  if (this.scat(c0+1) === CH_XOR)
    inverse = true;

  this.setsimpoff(inverse ? c0 + 2 : c0 + 1);

  while (true) {
    e = this.regClassElem(); 
    if (this.regErr)
      return null;
    if (e === null)
      break;
    this.regPushClassElem(list, e);
  }

  if (this.regSemiRange && !this.regTryCompleteSemiRange())
    return null; // an error has got set

  if (!this.expectChar(CH_RSQBRACKET))
    return this.regErr_bracketUnfinished(n);

  n = {
    type: '#Regex.Class',
    elements: list,
    start: c0,
    end: this.c,
    inverse: inverse,
    loc: { start: loc0, end: this.loc() }
  };

  this.regIsQuantifiable = true;
  return n;
};

this.regPushClassElem =
function(list, tail) {
  if (list.length === 0) { list.push(tail); return; }

  var len = list.length;
  var ltop = list[len-1];
  var sr = this.regSemiRange;

  if (sr) {
    ASSERT.call(this, sr === ltop, 'semiRange must not have existed if it were not the last elem');
    ASSERT.call(this, isTrail(tail), 'semiRange should not have existed if the next class elem is a non-unicode escape');
    ASSERT.call(this, this.regexFlags.u, 'semiRange could not have existed if the u flags was not initially set');
    sr.max.next = tail;
    if (uAkin(sr.max, tail))
      sr.max = this.regMakeSurrogate(sr.max, tail);
    else
      list.push(tail);
    this.regTryCompleteSemiRange();
    return;
  }

  if (isLead(ltop) && isTrail(tail)) {
    if (this.regexFlags.u && ltop.escape !== '{}' && uAkin(ltop, tail)) {
      list.pop();
      list.push(this.regMakeSurrogate(ltop, tail));
    }
    else
      list.push(tail);
    ltop.next = tail;
    return;
  }

  if (len < 2 || ltop.type !== '#Regex.Hy') { list.push(tail); return; }

  var max = tail;
  var maxv = cpReg(max);
  if (maxv === -1) { list.push(tail); return; }

  var min = list[len-2];
  var minv = cpReg(min);
  if (minv === -1) { list.push(tail); return; }

  var semi = false;
  if (this.regexFlags.u && isLead(tail) && tail.escape !== '{}')
    semi = true;
  else if (minv > maxv)
    return this.regerr_minBiggerThanMax(min, tail);

  list.pop(); // '-'
  list.pop(); // head

  var elem = {
    type: semi ? '#Regex.SemiRange' : '#Regex.Range',
    min: min,
    start: min.start,
    end: max.end,
    max: max,
    loc: { start: min.loc.start, end: max.loc.end }
  };
  if (semi) {
    ASSERT.call(this, this.regSemiRange === null, 'semi' );
    this.regSemiRange = elem;
  }
  list.push(elem);
};

this.regTryCompleteSemiRange =
function() {
  var sr = this.regSemiRange;
  ASSERT.call(this, sr.type === '#Regex.SemiRange', 'semi' );
  ASSERT.call(this, sr.max.cp >= 0, 'max');
  ASSERT.call(this, sr.min.cp >= 0, 'min');
  if (sr.min.cp > sr.max.cp)
    return this.regErr_minBiggerThanMax(sr.min, sr.max);

  sr.type = '#Regex.Range';
  sr.loc.end = sr.max.loc.end;

  this.regSemiRange = null;
  return sr;
};

this.regClassElem =
function() {
  var c = this.c, s = this.src, l = s.length;
  if (c >= l)
    return null;
  switch (s.charCodeAt(c)) {
  case CH_BACK_SLASH:
    return this.regEsc(true);
  case CH_RSQBRACKET:
    return null;
  default:
    return this.regChar(true);
  }
};
