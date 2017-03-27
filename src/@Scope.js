function Scope(sParent, sType) {
  this.parent = sParent;
  this.type = sType;
  this.scs = this.isConcrete() ?
    this :
    this.parent.scs;
  
  this.defs = new SortedObj();
  this.synthDefs = this.isConcrete() ? new SortedObj() : null;
  this.liquidDefs = this.isConcrete() ? new SortedObj() : null;
  this.refs = new SortedObj();

  this.synthNamesUntilNow =
    this.isConcrete() ? new SortedObj() : null;

  this.allowed = this.calculateAllowedActions();
  this.mode = this.calculateScopeMode();
  if (this.isCtorComp() && this.isBody() && !this.cls().hasHeritage())
    this.allowed &= ~SA_CALLSUP;

  this.ch = [];
  if (this.parent)
    this.parent.ch.push(this);

  this.special = this.calculateSpecial();
  this.id = this.parent ? this.parent.id++ : 1;

  this.funcDecls = [];

  this.parser = this.parent ? this.parent.parser : null;
}
