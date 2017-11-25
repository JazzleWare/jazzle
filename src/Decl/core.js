  import {ASSERT_EQ, HAS, ASSERT} from '../other/constants.js';
  import {DT_NONE} from '../other/scope-constants.js';
  import {cls} from './cls.js';

cls.s =
function(s) {
  ASSERT_EQ.call(this, this.site, null);
  this.site = s;
  return this;
};

cls.r =
function(r) {
  ASSERT_EQ.call(this, this.ref, null);
  ASSERT_EQ.call(this, r.targetDecl_nearest, null);
  ASSERT_EQ.call(this, r.hasTarget, false);
  this.ref = r;
  r.targetDecl_nearest = this;
  r.hasTarget = true;
  return this;
};

cls.n =
function(n) {
  ASSERT_EQ.call(this, this.name, "");
  this.name = n;
  return this;
};

cls.t =
function(t) {
  ASSERT_EQ.call(this, this.type, DT_NONE);
  this.type = t;
  return this;
};

cls.activateTZ =
function() {
  if (this.hasTZCheck)
    return false;
  this.hasTZCheck = true;
  this.ref.scope.activateTZ();
  return true;
};

cls.isReached =
function() {
  return this.reached && this.reached.v;
};

cls.refreshRSListWithList =
function(list) {
  var l = 0;
  while (l < list.length)
    this.refreshRSListWith(list[l++]);
};

cls.refreshRSListWith =
function(scope) {
  if (this.rsMap === null)
    this.rsMap = {};
  var id = scope.scopeID;
  if (HAS.call(this.rsMap, id)) {
    ASSERT.call(this, this.rsMap[id] === scope, 'scope' );
    return false;
  }
  this.rsMap[id] = scope ;
  this.ref.rsList.push(scope);
  return true;
};

cls.getDecl_real =
function() {
  if (this.realTarget !== null)
    return this.realTarget;

  var t = this;
  while (t.ref.parentRef !== null)
    t = t.ref.parentRef.getDecl_nearest();

  this.realTarget = t;
  return t;
};


