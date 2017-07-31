this.regBranch =
function() {
  this.regErr = null;
  this.regIsQuantifiable = false;

  var elem = this.regBareElem();
  if (elem === null)
    return null;

  var elements = [];
  do {
    if (elem !== this.regLastBareElem) {
      elem = this.regTryMix(elements, elem);
      if (this.regIsQuantifiable) {
        this.regIsQuantifiable = false;
        if (this.regPendingBQ || this.regPendingCQ || 
          (!isCharSeq(elem) && this.regPrepareQ()))
          elem = this.regQuantify(elem);
      }
      elements.push(elem);
      this.regLastBareElem = elem; // reuse CharSeq
    }

    this.regIsQuantifiable = false;
    elem = this.regBareElem();
    if (this.regErr)
      return null;
  } while (elem);

  var lastElem = elements[elements.length-1];
  return {
    type: '#Regex.Branch',
    elements: elements,
    start: elements[0].start,
    end: lastElem.end,
    loc: { start: elements[0].loc.start, end: lastElem.loc.end }
  };
};

this.regTryMix =
function(list, elem) {
  if (list.length === 0) 
    return elem;
  var last = list[list.length-1];
  if (isLead(last) && isTrail(elem)) {
    last.next = elem;
    if (this.regexFlags.u && uAkin(last, elem)) {
      list.pop();
      this.regIsQuantifiable = true;
      return this.regMakeSurrogate(last, elem);
    }
  }
  return elem;
};

this.regBareElem =
function() {
  var c = this.c, s = this.src, l = s.length;
  if (c >= l)
    return null;

  switch (s.charCodeAt(c)) {
  case CH_LSQBRACKET:
    return this.regClass();
  case CH_LPAREN:
    return this.regParen();
  case CH_LCURLY:
    return this.regCurly();
  case CH_BACK_SLASH:
    return this.regEsc(false);
  case CH_$:
  case CH_XOR:
    return this.regUnitAssertion();
  case CH_QUESTION:
  case CH_ADD:
  case CH_MUL:
    return this.regErr_looseQuantifier();
  case CH_OR:
  case CH_RPAREN:
    return null;
  default:
    return this.regChar(false);
  }
};
