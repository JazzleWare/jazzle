  import {Emitters} from '../other/globals.js';
  import {cls} from './cls.js';

Emitters['TryStatement'] =
function(n, flags, isStmt) {
  this.w('try').os().emitStmt(n.block, true);
  var l = n.handler;
  if (l) {
    this.l().wm('catch','','(',l['#scope'].catchVar.synthName,')','');
    this.emitStmt(l.body, true);
  }

  l = n.finalizer;
  if (l) this.l().w('finally').os().emitStmt(l, true);
};

