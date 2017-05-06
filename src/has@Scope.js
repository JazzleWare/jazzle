this.hasNewTarget =
function() { return this.allowed & SA_NEW_TARGET; };

this.hasHead =
function() {
  return this.isAnyFn() || this.isCatch();
};

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
