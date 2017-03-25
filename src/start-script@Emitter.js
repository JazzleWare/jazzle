this.emitJZ = function(n) {
  var jz = this.findLiquid(n.scope, 'jz');
  if (!jz) return;

  this.wm('var',' ',jz.synthName,';').l();
};

this.emitGlobalNamespace = function(n) {
  var gns = this.findLiquid(n.scope.parent, '');
  if (!gns) return;

  this.wm('var',' ',gns.synthName,' ','=',' ','this',';');
};

this.emitThisInScript = function(n) {
  var sThis = n.scope.special.lexicalThis;
  if (!sThis)
    return;
  if (sThis.ref.indirect === 0)
    return;
  this.wm('var',' ',sThis.synthName,' ','=',' ','this',';');
};

this.emitTemps = function(n) {
  var scope = n.scope, t = 0, list = scope.synthDefs;
  var len = list.length(), i = 0;
  while (i < len) {
    var tdecl = list.at(i++);
    if (tdecl.isTemp()) {
      if (t === 0) this.w('var').s();
      else this.wm(',',' ');
      this.w(tdecl.synthName);
      t++;
    }
  }
};

this.emitVars = function(n) {
  var scope = n.scope, v = 0, list = scope.synthDefs;
  var len = list.length(), i = 0;
  while (i < len) {
    var vdecl = list.at(i++);
    if (vdecl.type === DM_VAR) {
      this.w(v?',':'var').s().w(vdecl.synthName);
      v++;
    }
  }
};

this.emitFuncs = function(n) {
  var list = n.scope.funcDecls, i = 0;
  while (i < list.length)
    this.emitFuncDecl(list[i++]);
};

this.emitScriptStart = function(n) {
  this.emitJZ(n);
  this.emitGlobalNamespace(n);
  this.emitThisInScript(n);
  this.emitTemps(n);
  this.emitFuncs(n);
  this.emitVars(n);
};

