this.emitTopLevelBindings = function(scope, needsNL) {
  var emitted = false;
  ASSERT.call(this, scope.isScript() || scope.isModule(),
    'a script or module was actually expected but got <'+scope.typeString()+'>');
  var list = scope.funcDecls, i = 0, len = list.length(), elem = null;
  while (i < len) {
    if (i === 0 && needsNL) { this.l(); needsNL = false }
    else if (i > 0) this.l();
    this.emitTopLevelFnList(list.at(i++));
  }
    
  needsNL = emitted = len > 0;

  list = scope.defs,
  i = 0,
  len = list.length(),
  elem = null;
  var b = 0;

  while (i < len) {
    elem = list.at(i++);
    if (elem.isVName()) {
      if (b === 0) {
        if (needsNL) { this.l(); needsNL = false; }
        this.w('var').s();
      }
      else this.w(',').s();
      this.w(elem.synthName);
      b++;
    }
  }
  b && this.w(';');
  return emitted || b !== 0;
}; 

this.emitTopLevelFnList = function(fnList) {
  var i = 0;
  while (i < fnList.length) {
    i && this.l();
    this.emitTopLevelFn(fnList[i], i === 0);
    i++;
  }
};

this.emitTopLevelFn = function(n, isFirst) {
  var fn = n.fn, decl = n.decl, hasVar = false;
  if (decl.name !== decl.synthName && isFirst) {
    hasVar = true;
    isFirst = false;
  }
  if (isFirst)
    this.emitRawFn(fn, decl.name);
  else {
    hasVar && this.wm('var',' ');
    this.w(decl.synthName)
      .wm(' ','=',' ')
      .emitRawFn(fn, decl.name);
    this.w(';');
  }
};

this.emitLexicalBindings = function(scope, needsNL) {
  var list = scope.defs, i = 0, len = list.length(), elem = null, b = 0;
  while (i < len) {
    elem = list.at(i++);
    if (!scope.ownsDecl(elem) || !elem.isLlinosa())
      continue;
    if (b === 0) {
      if (needsNL) { this.l(); needsNL = false; }
      this.wm('var',' ');
    }
    else if (b > 0) 
      this.wm(',',' ');

    this.emitLlinosa(elem);
    b++;
  }

  var emitted = b > 0;
  if (emitted) {
    this.w(';');
    needsNL = true;
  }

  list = scope.funcDecls, i = 0, len = list.length();
  while (i < len) {
    elem = list.at(i);
    ASSERT.call(this, elem.length === 1,
      'lexical fns are not allowed to have more than a single defsite');

    if (i === 0 && needsNL) { this.l(); needsNL = false; }
    else if (i > 0) this.l();
    this.emitLexicalFn(elem[0]);
    i++;
  }

  if (!emitted) emitted = !i;
  return emitted;
};

this.emitLlinosa = function(llinosa) {
  this.w(llinosa.synthName).s().w('=').s().wm('{','v',':',' ','void',' ','0','}');
};

this.emitLexicalFn = function(n) {
  var fn = n.fn, decl = n.decl;
  var isV = decl.isLlinosa(), loopLexicals = null;

  if (!isV) this.wm('var').s();
  this.w(decl.synthName);
  if (isV) this.wm('.','v');

  this.s().w('=').s();

  loopLexicals = this.getLoopLexicalRefList(fn.scope);
  if (loopLexicals) {
    this.writeClosureHead(loopLexicals);
    this.i().l().w('return').s();
    this.emitRawFn(fn, decl.name);
    this.w(';').u().l();
    this.writeClosureTail(loopLexicals);
  }
  else
    this.emitRawFn(fn, decl.name);

  this.w(';');
};
