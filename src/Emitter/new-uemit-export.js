  import {Emitters} from '../other/globals.js';
  import {EC_START_STMT, ETK_ID, EC_NONE} from '../other/constants.js';

/*  TODO: Raw, for alternative bundlers */Emitters['#ExportNamedDeclaration'] = 
function(n, isVal) {
  if (n.declaration)
    return this.emitAny(n.declaration, EC_START_STMT, true);
};

/*  TODO: Raw, for alternative bundlers */Emitters['#ExportDefaultDeclaration'] =
function(n, isVal) {
  var b = n['#binding'];
  var elem = n.declaration;
  if (b !== null) { // if it has to have a binding, then it's either an expression or a nameless fn or cls
    this.wt('var',ETK_ID).bs();
    this.w(b.synthName).os().w('=').os();
    this.eN(elem, EC_NONE, false).w(';');
  }
  else 
    this.eA(elem, EC_START_STMT, true);
};

/*  TODO: Raw, for alternative bundlers */Emitters['#ImportDeclaration'] =
function(n, isVal) {};

