/*  TODO: raw, for alternative bundlers */Emitters['#ExportDefaultDeclaration'] =
function(n, isVal) {
  var b = n['#binding'];
  var elem = n.declaration;
  this.wt('var',ETK_ID).bs();
  this.w(b.synthName).os().w('=').os();
  this.eN(elem, EC_NONE, true);
};

/*  TODO: raw, for alternative bundlers */Emitters['#ImportDeclaration'] =
function(n, isVal) {};
