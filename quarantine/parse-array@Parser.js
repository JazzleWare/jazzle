this.parseArray = 
function(ctx) {
  var c0 = this.c0, loc0 = this.locBegin();

  this.next(); // '['

  var elem = null, list = [];
  var elctx = CTX_NULLABLE;

  if (ctx & CTX_PAT) {
    elctx |= errt_pat_inh(ctx);
    elctx |= errt_err_inh(ctx);
  }
  else
    elctx |= CTX_TOP;

  var pt = ERR_NONE_YET, pe = null, po = null;
  var at = ERR_NONE_YET, ae = null, ao = null;
  var st = ERR_NONE_YET, se = null, so = null;

  var pc0 = -1, pli0 = -1, pcol0 = -1;
  var ac0 = -1, ali0 = -1, acol0 = -1;
  var sc0 = -1, sli0 = -1, scol0 = -1;

  if (ctx & CTX_PARPAT) {
    if (errt_should_track_param(ctx)) {
      this.pt = ERR_NONE_YET; this.pe = this.po = null;
    }

    if (errt_should_track_assig(ctx)) {
      this.at = ERR_NONE_YET; this.ae = this.ao = null;
    }

    if (errt_should_track_simp(ctx)) {
      this.st = ERR_NONE_YET; this.se = this.so = null;
    }
  }

  var hasMore = true;
  var hasRest = false, hasNonTailRest = false;

  while (hasMore) {
    elem = this.parseNonSeqExpr(PREC_NONE, elctx);
    if (elem === null && this.lttype === TK_ELLIPSIS) {
      elem = this.parseSpread(elctx);
      hasRest = true;
    }
    if (this.lttype === CH_COMMA) {
      if (hasRest)
        hasNonTailRest = true; 
      if (elem === null) {
        if (this.v <= 5) this.err('ver.elision');
        list.push(null);
      }
      else list.push(core(elem));
      this.next();
    }
    else {
      if (elem) {
        list.push(core(elem));
        hasMore = false;
      }
      else break;
    }
 
    if (elem && errt_trackable(elctx)) {
      var elemCore = elem;
      // TODO: [...(a),] = 12
      var t = ERR_NONE_YET;
      if (elemCore.type === PAREN_NODE)
        t = ERR_PAREN_UNBINDABLE;
      else if (hasNonTailRest)
        t = ERR_NON_TAIL_REST;

      if (errt_should_track_param(ctx)) {
        if (this.pt === ERR_NONE_YET && t !== ERR_NONE_YET) {
          this.pt = t; this.pe = elemCore;
        }
        if (this.pt_override(pt)) {
          pt = this.pt; pe = this.pe; po = core(elem);
          if (pt & ERR_P_SYN)
            elctx |= CTX_HAS_A_PARAM_ERR;
          if (pt & ERR_PIN) 
            pc0 = this.ploc.c0, pli0 = this.ploc.li0, pcol0 = this.ploc.col0;
        }
      }

      // ([a]) = 12
      if (t === ERR_PAREN_UNBINDABLE && this.ensureSimpAssig_soft(elem.expr))
        t = ERR_NONE_YET;

      if (errt_should_track_assig(ctx)) {
        if (this.at === ERR_NONE_YET && t !== ERR_NONE_YET) {
          this.at = t; this.ae = elemCore;
        }
        if (this.at_override(at)) {
          at = this.at; ae = this.ae; ao = core(elem);
          if (at & ERR_A_SYN)
            elctx |= CTX_HAS_AN_ASSIG_ERR;
          if (at & ERR_PIN)
            ac0 = this.aloc.c0, ali0 = this.aloc.li0, acol0 = this.aloc.col0;
        }
      }
      if (errt_should_track_simp(ctx)) {
        if (this.st_override(st)) {
          st = this.st; se = this.se; so = core(elem);
          if (st & ERR_S_SYN)
            elctx |= CTX_HAS_A_SIMPLE_ERR;
          if (st & ERR_PIN)
            sc0 = this.eloc.c0, sli0 = this.eloc.li0, scol0 = this.eloc.col0;
        }
      }
    }

    hasRest = hasNonTailRest = false;
  }
  
  var n = {
    type: 'ArrayExpression',
    loc: { start: startLoc, end: this.loc() },
    start: startc,
    end: this.c,
    elements : list /* ,y:-1*/
  };

  if ((ctx & CTX_PARAM) && pt !== ERR_NONE_YET) {
    this.pt = pt; this.pe = pe; this.po = po;
    if (pt & ERR_PIN)
      this.ploc.c0 = pc0, this.ploc.li0 = pli0, this.ploc.col0;
  }
  if ((ctx & CTX_PAT) && at !== ERR_NONE_YET) {
    this.at = at; this.ae = ae; this.ao = ao;
    if (at & ERR_PIN)
      this.aloc.c0 = ac0, this.aloc.li0 = ali0, this.aloc.col0 = acol0;
  }
  if ((ctx & CTX_PARPAT) && st !== ERR_NONE_YET) {
    this.st = st; this.se = se; this.so = so;
    if (st & ERR_PIN)
      this.eloc.c0 = sc0, this.eloc.li0 = sli0, this.eloc.col0 = scol0;
  }

  if (!this.expectType_soft(CH_RSQBRACKET))
    this.err('array.unfinished');
  
  return n;
};
