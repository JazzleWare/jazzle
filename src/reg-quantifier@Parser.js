this. parseRegex_tryPrepareQuantifier =
function() {
  var c = this.c, s = this.src, l = s.length;
  if (c >= l)
    return false;
  switch (s.charCodeAt(c)) {
  case CH_ADD:
  case CH_QUESTION:
  case CH_MUL:
    this.regPCQ = true; // peek charQuantifier
    return true;
  case CH_LCURLY:
    this.regPBQ = this.parseRegex_regCurlyQuantifier();
    return this.regPBQ !== null;
  }
  return false;
};

this.regQuantified =
function(elem) {
  var c = this.c, li = this.li, col = this.col;
  var loc = null, s = this.src;
  var t = '', bq = null;

  if (this.regPCQ) {
    ASSERT.call(this, this.regPBQ === null, 'hasPBQnt');
    this.regPCQ = false;
    t = s.charAt(c);
    c++;
    this.setsimpoff(c);
    loc = this.loc();
  } 
  else if (this.regPBQ) {
    ASSERT.call(this, !this.regPCQ, 'hasPCQnt');
    t = '{}';
    bq = this.regPBQ;
    this.regPBQ = null;
    loc = bq.loc.end;
  }
  else 
    ASSERT.call(this, false, 'neither PCQnt nor PBQnt');

  var greedy = true;
  if (this.scat(this.c) === CH_QUESTION) {
    if (bq)
      loc = { start: loc.start, end: loc.end };
    c++;
    this.setsimpoff(c);
    loc.end++;
    greedy = false;
  }

  return {
    type: '#Regex.Quantified' ,
    rangeQuantifier: bq,
    quantifier: t,
    pattern: elem,
    start: elem.start,
    loc: { start: elem.loc.start, end: loc },
    end: this.c,
    greedy: greedy
  };
};


