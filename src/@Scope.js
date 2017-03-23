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
  if (this.isCtorComp() && this.isBody() && !this.cls().hasHeritage())
    this.allowed &= ~SA_CALLSUP;

  this.allSynthNames = this.isConcrete() ? new SortedObj() : null;
  this.ch = [];
  if (this.parent)
    this.parent.ch.push(this);

  this.synthLiquids = this.isConcrete() ? new SortedObj() : null;
  this.liquidRefs = new SortedObj();

  this.special = this.calculateSpecial();
  this.id = this.parent ? this.parent.id++ : 1;

  this.funcDecls = [];

  this.parser = this.parent ? this.parent.parser : null;
}
