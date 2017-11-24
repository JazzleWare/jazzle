  import {CTX_NONE, CTX_PAT, CTX_PARPAT, CTX_PARPAT_ERR, CTX_TOP, CTX_HAS_A_PARAM_ERR, CTX_HAS_AN_ASSIG_ERR, CTX_HAS_A_SIMPLE_ERR, CH_COMMA, CH_RCURLY} from '../other/constants.js';
  import {ERR_NONE_YET} from '../other/error-constants.js';
  import {errt_track, errt_ptrack, errt_atrack, errt_strack, errt_pin, errt_psyn, errt_asyn, errt_ssyn, errt_perr, errt_aerr, errt_serr} from '../other/errt.js';
  import {ST_OBJMEM} from '../other/scope-constants.js';
  import {core} from '../other/util.js';
  import {cls} from './cls.js';

this.parseObj = function(ctx) {
  var c0 = this.c0, loc0 = this.loc0(),
      elem = null, list = [], first__proto__ = null,
      elctx = CTX_NONE,
      pt = ERR_NONE_YET, pe = null, po = null,
      at = ERR_NONE_YET, ae = null, ao = null,
      st = ERR_NONE_YET, se = null, so = null,
      n = null;

  var cb = {};
  this.suc(cb , 'bef');
  if (ctx & CTX_PAT) {
    elctx |= ctx & CTX_PARPAT;
    elctx |= ctx & CTX_PARPAT_ERR;
  }
  else 
    elctx |= CTX_TOP;

  if (errt_track(ctx)) {
    errt_ptrack(ctx) && this.pt_reset();
    errt_atrack(ctx) && this.at_reset();
    errt_strack(ctx) && this.st_reset();
  }

  var pc0 = -1, pli0 = -1, pcol0 = -1;
  var ac0 = -1, ali0 = -1, acol0 = -1;
  var sc0 = -1, sli0 = -1, scol0 = -1;

  var y = 0, ci = -1;
  do {
    elem && this.spc(elem, 'aft');
    this.next();
    this.first__proto__ = first__proto__;
    elem = this.parseMem(elctx, ST_OBJMEM);

    if (elem === null)
      break;

    y += this.Y(elem);

    if (!first__proto__ && this.first__proto__)
      first__proto__ = this.first__proto__;

    list.push(core(elem));
    if (ci === -1 && core(elem).computed)
      ci = list.length - 1;

    if (!errt_track(elctx))
      continue;

    if (errt_ptrack(elctx) && this.pt_override(pt)) {
      pt = this.pt, pe = this.pe, po = elem;
      if (errt_pin(pt))
        pc0 = this.pin.p.c0, pli0 = this.pin.p.li0, pcol0 = this.pin.p.col0;
      if (errt_psyn(pt))
        elctx |= CTX_HAS_A_PARAM_ERR;
    }
    if (errt_atrack(elctx) && this.at_override(at)) {
      at = this.at; ae = this.ae; ao = elem;
      if (errt_pin(at))
        ac0 = this.pin.a.c0, ali0 = this.pin.a.li0, acol0 = this.pin.a.col0;
      if (errt_asyn(at))
        elctx |= CTX_HAS_AN_ASSIG_ERR;
    }
    if (errt_strack(elctx) && this.st_override(st)) {
      st = this.st; se = this.se; so = elem;
      if (errt_pin(st))
        sc0 = this.pin.s.c0, sli0 = this.pin.s.li0, scol0 = this.pin.s.col0;
      if (errt_ssyn(st))
        elctx |= CTX_HAS_A_SIMPLE_ERR;
    }
  } while (this.lttype === CH_COMMA);

  elem ? this.spc(core(elem), 'aft') : this.suc(cb, 'inner');

  n = {
    properties: list,
    type: 'ObjectExpression',
    start: c0,
    end: this.c,
    loc: { start: loc0, end: this.loc() }, 
    '#c': cb,
    '#ci': ci,
    '#y': y, '#rest': -1 /* rest */, '#t': null
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

  if (!this.expectT(CH_RCURLY))
    this.err('obj.unfinished');

  return n;
};


