  import {CTX_FOR, PAREN_NODE, CTX_PARPAT, CTX_NO_SIMPLE_ERR, CTX_PARAM, CTX_TOP} from '../other/constants.js';
  import {ERR_PAREN_UNBINDABLE, ERR_NONE_YET, ERR_PIN, ERR_PIN_NOT_AN_EQ} from '../other/error-constants.js';
  import {core} from '../other/util.js';
  import {errt_top, errt_pin, errt_track, errt_param, errt_pat} from '../other/errt.js';
  import {PREC_NONE} from '../other/lexer-constants.js';
  import {cls} from './ctor.js';

cls.parseAssignment = function(head, ctx) {
  var o = this.ltraw;
  if (o === '=>')
    return this.parseArrow(head, ctx&CTX_FOR);

  if (head.type === PAREN_NODE) {
    if (!this.ensureSAT(head.expr)) {
      this.at = ERR_PAREN_UNBINDABLE;
      this.ae = this.ao = head;
      this.throwTricky('a', this.at, this.ae);
    }
    else
      this.dissolveParen();
  }

  this.spc(core(head), 'aft');
  var right = null, oploc = null;
  if (o === '=') {
    // if this assignment is a pattern
    if (ctx & CTX_PARPAT)
      this.st_adjust_for_toAssig();

    var st = ERR_NONE_YET, se = null, so = null,
        pt = ERR_NONE_YET, pe = null, po = null;

    // S- and P-errors are not modified during toAssig; A-errors might.
    this.toAssig(core(head), ctx);

    // flush any remaining simple errors, now that there are no more assignment errors;
    // when toAssig completes, it might have set this.st with an assig-to-arguments-or-eval;
    // this will get thrown immediately if the assignment is non-leaking, i.e., 
    // won't tolerate simple errors
    if ((ctx & CTX_NO_SIMPLE_ERR) && this.st !== ERR_NONE_YET)
      this.throwTricky('s', this.st);

    var sc0 = -1, sli0 = -1, scol0 = -1,
        pc0 = -1, pli0 = -1, pcol0 = -1;

    // save all the errors on the left hand side, to restore them after right is parsed
    if ((ctx & CTX_PARPAT) && this.st !== ERR_NONE_YET) {
      st = this.st; se = this.se; so = this.so;
      if (st & ERR_PIN)
        sc0 = this.pin.s.c0, sli0 = this.pin.s.li0, scol0 = this.pin.s.col0;
    }
    if ((ctx & CTX_PARAM) && this.pt !== ERR_NONE_YET) {
      pt = this.pt; pe = this.pe; po = this.po;
      if (pt & ERR_PIN)
        pc0 = this.pin.p.c0, pli0 = this.pin.p.li0, pcol0 = this.pin.p.col0;
    }

    // toAssig was successful -- clear
    this.at_flush();
    if (errt_top(ctx))
      ctx &= ~CTX_TOP; // a top assig is not a pattern

    this.next(); // '='
    right = this.parseNonSeq(PREC_NONE,
      (ctx & CTX_FOR)|CTX_TOP);

    // restore the state of errors in the left hand side, if there are any
    if (pt !== ERR_NONE_YET) {
      this.pt = pt; this.pe = pe; this.po = po;
      errt_pin(pt) && this.pin_pt(pc0,pli0,pcol0);
    }
    if (st !== ERR_NONE_YET) {
      this.st = st; this.se = se; this.so = so;
      errt_pin(st) && this.pin_st(sc0,sli0,scol0);
    }
  }
  else {
    // TODO: further scrutiny, like checking for this.at, is necessary (?)
    if (!this.ensureSAT(core(head)))
      this.err('assig.not.simple',{tn:core(head)});

    if (errt_top(ctx))
      ctx &= ~CTX_TOP;

    var c0 = -1, li0 = -1, col0 = -1;

    // if this is an potential assignment pattern, pin the location of the non-'='
    if (ctx & CTX_PARPAT) {
      c0 = this.c0; li0 = this.li0; col0 = this.col0;
    }

    if (o === '+=') oploc = this.loc0();
    this.next(); // <:o:>=
    right = this.parseNonSeq(PREC_NONE, (ctx & CTX_FOR)|CTX_TOP);

    // record an actual error if we have parsed a potential param or assignment pattern
    if (errt_track(ctx)) {
      if (errt_param(ctx)) {
        this.pin_pt(c0,li0,col0);
        this.pt = ERR_PIN_NOT_AN_EQ;
      }
      if (errt_pat(ctx)) {
        this.pin_at(c0,li0,col0);
        this.at = ERR_PIN_NOT_AN_EQ;
      }
    }
  }
 
  this.inferName(head, core(right), false);
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
    }, '#o': oploc,
    '#y': this.Y(head)+this.Y(right), '#c': {}
  };
};


