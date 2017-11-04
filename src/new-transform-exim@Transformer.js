Transformers['ExportNamedDeclaration'] = 
function(n, isVal) {
  // TODO: transform local names to rns when bundling is not active

  if (n.declatarion !== null)
    n.declaration = this.tr(n.declaration, false);

  n.type = '#' + n.type ;
  return n;
};

Transformers['ExportDefaultDeclaration'] =
function(n, isVal) {
  var elem = n.declaration;
  var isStmt = false;
  switch (elem.type) {
  case 'FunctionDeclaration':
  case 'ClassDeclaration':
    isStmt = true;
  }

  n. declaration = this.tr(elem, isStmt);
  n.type = '#' + n.type ;

  return n;
};

Transformers['ExportAllDeclaration'] =
function(n, isVal) {
  n.type = '#' + n.type ;
  return n;
};

Transformers['ImportDeclaration'] =
function(n, isVal) {
  n.type = '#' + n.type ;
  return n; 
};
