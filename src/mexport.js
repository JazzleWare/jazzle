this.parse = function(src, isModule ) {
  var newp = new Parser(src, isModule);
  return newp.parseProgram();
};

this.Parser = Parser;  
// this.ErrorString = ErrorString;
// this.Template = Template;
this.Emitter = Emitter;
this.Transformer = Transformer;
// this.Scope = Scope;
// this.Hitmap = Hitmap;
// this.GlobalScope = GlobalScope;

this.transpile = function(src, options) {
  var p = new Parser(src, options);
  return new Emitter().eA(
    new Transformer().tr(p.parseProgram()),
    EC_NONE,
    false).code ;
};
