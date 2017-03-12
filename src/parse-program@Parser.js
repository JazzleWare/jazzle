this.parseProgram = function () {
  var startc = this.c, li = this.li, col = this.col;
  var endI = this.c , startLoc = null;
  var globalScope = null;

  // #if V
  globalScope = new GlobalScope();
  // #end
 
  this.directive = !this.isScipt ? DIR_SCRIPT : DIR_MODULE; 
  this.clearAllStrictErrors();

  this.scope = new Scope(globalScope, ST_SCRIPT);
  this.scope.parser = this;
  if (!this.isScript)
    this.scope.enterStrict();

  this.next();

  var list = this.blck(); 

  this.scope.finish();
  globalScope.finish();

  var n = {
    type: 'Program',
    body: list,
    start: 0,
    end: this.src.length,
    sourceType: !this.isScript ? "module" : "script" ,
    loc: {
      start: {line: li, column: col},
      end: {line: this.li, column: this.col}
    }, scope: this.scope
  };

  if (this.onToken_ !== null) {
    if (typeof this.onToken_ !== FUNCTION_TYPE)
      n.tokens = this.onToken_;
  }

  if (this.onComment_ !== null) {
    if (typeof this.onComment_ !== FUNCTION_TYPE)
      n.comments = this.onComment_;
  }

  if ( !this.expectType_soft ('eof') &&
        this.err('program.unfinished') )
    return this.errorHandlerOutput ;

  return n;
};
