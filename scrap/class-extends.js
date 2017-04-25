LexicalScope.prototype = createObj(Scope.prototype);
CatchBodyScope.prototype = createObj(LexicalScope.prototype);
CatchHeadScope.prototype = createObj(LexicalScope.prototype);
GlobalScope.prototype = createObj(Scope.prototype);
FuncHeadScope.prototype = createObj(Scope.prototype);
FuncBodyScope.prototype = createObj(Scope.prototype);
ClassScope.prototype = createObj(Scope.prototype);
