function Scope(sParent, sType) {
  this.parent = sParent;
  this.type = sType;
  this.scs = this.isConcrete() ?
    this :
    this.parent.scs;
  
  this.defs = new SortedObj();
  this.refs = new SortedObj();

  this.allowed = this.calculateAllowedActions();
  this.mode = this.calculateScopeMode();
  if (this.isCtorComp() && !this.parent.hasHeritage())
    this.allowed &= ~SA_CALLSUP;

  this.labelTracker = new LabelTracker();
  this.allNames = this.parent ? 
    this.parent.allNames :
    new SortedObj();

  this.resolveCache = new SortedObj();

  this.iRef = this.parent ? this.parent.iRef : {v: 0};

  this.headI = this.iRef.v++;
  this.tailI = -1;

  this.ch = [];
  if (this.parent)
    this.parent.ch.push(this);

  this.parser = this.parent ? this.parent.parser : null;
}
