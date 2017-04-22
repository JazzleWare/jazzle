this.hasNewTarget =
function() { return this.allowed & SA_NEW_TARGET; };

this.hasSignificantNames =
function() {
  if (this.isModule() ||
    this.isAnyFn() ||
    this.isScript())
    return true;

  if (this.isCatch())
    return this.argIsSimple && this.argIsSimple;

  return false;
};
