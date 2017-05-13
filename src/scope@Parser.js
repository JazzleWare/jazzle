this.declare = function(id) {
   ASSERT.call(this, this.declMode !== DT_NONE, 'Unknown declMode');
   if (this.declMode & (DT_LET|DT_CONST)) {
     if (id.name === 'let')
       this.err('lexical.name.is.let');
   }

   var decl = this.scope.decl_m(_m(id.name), this.declMode);
   !decl.site && decl.s(id);
};

this.enterScope = function(scope) {
  this.scope = scope;
};

this.exitScope = function() {
  var scope = this.scope;
  scope.finish();
  this.scope = this.scope.parent;
  return scope;
};

this.allow = function(allowedActions) {
  this.scope.actions |= allowedActions;
};
