function Scope(sParent, type) {
  this.parent = sParent;
  this.type = type;
  this.refs = new SortedObj();
  this.defs = new SortedObj();
  this.hasTZCheckPoint = false;
  this.scs = this.isConcrete() ?
    this :
    this.parent.scs;

  this.allowedActions = this.determineActions();
  this.misc = this.determineMisc();

  this.scopeID_ref = this.parent ?
    this.parent.scopeID_ref : {v: 0};
  this.scopeID = this.scopeID_ref.v++;

  this.parser = this.parent && this.parent.parser;

  this.di_ref = this.isConcrete() ?
    {v: 0} : this.parent.diRef;
  this.di0 = this.di_ref.v++;
};
