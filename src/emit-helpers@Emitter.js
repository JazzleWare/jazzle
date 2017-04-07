this.emitTZ = function(fn, needsNL) {
  var s = fn.scope;
  if (!s.hasTZ) return;
  needsNL && this.l();
//if (s.isConcrete())
//  this.wm('var',' ');
  var tz = s.scs.findLiquid('<tz>');
  this.w(tz.synthName).s().w('=').s().writeNumWithVal(s.di).w(';');
};

this.emitTemps = function(fn, needsNL) {
  var s = fn.scope, list = s.liquidDefs, e = 0, elem = null, len = list.length();
  while (e < len) {
    if (e === 0) {
      needsNL && this.l();
      this.w('var').s();
    }
    else this.w(',').s();
    elem = list.at(e++);
    this.w(elem.synthName);
  }
  e && this.w(';');
};

this.emitThis = function(fn, needsNL) {
  var s = fn.scope; 
  var _this = s.special.lexicalThis;
  if (_this === null)
    return;

  if (!_this.ref.indirect)
    return;

  needsNL && this.l();
  this.wm(_this.synthName,' ','=',' ','this',';');
};

this.emitPrologue = function(list, needsNL) {
  var i = 0, s = 0;
  while (i < list.length) {
    var stmt = list[i];
    if ( stmt.type === 'ExpressionStatement' &&
      stmt.expression.type === 'Literal' &&
      (typeof stmt.expression) === STRING_TYPE) {
      if (s===0 && needsNL) this.l();
      this.emitAny(stmt, true, EC_START_STMT);
      s++;
      i++;
    }
    else break;
  }
  return i;
};

this.emitArguments = function(fn) {};
this.emitVars = function(fn) {};
this.emitFuncs = function(fn) {};
