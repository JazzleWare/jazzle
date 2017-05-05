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

this.flushSimpleErrors =
function() {
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

this.st_reset = 
function() { this.se = ERR_NONE_YET; };
  
// TODO: trickyContainer
this.throwTricky = function(source, trickyType) {
  if (!HAS.call(tm, trickyType))
    throw new Error("Unknown error value: "+trickyType);

  var t = null, errParams = {};
  if (trickyType & ERR_PIN) {
    t = source === 'p' ? this.ploc :
        source === 'a' ? this.aloc :
        source === 's' ? this.eloc : null;
    errParams = { c0: t.c0, li0: t.li0, col0: t.col0 };
  }
  else {
    errParams.tn = source === 'p' ? this.pe :
                   source === 'a' ? this.ae :
                   source === 's' ? this.se : null;
  }
  errParams.extra = { source: source };
  this.err(tm[trickyType], errParams);
}; 

this.adjustErrors = function() { 
  if (this.st === ERR_ARGUMENTS_OR_EVAL_ASSIGNED)
    this.st = ERR_ARGUMENTS_OR_EVAL_DEFAULT;
  else
    this.st = ERR_NONE_YET;
};

