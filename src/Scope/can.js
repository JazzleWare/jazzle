  import {SA_MEMSUPER, SA_AWAIT, SA_BREAK, SA_CALLSUPER, ST_GEN, ST_ASYNC, SA_YIELD, SA_RETURN, SA_CONTINUE, SA_NEW_TARGET} from '../other/scope-constants.js';
  import {ASSERT} from '../other/constants.js';
  import {cls} from './cls.js';

cls.canSmem =
function() { return this.actions & SA_MEMSUPER; };

cls.canAwait = 
function() { return this.actions & SA_AWAIT; };

cls.canBreak = 
function() { return this.actions & SA_BREAK; };

cls.canDeclareLexical =
function() {
  if (this.isBlock() ||
    this.isModule() ||
    this.isScript())
    return true;

  if (this.isAnyFn() || this.isCatch())
    return this.inBody;
  
  return this.insideForInit();
};

cls.canScall = 
function() { return this.actions & SA_CALLSUPER; };

cls.canDeclareFn =
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

cls.canYield = 
function() { return this.actions & SA_YIELD; };

cls.canMakeThis =
function() {
  if (this.isAnyFn())
    return !this.isArrow();
  return this.isSourceLevel();
};

cls.canReturn = 
function() { return this.actions & SA_RETURN; };

cls.canContinue = 
function() { return this.actions & SA_CONTINUE; };

cls.canAccessNewTarget =
function() { return this.actions & SA_NEW_TARGET; };

cls.canHaveName =
function() { return this.isAnyFn() || this.isClass(); };


