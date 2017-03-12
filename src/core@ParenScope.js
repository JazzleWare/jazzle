this.dissolve = function() {
  var list = this.paramList,
      i = 0,
      ref = null,
      elem = null;

  var refs = this.refs, parent = this.parent;
  list = refs.keys, i = 0;
  while (i < list.length) {
    var mname = list[i];
    elem = refs.get(mname),
    ref = parent.findRef_m(mname, true);

    if (ref.resolved)
      ref.resolved = false;

    ref.direct.fw += elem.direct.fw; 
    ref.direct.ex += elem.direct.ex;

    ref.indirect.fw += elem.indirect.fw;
    ref.indirect.ex += elem.indirect.ex;

    i++;
  }
};

this.addPossibleArgument = function(argNode) {
  var head = null;

  if (argNode.type === 'Property')
    argNode = argNode.value;

  if (argNode.type === 'Identifier')
    head = argNode;
//else if (
//  argNode.type === 'AssignmentExpression' &&
//  argNode.left.type === 'Identifier')
//  head = argNode.left;
  else if (
    argNode.type === 'SpreadElement' &&
    argNode.argument.type === 'Identifier')
    head = argNode.argument;

  if (!head)
    return;

  var name = head.name;
  var mname = _m(name);

  var existing = HAS.call(this.paramMap, mname) ?
    this.paramMap[mname] : null;

  var newDecl = new Decl().m(DM_FNARG).n(name);

  if (existing) {
    if (!this.firstDup)
      this.firstDup = newDecl;
  }
  else {
    var ref = this.findRef_m(mname, true);
    switch (name) {
    case 'arguments':
    case 'eval':
      if (!this.firstNonSimple)
        this.firstNonSimple = newDecl;
    }
    newDecl.r(ref);
    ref.resolve();
    this.paramMap[mname] = newDecl;
  }

  this.paramList.push(newDecl);
};

this.finish = function() {};
