function GlobalScope() {
  ConcreteScope.call(this, null, ST_GLOBAL);  
  this.scriptScope = null;
}

