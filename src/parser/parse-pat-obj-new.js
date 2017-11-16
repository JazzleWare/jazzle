this.parsePat_obj =
function() {
  this.v<=5 && this.err('ver.patobj');

  var isID = false, c0 = this.c0, loc0 = this.loc0();
  var name = null, val = null, list = [], isShort = false;

  if (this.scope.insideArgs())
    this.scope.enterUniqueArgs();

  var cb = {}, ci = -1, y = 0;

  this.suc(cb, 'bef');
  var elem = null;

  LOOP:
  do {
    elem && this.spc(elem, 'aft');
    this.next();
    var y0 = 0;
    switch (this.lttype) {
    case TK_ID:
      isID = true;
      name = this.id();
      break;

    case CH_LSQBRACKET:
      name = this.mem_expr();
      y0 += this.Y(name);
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
        this.declare(name);
        if (this.scope.insideStrict() && arorev(name.name))
          this.err('bind.arguments.or.eval');
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
      val = this.parsePat_assig(val);

    y0 += this.Y(val);
    y += y0;

    list.push(elem = {
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
      '#y': y0, '#c': {}
    });
    if (ci === -1 && name.type === PAREN)
      ci = list.length - 1;
  } while (this.lttype === CH_COMMA);

  var n = {
    properties: list,
    type: 'ObjectPattern',
    loc: { start: loc0, end: this.loc() },
    start: c0,
    end: this.c,
    '#y': y, '#ci': ci, '#c': {}, '#rest': -1
  };

  if (!this.expectT(CH_RCURLY))
    this.err('pat.obj.is.unfinished');

  return n;
};
