Emitters['#ResolvedName'] = function(n, prec, flags) {
  var isV = false;
  if (n.decl.isLexical() &&
    n.decl.ref.scope.insideLoop() && n.decl.ref.indirect)
    isV = true;

  if (n.shouldTest)
    this.emitResolvedName_tz(n, prec, flags, isV, n.alternate);
  else
    this.emitResolvedName_simple(n, prec, flags, isV);
};

this.emitResolvedName_tz = function(n, prec, flags, isV, alternate) {
  var paren = flags & (EC_NEW_HEAD|EC_EXPR_HEAD|EC_CALL_HEAD);
  paren && this.w('(');
  var liquidSource = n.decl.ref.scope.scs;
  if (liquidSource.isAnyFnHead())
    liquidSource = liquidSource.funcBody; 

  this.writeName(liquidSource.getLiquid('tz').synthName)
      .w('<').writeNumWithVal(n.decl.i).w('?')
      .jz('tz').wm('(',"'").writeStrWithVal(n.name).wm("'",')').w(':');  
  if (alternate) {
    var a = alternate;
    if (a.type === '#Untransformed' && a.kind === 'const-check')
      a = alternate.assigner;
 
    var core = null;
    switch (a.type) {
    case '#SubAssig':
    case 'AssignmentExpression':
      core = a.left;
      break;
    case 'UpdateExpression':
      core = a.argument;
      break;
    default:
      ASSERT.call(this, false, 'Unknown alternate has type <'+a.type+'>');
    }
    ASSERT.call(this, core === n,
      'alternate must have the same head as the resolved name');
    core.shouldTest = false;
    this.eN(alternate, PREC_NONE, EC_NONE);
  }
  else if (isV)
    this.writeVName(n.decl.synthName, EC_NONE);
  else
    this.writeName(n.decl.synthName);

  paren && this.w(')');
};

this.emitResolvedName_simple = function(n, prec, flags, isV) {
  if (isV) this.writeVName(n.decl.synthName, flags);
  else if (n.decl.isGlobal) this.writeGName(n.decl, flags);
  else this.writeName(n.decl.synthName);
};

this.writeVName = function(name, flags) {
  var zero = flags & EC_CALL_HEAD;
  if (zero) this.wm('(','0',',');
  this.writeName(name).wm('.','v');
  zero && this.w(')');
  return this;
};

this.writeGName = function(decl, flags) {
  var zero = false;
  if (decl.synthName === '<global>') {
    zero = flags & EC_CALL_HEAD;
    zero && this.wm('(','0',',');
    this.wm(decl.ref.scope.scriptScope.findLiquid('<this>').synthName,'.',decl.name);
    zero && this.w(')');
  }
  else
    this.writeName(decl.synthName);
};

this.writeName = function(name) {
  this.w(name);
  return this;
};
