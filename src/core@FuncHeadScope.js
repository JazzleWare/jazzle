this.verifyForStrictness = function() {
  if (this.firstDup)
    this.parser.err('argsdup');
  if (this.firstNonSimple)
    this.parser.err('non.simple');

  var list = this.paramList, i = 0;
  while (i < list.length) {
    var elem = list[i];
    if (arguments_or_eval(elem.name))
      this.err('binding.eval.or.arguments.name');
    this.parser.validateID(elem.name);
    i++ ;
  }
};

this.exitUniqueArgs = function() {
  ASSERT.call(this, this.insideUniqueArgs(),
    'can not unset unique when it has not been set');

  this.mode &= ~SM_UNIQUE;
};

this.enterUniqueArgs = function() {
  if (this.firstDup)
    this.parser.err('argsdup');
  if (this.insideUniqueArgs())
    return;

  this.mode |= SM_UNIQUE;
};

this.absorb = function(parenScope) {
  ASSERT.call(this, this.isArrowComp() && this.isHead(),
    'the only scope allowed to take in a paren is an arrow-head');
  ASSERT.call(this, parenScope.isParen(),
    'the only scope that can be absorbed into an arrow-head is a paren');

  parenScope.parent = this;

  this.firstNonSimple = parenScope.firstNonSimple;
  this.firstDup = parenScope.firstDup;
  this.refs = parenScope.refs;
  if (this.firstDup)
    this.parser.err('argsdup');

  this.paramMap = parenScope.paramMap;
  this.paramList = parenScope.paramList;

  this.headI = parenScope.headI;
  this.tailI = parenScope.tailI;

  var list = this.paramList, i = 0;
  while (i < list.length)
    list[i++].ref.direct.fw--; // one ref is a decls
};

this.writeTo = function(emitter) {
  var list = this.paramList, i = 0;
  emitter.w(this.headI+':<arglist type="'+this.typeString()+'">');
  if (list.length !== 0) {
    emitter.i();
    while (i < list.length) {
      emitter.l();
      list[i++].writeTo(emitter);
    }
    emitter.u().l();
  }
  emitter.w(this.tailI+':</arglist>');
};
