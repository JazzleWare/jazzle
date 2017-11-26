  import {ASSERT} from '../other/constants.js';
  import {isTemp, CB} from '../other/util.js';
  import {cls} from './ctor.js';

cls.synth_Temp =
function(liq) {
  return {
    kind: 'temp',
    occupied: 0,
    liq: liq,
    type: '#Untransformed',
    '#c': {},
    loc: null
  };
};

cls.synth_TempSave =
function(t, expr) {
  ASSERT.call(this, isTemp(t), 't is not temp');
  if (t === expr)
    return null;
  return {
    kind: 'temp-save',
    right: expr,
    left: t,
    type: '#Untransformed',
    loc: expr.loc,
    '#c': {}
  };
};

cls.synth_AssigList =
function(list) {
  return {
    kind: 'assig-list',
    type: '#Untransformed' ,
    list: list,
    '#c': {},
    raw: null, // cls-exclusive
    loc: null
  };
};

cls.synth_UCond =
function(t,c,a,tr) {
  return {
    kind: 'ucond' ,
    test: t,
    consequent: c,
    type: tr ? 'ConditionalExpression' : '#Untransformed' ,
    alternate: a,
    '#c': {}
  };
};

cls.synth_ArrIterEnd =
function(iterVal) {
  return {
    kind: 'arr-iter-end' ,
    type: '#Untransformed' ,
    iter: iterVal,
    '#c': {}
  };
};

cls.synth_ArrIter =
function(iterVal) {
  this.accessJZ();
  return {
    kind: 'arr-iter',
    type: '#Untransformed' ,
    iter: iterVal,
    '#c': {}
  };
};

cls.synth_ArrIterGet =
function(iterVal, at) {
  return {
    kind: 'arr-iter-get',
    type: '#Untransformed',
    iter: iterVal,
    idx: at,
    '#c': {}
  };
};

cls.synth_SynthAssig =
function(left, right, isB) {
  return {
    binding: isB || false,
    right: right,
    left: left,
    type: '#SynthAssig',
    operator: '=',
    '#c': {}
  };
};

cls.synth_Call =
function(head, mem, list) {
  return {
    head: head,
    mem: mem,
    list: list,
    type: '#Untransformed' ,
    kind: 'call',
    '#c': {},
    '#argloc': null,
    loc: null
  };
};

cls.synth_U =
function(expr) {
  this.accessJZ();
  return {
    kind: 'u',
    type: '#Untransformed' ,
    value: expr,
    '#c': {}
  };
};

cls.synth_ArrIterGetRest =
function(iter, at) {
  return {
    kind: 'arr-iter-get-rest',
    type: '#Untransformed' ,
    iter: iter,
    idx: at,
    '#c': {}
  };
};

cls.synth_ObjIter =
function(iterVal) {
  return {
    kind: 'obj-iter',
    type: '#Untransformed' ,
    iter: iterVal,
    '#c': {}
  };
};

cls.synth_ObjIterEnd =
function(iterVal) {
  return {
    kind: 'obj-iter-end' ,
    type: '#Untransformed' ,
    iter: iterVal,
    '#c': {}
  };
};

cls.synth_ObjIterGet =
function(iter, at, isC) {
  return {
    kind: 'obj-iter-get',
    type: '#Untransformed' ,
    iter: iter,
    idx: at,
    computed: isC,
    '#c': {}
  };
};

cls.synth_ArgAt =
function(at) {
  return {
    type: '#Untransformed' ,
    idx: at,
    kind: 'arg-at',
    '#c': {}
  };
};

cls.synth_ArgRest =
function(ex, at) {
  return {
    idx: at,
    left: ex,
    kind: 'arg-rest',
    type: '#Untransformed',
    '#c': {}
  };
};

var SYNTH_VOID0 = {
  type: 'UnaryExpression',
  operator: 'void',
  argument: {
    type: 'Literal',
    value: 0,
    raw: '0',
    '#c': {}
  },
  '#y': 0,
  '#c': {}
};

cls.synth_node_BinaryExpression =
function(left,o,right,y) {
  return {
    left: left,
    operator: o,
    right: right,
    type: 'BinaryExpression',
    '#y': y || 0,
    '#c': {}
  };
};

cls.synth_Void0 = function() { return SYNTH_VOID0; };

cls.synth_SynthName =
function(liq) {
  return {
    type: '#Untransformed' ,
    kind: 'synth-name',
    liq: liq,
    '#c': {}
  };
};

cls.synth_node_MemberExpression =
function(n,v) {
  return {
    loc: null,
    computed: true,
    object: n,
    property: v,
    '#y': 0,
    '#c': {},
    type: 'MemberExpression'
  };
};

cls.synth_TransformedFn =
function(n, a) {
  return {
    type: '#Untransformed' ,
    kind: 'transformed-fn' ,
    fun: n,
    argsPrologue: a,
    target: null,
    '#c': {},
    scall: null, cls: null,
    loc: n.loc
  };
};

cls.synth_GlobalUpdate =
function(assig, isU) {
  return {
    isU: isU,
    kind: 'global-update',
    assig: assig,
    type: '#Untransformed',
    '#c': {}
  };
};

cls.synth_SynthLiteral =
function(l) {
  switch (l.type) {
  case 'Literal':
    return l;
  case 'Identifier':
    return {
      kind: 'synth-literal',
      raw: l.raw,
      loc: l.loc,
      type: '#Untransformed',
      value: l.name,
      '#c': CB(l)
    };
  }
  ASSERT.call(this, false, 'Unknown ['+l.type+']');
};

var SKIP = {type: '#Untransformed', kind: 'skip' };
cls.synth_Skip =
function() { return SKIP; };

cls.synth_ResolvedThis =
function(src, th, chk) {
  var simp = th.ref.scope === this.cur.getThisBase();
  return {
    kind: 'resolved-this',
    id: src,
    target: th,
    type: '#Untransformed' ,
    chk: chk,
    loc: src.loc,
    plain: simp
  };

};

cls.synth_BareThis =
function(th) {
  return {
    type: '#Untransformed' ,
    target: th,
    kind: 'bthis',
    plain: th.ref.scope === this.cur.getThisBase()
  };

};

cls.synth_MakeClass =
function(cls, herit, target) {
  return {
    cls: cls,
    heritage: herit,
    kind: 'cls',
    type: '#Untransformed' ,
    target: target
  };

};

cls.synth_RCheck =
function(v,t) {
  this.accessJZ();
  return {
    val: v,
    th: t,
    kind: 'rcheck',
    type: '#Untransformed'
  };

};

cls.synth_MemList =
function(mList, tProto) {
  return {
    m: mList,
    type: '#Untransformed' ,
    kind: 'memlist',
    p: tProto
  };

};

cls.synth_ClassSave =
function(target, ctor) {
  return {
    target: target,
    ctor: ctor,
    kind: 'cls-assig',
    type: '#Untransformed'
  };

};
cls.synth_Heritage =
function(h) {
  return {
    type: '#Untransformed' ,
    heritage: h,
    kind: 'heritage',
  };
};

cls.synth_TC =
function(right, rn) {
  this.accessJZ(); // jz  o
  return {
    value: right,
    kind: 'cvtz',
    rn: rn,
    type: '#Untransformed' ,
  };

};

cls.synth_TVal =
function(ex) {
  return {
    type: '#Untransformed' ,
    kind: 'tval',
    ex: ex
  };
};

cls.synth_NameList =
function(scope, vinit) {
  return {
    type: '#Untransformed' ,
    kind: 'llinosa-names',
    scope: scope ,
    withV: vinit
  };

};


