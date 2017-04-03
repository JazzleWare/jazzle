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

  this.refs = parenScope.refs;
 
  var list = this.refs, i = 0;
  while (i < list.keys.length)
    list.at(i++).scope = this;

  list = parenScope.ch, i = 0;
  while (i < list.length)
    list[i++].parent = this;
};

this.hasScopeName_m = function(mname) {
  return this.scopeName &&
    this.scopeName.name === _u(mname); 
};

this.setScopeName = function(name) {
  ASSERT.call(this, !this.scopeName,
    'this scope has already got a name');
  this.scopeName =
    new Decl().m(DM_SCOPENAME)
              .r(new Ref(this))
              .n(name);

  return this.scopeName;
};

this.findDecl_m = function(mname) {
  if (HAS.call(this.paramMap, mname))
    return this.paramMap[mname];
  if (mname === RS_ARGUMENTS)
    return this.special.arguments;
  return null;
};
