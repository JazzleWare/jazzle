this.parseObjectExpression = function(context) {
  var startc = this.c0,
      startLoc = this.locBegin(),
      elem = null,
      list = [],
      first__proto__ = null,
      elemContext = CTX_NONE,
      pt = ERR_NONE_YET, pe = null, po = null,
      at = ERR_NONE_YET, ae = null, ao = null,
      st = ERR_NONE_YET, se = null, so = null,
      n = null;

  if (context & CTX_PAT) {
    elemContext |= context & CTX_PARPAT;
    elemContext |= context & CTX_PARPAT_ERR;
  }
  else 
    elemContext |= CTX_PAT|CTX_NO_SIMPLE_ERR;

  if (context & CTX_PARPAT) {
    if ((context & CTX_PARAM) &&
       !(context & CTX_HAS_A_PARAM_ERR)) {
      this.pt = ERR_NONE_YET; this.pe = this.po = null;
    }
    if ((context & CTX_PAT) &&
       !(context & CTX_HAS_AN_ASSIG_ERR)) {
      this.at = ERR_NONE_YET; this.ae = this.ao = null;
    }
    if (!(context & CTX_HAS_A_SIMPLE_ERR)) {
      this.st = ERR_NONE_YET; this.se = this.so = null;
    }
  }
  
  var pc0 = -1, pli0 = -1, pcol0 = -1;
  var ac0 = -1, ali0 = -1, acol0 = -1;
  var sc0 = -1, sli0 = -1, scol0 = -1;

  do {
    this.next();
    this.first__proto__ = first__proto__;
    elem = this.parseMem(elemContext, ST_OBJMEM);

    if (elem === null)
      break;

    if (!first__proto__ && this.first__proto__)
      first__proto__ = this.first__proto__;

    list.push(core(elem));
    if (!(elemContext & CTX_PARPAT))
      continue;

    if (elemContext & CTX_PARAM)
      this.scope.addPossibleArgument(elem);

    if ((elemContext & CTX_PARAM) &&
       !(elemContext & CTX_HAS_A_PARAM_ERR) &&
       this.pt !== ERR_NONE_YET) {
      if (pt === ERR_NONE_YET || agtb(this.pt, pt)) {
        pt = this.pt, pe = this.pe, po = elem;
        if (pt & ERR_PIN)
          pc0 = this.ploc.c0, pli0 = this.ploc.li0, pcol0 = this.ploc.col0;
        if (pt & ERR_P_SYN)
          elemContext |= CTX_HAS_A_PARAM_ERR;
      }
    }
    if ((elemContext & CTX_PAT) &&
       !(elemContext & CTX_HAS_AN_ASSIG_ERR) &&
       this.at !== ERR_NONE_YET) {
      if (at === ERR_NONE_YET || agtb(this.at, at)) {
        at = this.at; ae = this.ae; ao = elem;
        if (at & ERR_PIN)
          ac0 = this.aloc.c0, ali0 = this.aloc.li0, acol0 = this.aloc.col0;
        if (at & ERR_A_SYN)
          elemContext |= CTX_HAS_AN_ASSIG_ERR;
      }
    }
    // TODO: (elemContext & CTX_PARPAT) maybe?
    if (!(elemContext & CTX_HAS_A_SIMPLE_ERR) &&
       this.st !== ERR_NONE_YET) {
      if (st === ERR_NONE_YET || agtb(this.st, st)) {
        st = this.st; se = this.se; so = elem;
        if (st & ERR_PIN)
          sc0 = this.eloc.c0, sli0 = this.eloc.li0, scol0 = this.eloc.col0;
        if (st & ERR_S_SYN)
          elemContext |= CTX_HAS_A_SIMPLE_ERR;
      }
    }
  } while (this.lttype === ',');

  n = {
    properties: list,
    type: 'ObjectExpression',
    start: startc,
    end: this.c,
    loc: { start: startLoc, end: this.loc() }/* ,y:-1*/
  };

  // TODO: this is a slightly unnecessary work if the parent container already has an err;
  // (context & CTX_HAS_A(N)_<p:a:s>_ERR) should be also present in the conditions below
  if ((context & CTX_PARAM) && pt !== ERR_NONE_YET) {
    this.pt = pt; this.pe = pe; this.po = po;
    if (pt & ERR_PIN)
      this.ploc.c0 = pc0, this.ploc.li0 = pli0, this.ploc.col0 = pcol0;
  }
  if ((context & CTX_PAT) && at !== ERR_NONE_YET) {
    this.at = at; this.ae = ae; this.ao = ao;
    if (at & ERR_PIN)
      this.aloc.c0 = ac0, this.aloc.li0 = ali0, this.aloc.col0 = acol0;
  }
  if ((context & CTX_PARPAT) && st !== ERR_NONE_YET) {
    this.st = st; this.se = se; this.so = so;
    if (st & ERR_PIN)
      this.eloc.c0 = sc0, this.eloc.li0 = sli0, this.eloc.col0 = scol0;
  }

  if (!this.expectType_soft('}'))
    this.err('obj.unfinished');

  return n;
};

