this.accessJZ = function() {
  this.currentScope.accessLiquid(this.scriptScope, '<jz>');
};

this.accessTZ = function(scope) {
  var tz = this.currentScope.accessLiquid(scope, '<tz>');
  if (tz.idealName === "")
    tz.idealName = 'tz';
};
