import {ASSERT} from '../other/constants.js';
import {DT_NONE, DT_LET, DT_CONST} from '../other/scope-constants.js';
import {_m} from '../other/scope-util.js';
import {cls} from './cls.js';

cls.declare = function(id) {
  ASSERT.call(this, this.declMode !== DT_NONE, 'Unknown declMode');
  if (this.declMode & (DT_LET|DT_CONST)) {
    if (id.name === 'let')
      this.err('lexical.name.is.let');
  }

  var decl = this.scope.decl_m(_m(id.name), this.declMode);
  if (!decl.site) {
    ASSERT.call(this, decl.site === null, 'null');
    decl.s(id);
  }

  id['#ref'] = decl.ref;

  // lexport {e as E}; lexport var e = 12
  var entry = null;

  if (decl.isExported()) {
    entry = this.scope.registerExportedEntry_oi(id.name, id, id.name);
    this.scope.regulateOwnExport(entry);
    this.scope.refreshUnresolvedExportsWith(decl);
  }
  else {
    var sourceScope = decl.ref.scope;
    sourceScope.isSourceLevel() && sourceScope.refreshUnresolvedExportsWith(decl);
  }
};

cls.enterScope = function(scope) {
  this.scope = scope;
};

cls.exitScope = function() {
  var scope = this.scope;
  scope.finish();
  this.scope = this.scope.parent;
  return scope;
};

cls.allow = function(allowedActions) {
  this.scope.actions |= allowedActions;
};


