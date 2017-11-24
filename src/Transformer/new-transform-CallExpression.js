  import {Transformers} from '../other/globals.js';
  import {RS_SCALL, RS_THIS} from '../other/scope-constants.js';
  import {THS_IS_REACHED, THS_NEEDS_CHK} from '../other/constants.js';
  import {findElem} from '../other/util.js';
  import {cls} from './cls.js';

Transformers['CallExpression'] =
function(n, isVal) {
  var ti = false, l = n.callee;
  if (l.type === 'Super') {
    l['#liq'] = this.cur.findRefU_m(RS_SCALL).getDecl_nearest();
    var th = this.cur.findRefU_m(RS_THIS).getDecl_nearest();
    l['#this'] = this.synth_BareThis(th);
    if (!(this.thisState & THS_IS_REACHED)) {
      ti = true;
      var lg = th.ref.scope.gocLG('ti'), li = lg.getL(0);
      if (li === null) { li = lg.newL(); lg.seal(); li.name = 'ti'; }
      l['#ti'] = li;
      li.track(this.cur); li.ref.d--;
    }
  }

  var si = findElem(n.arguments, 'SpreadElement');
  if (si === -1) {
    if (l.type !== 'Super')
      n.callee = this.tr(n.callee, true );
    this.trList(n.arguments, true );
    if (ti) { this.thisState |= THS_IS_REACHED; this.thisState &= ~THS_NEEDS_CHK; }
    return n;
  }

  this.accessJZ();

  var head = n.callee, mem = null;
  if ( head.type === 'MemberExpression') {
    head.object = this.tr(head.object, true);
    var loc = head.object.loc;
    var t = this.allocTemp();
    var h0 = head;
    head = this.synth_TempSave(t, head.object);
    h0.object = t;
    t.loc = loc;
    this.releaseTemp(t);
    if (h0.computed)
      h0.property = this.tr(h0.property, true );
    mem = h0;
  }
  else if (l.type === 'Super') {
    mem = l;
    head = this.synth_BareThis(this.cur.findRefU_m(RS_THIS).getDecl_nearest());
  }
  else
    head = this.tr(head, true );

  this.trList(n.arguments, true );

  if (ti) { this.thisState |= THS_IS_REACHED; this.thisState &= ~THS_NEEDS_CHK; }

  var synthcall = this.synth_Call(head, mem, n.arguments);
  synthcall.loc = n.loc;
  synthcall['#argloc'] = n['#argloc'];

  return synthcall;
};

