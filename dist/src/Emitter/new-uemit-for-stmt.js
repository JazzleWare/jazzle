  import {Emitters} from '../other/globals.js';
  import {EC_NONE, EC_IN} from '../other/constants.js';

  Emitters['#ForStatement'] =
  function(n, flags, isStmt) {
    this.w('for').os().w('(');
    n.init && this.emitAny(n.init, EC_IN, false);
    this.w(';');
    n.test && this.os().emitAny(n.test, EC_NONE, false);
    this.w(';');
    n.update && this.os().emitAny(n.update, EC_NONE, false);
    this.w(')').emitAttached(n.body);
  };
