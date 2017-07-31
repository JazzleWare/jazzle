this. parseRegex_regClass =
function() {
  var c0 = this.c, loc0 = this.loc(), list = [];
  var e = null, latest = null;
  var n = null;

  var inverse = false;
  if (this.scat(c0+1) === CH_XOR)
    inverse = true;

  this.setsimpoff(inverse ? c0 + 2 : c0 + 1);

  while (e = this.parseRegex_regClassElem()) {
    this.regPushClassElem(list, e);
    if (this.regexErrorElem)
      return null;
  }
  if (this.regexErrorElem)
    return null;
  if (list.length) {
    var last = list[list.length-1 ];
    if (last.type === '#Regex.SemiRange' && !this.regValidateSemi(last))
      return null;
  }
  if (!this.expectChar(CH_RSQBRACKET))
    return this.setErrorRegex(this.parseRegex_errBracketUnfinished(n));

  n = {
    type: '#Regex.Class',
    elements: list,
    start: c0,
    end: this.c,
    inverse: inverse,
    loc: { start: loc0, end: this.loc() }
  };

  this.regQuantifiable = true;
  return n;
};

this.regPushClassElem =
function(list, elem) {
  if (list.length === 0) {
    list.push(elem);
    return;
  }
  var num = list.length;
  var tail = list[num-1];
  if (tail.type === '#Regex.SemiRange') {
    if (this.parseRegex_tryAttachTrailSurrogateToSemi(tail, elem))
      return;
    if (this.errorRegexElem)
      return;
  }
  else if (tail.type === '#Regex.SurrogateComponent' &&
    tail.kind === 'lead' &&
    elem.type === '#Regex.SurrogateComponent' &&
    elem.kind === 'trail') {
    if (this.regexFlags.u && tail.escape !== '{}' && elem.escape === tail.escape) {
      list.pop();
      list.push(this.regMakeSurrogate(tail, elem));
    }
    else
      list.push(elem);
    tail.next = elem;
    return;
  }
  if (tail.type !== '#Regex.Hy') {
    list.push(elem);
    return;
  }
  var maxv = cpReg(elem);
  if (maxv === -1) {
    list.push(elem);
    return;
  }
  if (num < 2) {
    list.push(elem);
    return;
  }
  var head = list[num-2 ];
  var minv = cpReg(head);
  if (minv === -1) {
    list.push(elem);
    return;
  }

  var semi = false;
  if (this.regexFlags.u && elem.type === '#Regex.SurrogateComponent' &&
    elem.kind === 'lead' && elem.escape !== '{}')
    semi = true;
  else if (minv > maxv)
    return this.regerr_minBiggerThanMax(head, elem);

  list.pop(); // '-'
  list.pop(); // head

  var min = head, max = elem;

  list.push({
    type: semi ? '#Regex.SemiRange' : '#Regex.Range',
    min: min,
    start: min.start,
    end: max.end,
    max: max,
    loc: semi ? null : { start: min.loc.start, end: max.loc.end }
  });
};

this.regValidateSemi =
function(semi) {
  ASSERT.call(this, semi.type === '#Regex.SemiRange', 'semi' );
  ASSERT.call(this, semi.max.cp >= 0, 'max');
  ASSERT.call(this, semi.min.cp >= 0, 'min');
  if (semi.min.cp > semi.max.cp)
    return this.regerr_minBiggerThanMax(semi.min, semi.max );

  semi.type = '#Regex.Range';
  semi.loc = { start: semi.min.loc.start, end: semi.max.loc.end };
  return semi;
};

this. parseRegex_regClassElem =
function() {
  var c = this.c, s = this.src, l = s.length;
  if (c >= l)
    return null;
  switch (s.charCodeAt(c)) {
  case CH_BACK_SLASH:
    return this.parseRegex_regClassEscape();
  case CH_RSQBRACKET:
    return null;
  default: return this.parseRegex_regClassChar();
  }
};

this. parseRegex_regClassEscape =
function() {
  return this.parseRegex_regEscape(false);
};

this. parseRegex_regClassChar =
function() {
  return this.parseRegex_regChar(false);
};

this. parseRegex_tryAttachTrailSurrogateToSemi =
function(semi, elem) {
  var createdSurrogate = false;
  if (elem.type === '#Regex.SurrogateComponent' &&
    elem.kind === 'trail') {
    semi.max.next = elem;
    if (elem.escape === semi.max.escape) {
      semi.max = this.regMakeSurrogate(semi.max, elem);
      createdSurrogate = true;
    }
  }
  if (this.regValidateSemi(semi))
    return createdSurrogate;

  return false;
};


