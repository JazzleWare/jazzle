this.parseAssignment = function(head, context) {
  var o = this.ltraw;
  if (o === '=>')
    return this.parseArrowFunctionExpression(head);

  if (head.type === PAREN_NODE) {
    if (!this.ensureSimpAssig_soft(head.expr)) {
      this.at = ERR_PAREN_UNBINDABLE;
      this.ae = this.ao = head;
      this.throwTricky('a', this.at, this.ae);
    }
    else
      this.dissolveParen();
  }

  var right = null;
  if (o === '=') {
    if (context & CTX_PARPAT)
      this.adjustErrors();

    var st = ERR_NONE_YET, se = null, so = null,
        pt = ERR_NONE_YET, pe = null, po = null;

    this.toAssig(core(head), context);

    // flush any remaining simple error, now that there are no more assignment errors
    if ((context & CTX_NO_SIMPLE_ERR) && this.st !== ERR_NONE_YET)
      this.throwTricky('s', this.st);

    var sc0 = -1, sli0 = -1, scol0 = -1,
        pc0 = -1, pli0 = -1, pcol0 = -1;

    if ((context & CTX_PARPAT) && this.st !== ERR_NONE_YET) {
      st = this.st; se = this.se; so = this.so;
      if (st & ERR_PIN)
        sc0 = this.eloc.c0, sli0 = this.eloc.li0, scol0 = this.eloc.col0;
    }
    if ((context & CTX_PARAM) && this.pt !== ERR_NONE_YET) {
      pt = this.pt; pe = this.pe; po = this.po;
      if (pt & ERR_PIN)
        pc0 = this.ploc.c0, pli0 = this.ploc.li0, pcol0 = this.ploc.col0;
    }

    this.currentExprIsAssig();
    this.next();
    right = this.parseNonSeqExpr(PREC_WITH_NO_OP,
      (context & CTX_FOR)|CTX_PAT|CTX_NO_SIMPLE_ERR);

    if (pt !== ERR_NONE_YET) {
      this.pt = pt; this.pe = pe; this.po = po;
      if (pt & ERR_PIN)
        this.ploc.c0 = pc0, this.ploc.li0 = pli0, this.ploc.col0 = pcol0;
    }
    if (st !== ERR_NONE_YET) {
      this.st = st; this.se = se; this.so = so;
      if (st & ERR_PIN)
        this.eloc.c0 = sc0, this.eloc.li0 = sli0, this.eloc.scol0;
    }
  }
  else {
    // TODO: further scrutiny, like checking for this.at, is necessary (?)
    if (!this.ensureSimpAssig_soft(core(head)))
      this.err('assig.not.simple',{tn:core(head)});

    var c0 = -1, li0 = -1, col0 = -1;
    if (context & CTX_PARPAT) {
      c0 = this.c0; li0 = this.li0; col0 = this.col0;
    }
    this.next();
    right = this.parseNonSeqExpr(PREC_WITH_NO_OP,
      (context & CTX_FOR)|CTX_PAT|CTX_NO_SIMPLE_ERR);

    if (context & CTX_PARAM) {
      this.ploc.c0 = c0, this.ploc.li0 = li0, this.ploc.col0 = col0;
      this.pt = ERR_PIN_NOT_AN_EQ;
    }
    if (context & CTX_PAT) {
      this.aloc.c0 = c0, this.aloc.li0 = li0, this.aloc.col0 = col0;
      this.at = ERR_PIN_NOT_AN_EQ;
    }
  }
 
  return {
    type: 'AssignmentExpression',
    operator: o,
    start: head.start,
    end: right.end,
    left: head,
    right: core(right),
    loc: {
      start: head.loc.start,
      end: right.loc.end
    }/* ,y:-1*/
  };
};
