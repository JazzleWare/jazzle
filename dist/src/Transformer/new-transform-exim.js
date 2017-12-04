import {Transformers} from '../other/globals.js';

Transformers['ExportNamedDeclaration'] = 
function(n, isVal) {
  // TODO: transform local names to rns when bundling is not active

  if (n.declaration !== null)
    n.declaration = this.tr(n.declaration, false);

  n.type = '#' + n.type ;
  return n;
};

Transformers['ExportDefaultDeclaration'] =
function(n, isVal) {
  var elem = n.declaration;
  var isVal = true, renamedHoisted = false;
  switch (elem.type) {
  case 'FunctionDeclaration':
    if (elem.id === null) {
      elem.type = 'FunctionExpression';
      renamedHoisted = true;
    }
    else
      isVal = false;
    break;
  case 'ClassDeclaration':
    if (elem.id === null)
      elem.type = 'ClassExpression';
    else
      isVal = false;
    break;
  }

  n.declaration = this.tr(elem, isVal);
  n.type = '#' + n.type ;

  if (renamedHoisted)
    this.cur.renamedHoisted.push(n);

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

