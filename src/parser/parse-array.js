this.parseArray = 
function(ctx) {
  var c0 = this.c0, cb = {}, loc0 = this.loc0();

  this.suc(cb, 'bef');
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

  var y = 0, si = -1;

  cb.holes = [];
  cb.h = 0;
  while (hasMore) {
    elem = this.parseNonSeq(PREC_NONE, elctx);
    if (elem === null && this.lttype === TK_ELLIPSIS) {
      elem = this.parseSpread(elctx);
      si = list.length;
      hasRest = true;
    }
    if (this.lttype === CH_COMMA) {
      if (hasRest)
        hasNonTailRest = true; 
      if (elem === null) {
        if (this.v <= 5) this.err('ver.elision');
        this.commentBuf && cb.holes.push([list.length, this.cc()]);
        list.push(null);
      }
      else {
        list.push(core(elem));
        this.spc(core(elem), 'aft');
      }
      this.next();
    }
    else {
      if (elem) {
        list.push(core(elem));
        hasMore = false;
      }
      else break;
    }
 
    if (elem)
       y += this.Y(elem);

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
          if (errt_psyn(pt))
            elctx |= CTX_HAS_A_PARAM_ERR;
          if (errt_pin(pt)) 
            pc0 = this.pin.p.c0, pli0 = this.pin.p.li0, pcol0 = this.pin.p.col0;
        }
      }

      // ([a]) = 12
      if (t === ERR_PAREN_UNBINDABLE && this.ensureSAT(elem.expr))
        t = ERR_NONE_YET;

      if (errt_atrack(ctx)) {
        if (this.at === ERR_NONE_YET && t !== ERR_NONE_YET) {
          this.at = t; this.ae = elemCore;
        }
        if (this.at_override(at)) {
          at = this.at; ae = this.ae; ao = core(elem);
          if (errt_asyn(at))
            elctx |= CTX_HAS_AN_ASSIG_ERR;
          if (errt_pin(at))
            ac0 = this.pin.a.c0, ali0 = this.pin.a.li0, acol0 = this.pin.a.col0;
        }
      }
      if (errt_strack(ctx)) {
        if (this.st_override(st)) {
          st = this.st; se = this.se; so = core(elem);
          if (errt_ssyn(st))
            elctx |= CTX_HAS_A_SIMPLE_ERR;
          if (errt_pin(st))
            sc0 = this.pin.s.c0, sli0 = this.pin.s.li0, scol0 = this.pin.s.col0;
        }
      }
    }

    hasRest = hasNonTailRest = false;
  }
  
  var n = {
    type: 'ArrayExpression',
    loc: { start: loc0, end: this.loc() },
    start: c0,
    end: this.c,
    elements : list,
    '#y': -1, '#si': si, '#c': cb
  };

  if (errt_perr(ctx,pt)) {
    this.pt_teot(pt,pe,po);
    errt_pin(pt) && this.pin_pt(pc0,pli0,pcol0);
  }
  if (errt_aerr(ctx,at)) {
    this.at_teot(at,ae,ao);
    errt_pin(at) && this.pin_at(ac0,ali0,acol0);
  }
  if (errt_serr(ctx,st)) {
    this.st_teot(st,se,so);
    errt_pin(st) && this.pin_st(sc0,sli0,scol0);
  }

  elem ? this.spc(core(elem), 'aft') : this.suc(cb, 'inner');
  if (!this.expectT(CH_RSQBRACKET))
    this.err('array.unfinished');
  
  return n;
};
