function Scope(sParent, sType) {
  this.parent = sParent;
  this.type = sType;
  this.scs = this.isConcrete() ?
    this :
    this.parent.scs;
  
  this.defs = new SortedObj();
  this.liquidDefs = this.isConcrete() ? new SortedObj() : null;
  this.refs = new SortedObj();

  this.synthNamesUntilNow = null;

  this.allowed = this.calculateAllowedActions();
  this.mode = this.calculateScopeMode();
  if (this.isCtorComp() && this.isBody() && !this.cls().hasHeritage())
    this.allowed &= ~SA_CALLSUP;

  this.ch = [];
  if (this.parent)
    this.parent.ch.push(this);

  this.special = this.calculateSpecial();

  this.idRef = this.parent ? this.parent.idRef : {v: 0};
  this.id = this.idRef.v++;

  this.diRef = this !== this.scs ? this.scs.diRef : {v: 0};
  this.di = this.diRef.v++;

  this.funcDecls = [];

  this.parser = this.parent ? this.parent.parser : null;
  this.hasTZ = false;
}
