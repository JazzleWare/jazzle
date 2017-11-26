  import {HAS} from '../other/constants.js';
  import {Transformers} from '../other/globals.js';
  import {cls} from './cls.js';

cls.setCVTZ =
function(cvtz) {
  var l = this.cvtz;
  this.cvtz = cvtz;
  return l;
};

cls.setRR =
function(reachedRef) {
  var rr = this.reachedRef;
  this.reachedRef = reachedRef;
  return rr;
};

cls.setScope =
function(scope) {
  var cur = this.cur;
  this.cur = scope ;
  return cur;
};

cls.setTS =
function(ts) {
  var ts0 = this.tempStack;
  this.tempStack = ts;
  return ts0;
};

cls.setThis =
function(thisState) {
  var th = this.thisState;
  this.thisState = thisState;
  return th;
};

cls.tr =
function(n, isVal) {
  var ntype = n.type;
  switch (ntype) {
  case 'EmptyStatement':
  case '#Untransformed':
  case 'Literal':
    return n;
  }

  var transformer = null;
  if (HAS.call(Transformers, ntype))
    transformer = Transformers[ntype];

  if (transformer === null)
    throw new Error('could not find <'+ntype+'>-transformer');

  return transformer.call(this, n, isVal);
};

cls.rename =
function(base, i) { return this.renamer(base, i); };


