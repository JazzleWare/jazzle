  import {ERR_NONE_YET, agtb, ERR_PAREN_UNBINDABLE, ERR_SHORTHAND_UNASSIGNED, ERR_NON_TAIL_REST, ERR_ARGUMENTS_OR_EVAL_ASSIGNED, ERR_YIELD_OR_SUPER, ERR_UNEXPECTED_REST, ERR_EMPTY_LIST_MISSING_ARROW, ERR_NON_TAIL_EXPR, ERR_INTERMEDIATE_ASYNC, ERR_ASYNC_NEWLINE_BEFORE_PAREN, ERR_PIN_NOT_AN_EQ, ERR_ARGUMENTS_OR_EVAL_DEFAULT, ERR_PIN_OCTAL_IN_STRICT} from '../other/error-constants.js';
  import {ASSERT, HAS} from '../other/constants.js';
  import {errt_pin} from '../other/errt.js';
  import {cls} from './cls.js';

cls.pt_override =
function(pt) {
  return this.pt !== ERR_NONE_YET &&
    (pt === ERR_NONE_YET || agtb(this.pt, pt));
};

cls.at_override =
function(at) {
  return this.at !== ERR_NONE_YET &&
    (at === ERR_NONE_YET || agtb(this.at, at));
};

cls.st_override =
function(st) {
  return this.st !== ERR_NONE_YET &&
    (st === ERR_NONE_YET || agtb(this.st, st));
};

cls.pt_reset =
function() { this.pt = ERR_NONE_YET; };

cls.at_reset =
function() { this.at = ERR_NONE_YET; };

cls.st_reset =
function() { this.st = ERR_NONE_YET; };

// tricky map
var tm = {};

tm[ERR_PAREN_UNBINDABLE] = 'paren.unbindable';
tm[ERR_SHORTHAND_UNASSIGNED] = 'shorthand.unassigned';
tm[ERR_NON_TAIL_REST] = 'non.tail.rest';
tm[ERR_ARGUMENTS_OR_EVAL_ASSIGNED] = 'assig.to.arguments.or.eval';
tm[ERR_YIELD_OR_SUPER] = 'param.has.yield.or.super';
tm[ERR_UNEXPECTED_REST] = 'unexpected.rest';
tm[ERR_EMPTY_LIST_MISSING_ARROW] = 'arrow.missing.after.empty.list';
tm[ERR_NON_TAIL_EXPR] = 'seq.non.tail.expr';
tm[ERR_INTERMEDIATE_ASYNC] = 'intermediate.async';
tm[ERR_ASYNC_NEWLINE_BEFORE_PAREN] = 'async.newline.before.paren';
tm[ERR_PIN_NOT_AN_EQ] = 'complex.assig.not.pattern';

cls.pt_flush =
function() {
  ASSERT.call(this, this.pt === ERR_NONE_YET,
    'pending errors in pt');
  this.st = this.at = ERR_NONE_YET;
};

cls.at_flush =
function() {
//ASSERT.call(this, this.at === ERR_NONE_YET,
//  'pending errors in at');
  // [a-=b,l=e]
  this.at = ERR_NONE_YET;
  this.st = this.pt = ERR_NONE_YET;
};

cls.st_flush =
function() {
  this.at = this.pt = ERR_NONE_YET;
  if (this.st === ERR_NONE_YET)
    return;
  ASSERT.call(this, HAS.call(tm, this.st),
    'Unknown error value: ' + this.st);
  var st = this.st, se = this.se, so = this.so;
  this.st_reset();

  var ep = {};
  ep.tn = se;
  if (errt_pin(st)) {
    var pin = this.pin.s;
    ep.c0 = pin.c0; ep.li0 = pin.li0; ep.col0 = pin.col0;
  }

  return this.err(tm[st], ep) ;
};

cls.throwTricky =
function(name, t) { // TODO: eliminate
  var core = name === 'p' ? this.pe : name === 'a' ? this.ae : this.se;
  this.err(tm[t], {tn: core});
};
  
cls.pt_teot =
function(t,e,o) { this.pt = t; this.pe = e; this.po = o; };

cls.at_teot =
function(t,e,o) { this.at = t; this.ae = e; this.ao = o; };

cls.st_teot =
function(t,e,o) { this.st = t; this.se = e; this.so = o; };

cls.st_adjust_for_toAssig =
function() {
  if (this.st === ERR_ARGUMENTS_OR_EVAL_ASSIGNED)
    this.st = ERR_ARGUMENTS_OR_EVAL_DEFAULT;
  else
    this.st = ERR_NONE_YET;
};

cls.pin_at =
function(c0,li0,col0) { return this.pinErr(this.pin.a,c0,li0,col0); };

cls.pin_ct =
function(c0,li0,col0) { return this.pinErr(this.pin.c,c0,li0,col0); };

cls.pin_st =
function(c0,li0,col0) { return this.pinErr(this.pin.s,c0,li0,col0); };

cls.pin_pt =
function(c0,li0,col0) { return this.pinErr(this.pin.p,c0,li0,col0); };

cls.pinErr =
function(pin,c0,li0,col0) { pin.c0=c0; pin.li0=li0; pin.col0=col0; };

cls.strict_esc_chk =
function() {
  if (this.ct === ERR_NONE_YET)
    return;

  ASSERT.call(this, this.ct === ERR_PIN_OCTAL_IN_STRICT,
    'currently the only error for strict_esc_chk is ERR_PIN_OCTAL_IN_STRICT');

  this.err('strict.octal');
};


