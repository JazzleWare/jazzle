this.parseSwitchCase = function () {
  var c0, loc0;
  var nbody = null, cond = null;

  if (this.lttype === TK_ID) 
  switch (this.ltval) {
  case 'case':
    this.resvchk();
    c0 = this.c0;
    loc0 = this.loc0();
    this.next(); // 'case'
    cond = core(this.parseExpr(CTX_TOP)) ;
    break;

  case 'default':
    this.resvchk();
    c0 = this.c0;
    loc0 = this.loc0();
    this.next();
    break ;

  default: return null;
  } else return null;

  var c = this.c, li = this.li, col = this.col;
  if (!this.expectT(CH_COLON))
    this.err('switch.case.has.no.colon');

  nbody = this.stmtList();
  var last = nbody.length ? nbody[nbody.length-1] : null;

  var ec = -1, eloc = null;
  if (last) {
    ec = last.end;
    eloc = last.loc.end;
  } else {
    ec = c;
    eloc = { line: li, column: col };
  }

  return {
    type: 'SwitchCase',
    test: cond,
    start: c0,
    end: ec,
    loc: { start: loc0, end: eloc },
    consequent: nbody,
    '#y': -1
  };
};
