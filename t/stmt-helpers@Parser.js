this . findLabel = function(name) {
    return HAS.call(this.labels, name) ?this.labels[name]:null;

};

this .ensureStmt_soft = function() {
   if ( this.canBeStatement ) {
     this.canBeStatement = false;
     return true;
   }
   return false;
};

this . fixupLabels = function(loop) {
    if ( this.unsatisfiedLabel ) {
         this.unsatisfiedLabel.loop = loop;
         this.unsatisfiedLabel = null;
    }
};

this.enterCatchScope = function() {
  this.scope = this.scope.spawnCatch();
};

this.blck = function () { // blck ([]stmt)
  var isFunc = false, stmt = null, stmts = [];
  if (this.directive !== DIR_NONE)
    this.parseDirectives(stmts);

  while (stmt = this.parseStatement(true))
    stmts.push(stmt);

  return (stmts);
};

this.checkForStrictError = function(directive) {
  if (this.esct !== ERR_NONE_YET)
    this.err('strict.err.esc.not.valid');
};

this.parseDirectives = function(list) {
  if (this.v < 5)
    return;

  var r = this.directive;

  // TODO: maybe find a way to let `numstr` take over this process (partially, at the very least);
  // that way, there will no longer be a need to check ltval's type
  while (this.lttype === 'Literal' && typeof this.ltval === STRING_TYPE) {
    this.directive = DIR_MAYBE|r;
    var rv = this.src.substring(this.c0+1, this.c-1);

    // other directives might actually come after "use strict",
    // but that is the only one we are interested to find; TODO: this behavior ought to change
    if (rv === 'use strict')
      this.directive |= DIR_LAST;

    this.dv.value = this.ltval;
    this.dv.raw = rv;

    var elem = this.parseStatement(true);
    list.push(elem);

    if (this.directive & DIR_LAST)
      break;

  }

  this.directive = DIR_NONE;
};

this.gotDirective = function(dv, flags) {
  if (dv.raw === 'use strict') {
    this.scope.enterStrict();
    if (flags & DIR_FUNC)
      this.scope.funcHead.verifyForStrictness();

    this.checkForStrictError(flags);
  }
};
 
this.clearAllStrictErrors = function() {
  this.esct = ERR_NONE_YET;
  this.se = null;
};
 
