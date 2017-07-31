this. parseRegex_regBranch =
function() {
  this.errorRegexElem = null;
  this.regQuantifiable = false;
  var elem = this.parseRegex_regElem();
  if (elem === null)
    return null;
  var elements = [];
  do {
    if (elem !== this.lastRegexElem) {
      elem = this.regAdaptTo(elements, elem);
      if (this.regQuantifiable) {
        this.regQuantifiable = false;
        if (this.regPBQ || this.regPCQ || (!rec(elem) && this.parseRegex_tryPrepareQuantifier()))
          elem = this.regQuantified(elem);
      }
      elements.push(elem);
      this.lastRegexElem = elem; // reuse CharSeq
    }
    this.regQuantifiable = false;
    elem = this.parseRegex_regElem();
    if (this.errorRegexElem)
      return null;
  } while (elem);

  var lastElem = elements[elements.length-1 ];
  return {
    type: '#Regex.Branch',
    elements: elements,
    start: elements[0].start,
    end: lastElem.end,
    loc: { start: elements[0].loc.start, end: lastElem.loc.end }
  };
};

this.regAdaptTo =
function(list, elem) {
  if (list.length === 0) 
    return elem;
  var last = list[list.length-1];
  if (last.type === '#Regex.SurrogateComponent' && last.kind === 'lead' &&
    elem.type === '#Regex.SurrogateComponent' && elem.kind === 'trail') {
    last.next = elem;
    if (this.regexFlags.u && last.escape === elem.escape ) {
      list.pop();
      this.regQuantifiable = true;
      return this.regMakeSurrogate(last, elem);
    }
  }
  return elem;
};

this. parseRegex_regElem =
function() {
  if (this.pendingRegexElem)
    return this.resetRegexElem();
  var c = this.c, s = this.src, l = s.length;
  if (c >= l)
    return null;

  switch (s.charCodeAt(c)) {
  case CH_LSQBRACKET:
    return this.parseRegex_regClass();
  case CH_LPAREN:
    return this.parseRegex_regParen();
  case CH_LCURLY:
    return this.parseRegex_regCurly();
  case CH_BACK_SLASH:
    return this.parseRegex_regEscape(true);
  case CH_$:
  case CH_XOR:
    return this.parseRegex_regUnitAssertion();
  case CH_QUESTION:
  case CH_ADD:
  case CH_MUL:
    return this.setErrorRegex(this.parseRegex_errQuantifier());
  case CH_OR:
  case CH_RPAREN:
    return null;
  default:
    return this.parseRegex_regChar(true);
  }
};
