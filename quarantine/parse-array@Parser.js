this.parseArray = 
function(ctx) {
  var c0 = this.c0, loc0 = this.locBegin();

  this.next(); // '['

  var elem = null, list = [];
  var elctx = errt_elem_ctx_of(ctx);

  elctx |= CTX_NULLABLE;

  var pt = ERR_NONE_YET, pe = null, po = null;
  var at = ERR_NONE_YET, ae = null, ao = null;
  var st = ERR_NONE_YET, se = null, so = null;

  var pc0 = -1, pli0 = -1, pcol0 = -1;
  var ac0 = -1, ali0 = -1, acol0 = -1;
  var sc0 = -1, sli0 = -1, scol0 = -1;

  if (errt_track(ctx)) {
    errt_ptrack(ctx) && this.pt_reset();
    errt_atrack(ctx) && this.at_reset();
    errt_strack(ctx) && this.st_reset();
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
 
    if (elem && errt_track(elctx)) {
      var elemCore = elem;
      // TODO: [...(a),] = 12
      var t = ERR_NONE_YET;
      if (elemCore.type === PAREN_NODE)
        t = ERR_PAREN_UNBINDABLE;
      else if (hasNonTailRest)
        t = ERR_NON_TAIL_REST;

      if (errt_ptrack(ctx)) {
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

      if (errt_atrack(ctx)) {
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
      if (errt_strack(ctx)) {
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

  if (errt_haserr(ctx,pt)) {
    this.pt_teot(pt,pe,po);
    errt_pin(pt) && this.ppin(pc0,pli0,pcol0);
  }
  if (errt_haserr(ctx,at)) {
    this.at_teot(at,ae,ao);
    errt_pin(at) && this.apin(ac0,ali0,acol0);
  }
  if (errt_haserr(ctx,st)) {
    this.st_teot(st,se,so);
    errt_pin(st) && this.spin(sc0,sli0,scol0);
  }

  if (!this.expectType_soft(CH_RSQBRACKET))
    this.err('array.unfinished');
  
  return n;
};
