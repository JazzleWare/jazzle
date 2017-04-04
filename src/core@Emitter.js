this.indent = function() {
  this.indentLevel++; 
};

this.i = function() {
  this.indent();
  return this; 
};

this.l = function() {
  this.startLine();
  return this; 
};

this.emitHead =
function(n, isStmt, flags) {
  return this.emitAny(n, isStmt, flags|EC_EXPR_HEAD|EC_NON_SEQ);
};

this.eH = function(n, isStmt, flags) {
  this.emitHead(n, isStmt, flags);
  return this;
};

this.emitAny = function(n, isStmt, startStmt) {
  if (HAS.call(Emitters, n.type))
    return Emitters[n.type].call(this, n, isStmt, startStmt);
  this.err('unknow.node');
};

this.eA = function(n, isStmt, startStmt) {
  this.emitAny(n, isStmt, startStmt); 
  return this; 
};

this.emitNonSeq = function(n, isStmt, flags) {
  this.emitAny(n, isStmt, flags|EC_NON_SEQ);
};

this.eN = function(n, isStmt, flags) {
  this.emitNonSeq(n, isStmt, flags);
  return this;
};

this.write = function(rawStr) {
  if (this.lineStarted) {
    this.code += this.getOrCreateIndent(this.indentLevel);
    this.lineStarted = false;
  }
  this.code += rawStr;
};

this.w = function(rawStr) {
  ASSERT.call(this, arguments.length === 1,
    'one argument was expected but got '+arguments.length);

  this.write(rawStr);
  return this;
};

this.space = function() {
  if (this.lineStarted)
    this.err('useless.space');

  this.write(' ');
};

this.s = function() {
  this.space();
  return this;
};

this.writeMulti =
this.wm = function() {
  var i = 0;
  while (i < arguments.length) {
    var str = arguments[i++];
    if (str === ' ')
      this.space();
    else
      this.write(str);
  }

  return this;
};

this.unindent = function() {
  if (this.indentLevel <= 0)
    this.err('unindent.nowidth');

  this.indentLevel--;
};

this.u = function() {
  this.unindent();
  return this;
};

this.getOrCreateIndent = function(indentLen) {
  var cache = this.indentCache;
  if (indentLen >= cache.length) {
    if (indentLen !== cache.length)
      this.err('inceremental.indent');
    cache.push(cache[cache.length-1] + this.spaceString);
  }
  return cache[indentLen];
};

this.startLine = function() {
  this.insertNL();
  this.lineStarted = true;
};

this.insertNL = function() {
  this.code += '\n';
};

this.noWrap = function() {
  this.noWrap_ = true;
  return this;
};

this.jz = function(name) {
  return this.wm('jz','.',name);
};

this.emitCallHead = function(n, isStmt, flags) {
  return this.eH(n, isStmt, flags|EC_CALL_HEAD);
};

this.emitNewHead = function(n, isStmt, flags) {
  return this.eH(n, isStmt, flags|EC_NEW_HEAD);
};
