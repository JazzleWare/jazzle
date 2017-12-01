  import {ASSERT} from '../other/constants.js';
  import {cls} from './cls.js';

cls.trListChunk =
function(list, isVal, s, e) {
  while (s<=e) {
    if (list[s] !== null)
      list[s] = this.tr(list[s], isVal);
    s++ ; 
  }
};

cls.trSAT =
function(n, isVal) {
  switch (n.type) {
  case 'Identifier':
    return this.toResolvedName(n, 'sat');
  case 'MemberExpression':
    return this.trSAT_mem(n);
  }
  ASSERT.call(this, false, 'SAT !== <'+n.type+'>');
};

cls.accessTZ =
function(scope) {
  var lg = scope.scs.gocLG('tz');
  var l = lg.getL(0);
  if (!l) {
    l = lg.newL();
    l.name = 'tz';
    lg.seal();
  }
  return l.track(this.cur);
};

cls.accessJZ =
function() {
  var jzContainer = this.script;
  if (jzContainer.parent.isBundle())
    jzContainer = jzContainer.parent;

  var lg = this.script.gocLG('jz');
  var l = lg.getL(0);
  if (!l) {
    l = lg.newL();
    l.name = 'jz' ;
    lg.seal();
  }
  return l.track(this.cur);
};

cls.trList =
function(list, isVal) {
  return this.trListChunk(list, isVal, 0, list.length-1) ;
};


