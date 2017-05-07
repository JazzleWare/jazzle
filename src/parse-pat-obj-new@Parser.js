this.parsePat_obj =
function() {
  this.v<=5 && this.err('ver.patobj');

  var isID = false, c0 = this.c0, loc0 = this.loc();
  var name = null, val = null, list = [], isShort = false;

  if (this.scope.insideArgs())
    this.scope.enterUniqueArgs();

  LOOP:
  do {
    this.next();
    switch (this.lttype) {
    case TK_ID:
      isID = true;
      name = this.id();
      break;

    case CH_LSQBRACKET:
      name = this.mem_expr();
      break;

    case TK_NUM:
      name = this.getLit_num();
      break;

    case CH_SINGLE_QUOTE:
    case CH_MULTI_QUOTE:
      name = this.parseString(this.lttype);
      break;

    default: break LOOP;
    }

    isShort = isID;
    if (isID) {
      if (this.expectT(CH_COLON)) {
        isShort = false;
        val = this.parsePat();
      }
      else {
        this.validate(name.name);
        val = name;
      }
    }
    else {
      if (!this.expectT(CH_COLON))
        this.err('obj.pattern.no.:');
      val = this.parsePat();
    }

    if (val === null)
      this.err('obj.prop.is.null');

    if (this.peekEq())
      val = this.parsePat_assig(name);
    else if (isShort)
      isShort = false;

    list.push({
      type: 'Property',
      start: name.start,
      key: core(name),
      end: val.end,
      loc: {
        start: name.loc.start,
        end: val.loc.end },
      kind: 'init',
      computed: name.type === PAREN,
      value: val,
      method: false, 
      shorthand: isShort,
      '#y': -1
    });
  } while (this.lttype === CH_COMMA);

  var n = {
    type: 'ObjectPattern',
    loc: { start: loc0, end: this.loc() },
    start: c0,
    end: this.c,
    properties: list,
    '#y': -1
  };

  if (!this.expectT(CH_RCURLY))
    this.err('pat.obj.is.unfinished');

  return n;
};
