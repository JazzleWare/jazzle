  import {Transformers} from '../other/globals.js';
  import {cls} from './cls.js';

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
  var isVal = true;
  switch (elem.type) {
  case 'FunctionDeclaration':
    if (elem.id === null)
      elem.type = 'FunctionExpression';
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

  n. declaration = this.tr(elem, isVal);
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

