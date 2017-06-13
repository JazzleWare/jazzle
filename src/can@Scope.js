this.canSmem =
function() { return this.actions & SA_MEMSUPER; };

this.canAwait = 
function() { return this.actions & SA_AWAIT; };

this.canBreak = 
function() { return this.actions & SA_BREAK; };

this.canDeclareLexical =
function() {
  if (this.isBlock() ||
    this.isModule() ||
    this.isScript())
    return true;

  if (this.isAnyFn() || this.isCatch())
    return this.inBody;
  
  return this.insideForInit();
};

this.canScall = 
function() { return this.actions & SA_CALLSUPER; };

this.canDeclareFn =
function(st) {
  if (this.isBlock() ||
    this.isModule() ||
    this.isScript())
    return true;

  if (this.isAnyFn() || this.isCatch())
    return this.inBody;

  ASSERT.call(this, this.isBare(),
    'a bare scope was expected but got '+
    this.typeString());

  if (st & (ST_GEN|ST_ASYNC))
    return false;

  return this.insideIf();
};

this.canYield = 
function() { return this.actions & SA_YIELD; };

this.canMakeThis =
function() {
  if (this.isAnyFn())
    return !this.isArrow();
  return this.isSourceLevel();
};

this.canReturn = 
function() { return this.actions & SA_RETURN; };

this.canContinue = 
function() { return this.actions & SA_CONTINUE; };

this.canAccessNewTarget =
function() { return this.actions & SA_NEW_TARGET; };

this.canHaveName =
function() { return this.isAnyFn() || this.isClass(); };
