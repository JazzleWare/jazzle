
this.hasNewTarget =
function() { return this.allowed & SA_NEW_TARGET; };

this.hasHead =
function() {
  return this.isAnyFn() || this.isCatch();
};

this.hasSignificantNames =
function() {
  if (this.isModule() ||
    this.isScript())
    return true;

  if (this.isAnyFn())
    return !this.inBody;
  if (this.isCatch())
    return !this.inBody && this.argIsSimple && this.argIsSimple;

  return false;
};

