function Scope(sParent, type) {
  Actix.call(this, ACT_SCOPE);
  this.parent = sParent;
  this.parent && ASSERT.call(this, this.parent.reached, 'not reached');
  this.type = type;
  this.refs = new SortedObj();
  this.defs = new SortedObj();
  this.hasTZCheckPoint = false;
  this.scs =
    this.isGlobal() ?
      null :
      this.isConcrete() ?
        this :
        this.parent.scs;

  this.actions = this.determineActions();
  this.flags = this.determineFlags();

  this.scopeID_ref = this.parent ?
    this.parent.scopeID_ref : {v: 0};
  this.scopeID = this.scopeID_ref.v++;

  this.parser = this.parent && this.parent.parser;

  this.di_ref = 
    this.isGlobal() || this.isConcrete() ?
      {v: 0} :
      this.parent.di_ref;
  this.di0 = this.di_ref.v++;

  this.varTargets =
    this.isGlobal() ?
      null :
      this.isConcrete() ?
        {} :
        this.isCatch() ?
          createObj(this.parent.varTargets) :
          this.parent.varTargets;

  this.funLists = new SortedObj();

  this.synthBase = 
    this.isSourceLevel() ? null : this.isConcrete() ? this.scs :
    this.isBundle() || this.isGlobal() ? this : this.parent.synthBase;

  this.sourceScope = null;

  this.reached = true;
  if (this.parent && this.parent.isParen())
    this.parent.ch.push(this);
}
