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
function(n, flags, isStmt) {
  return this.emitAny(n, flags|EC_EXPR_HEAD|EC_NON_SEQ, isStmt);
};

this.eH = function(n, flags, isStmt) {
  this.emitHead(n, flags, isStmt);
  return this;
};

this.emitAny = function(n, flags, isStmt) {
  if (HAS.call(Emitters, n.type))
    return Emitters[n.type].call(this, n, flags, isStmt);
  this.err('unknow.node');
};

this.eA = function(n, flags, isStmt) {
  this.emitAny(n, flags, isStmt); 
  return this; 
};

this.emitNonSeq = function(n, flags, isStmt) {
  this.emitAny(n, flags|EC_NON_SEQ, isStmt);
};

this.eN = function(n, flags, isStmt) {
  this.emitNonSeq(n, flags, isStmt);
  return this;
};

this.write = function(rawStr) {
  ASSERT.call(this, rawStr !== "",
    'not allowed to write empty strings to output');

  if (this.hasLine) {
    this.hasLine = false;
    this.l();
  }

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
    while (indentLen >= cache.length)
      cache.push(cache[cache.length-1] + this.spaceString);
  }
  return cache[indentLen];
};

// swap code
this.sc =
function(c) {
  var c0 = this.code;
  this.code = c;
  return c0;
};

this.startLine = function() {
  this.insertNL();
  this.lineStarted = true;
};

this.ac =
function(c) {
  this.code += c;
  return this;
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

this.emitCallHead = function(n, flags) {
  return this.eH(n, flags|EC_CALL_HEAD, false);
};

this.emitNewHead = function(n) {
  return this.eH(n, EC_NEW_HEAD, false);
};

// write shadow line; differs from `l() in that a newline is only inserted if something comes after it
this.wsl =
function() {
  if (!this.hasLine)
    this.hasLine = true;
  return this;
};

this.csl =
function() {
  if (this.hasLine) {
    this.hasLine = false;
    return true;
  }
  return false;
};
