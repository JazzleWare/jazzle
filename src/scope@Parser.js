this.declare = function(id) {
   ASSERT.call(this, this.declMode !== DM_NONE, 'Unknown declMode');
   if (this.declMode & (DM_LET|DM_CONST)) {
     if (id.name === 'let')
       this.err('lexical.name.is.let');
   }

   this.scope.declare(id.name, this.declMode).s(id);
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
  this.scope.allowed |= allowedActions;
};
