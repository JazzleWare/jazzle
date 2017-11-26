  import {SA_NONE, SA_RETURN, SA_CALLSUPER, SA_NEW_TARGET, SA_MEMSUPER, SA_YIELD, SA_AWAIT, SF_NONE, SF_STRICT, SF_LOOP, SF_UNIQUE} from '../other/scope-constants.js';
  import {ASSERT, ASSERT_EQ} from '../other/constants.js';
  import ScopeName from '../ScopeName/cls.js';
  import Ref from '../Ref/cls.js';
  import {_m} from '../other/scope-util.js';
  import Liquid from '../Liquid/cls.js';
  import {cls} from './ctor.js';

cls.determineActions =
function() {
  if (this.isParen())
    return this.parent.actions;

  var a = SA_NONE;
  if (this.isSoft())
    a |= this.parent.actions;
  else if (this.isAnyFn()) {
    a |= SA_RETURN;
    if (this.isArrow())
      a |= (this.parent.actions & (SA_CALLSUPER|SA_NEW_TARGET|SA_MEMSUPER));
    else {
      a |= SA_NEW_TARGET;
      if (this.isCtor()) {
        ASSERT.call(this, this.parent.isClass(),
          'a ctor can only descend from a class');
        if (this.parent.hasHeritage())
          a |= SA_CALLSUPER;
      }
      if (this.isGen())
        a |= SA_YIELD;
      if (this.isMem())
        a |= SA_MEMSUPER;
    }
    if (this.isAsync())
      a |= SA_AWAIT;
  }

  return a;
};

cls.activateTZ =
function() {
  var scope = this.scs;
  if (scope.hasTZCheckPoint)
    return false;
  return this.hasTZCheckPoint = true;
};

cls.setName =
function(name, source) {
  ASSERT.call(this, this.canHaveName(),
    'only cls/fn can have a name');
  ASSERT_EQ.call(this, this.scopeName, null);
  this.scopeName = 
    new ScopeName(name, source).r(new Ref(this));

  return this.scopeName;
};

cls.getThisBase =
function() { return this.scs; };

cls.pushFun =
function(name, transformedFn) {
  ASSERT.call(
    this,
    transformedFn.type === '#Untransformed' && transformedFn.kind === 'transformed-fn', 'transformed-fn');
  var mname = _m(name);
  var list = this.funLists.has(mname) ?
    this.funLists.get(mname) :
    this.funLists.set(mname, []);
  list.push(transformedFn);
};

cls.owns =
function(nd) {
  return nd.ref.scope === this /* && (!nd.isImported()) */;
};

cls.determineFlags =
function() {
  if (this.isParen())
    return this.parent.flags;

  var fl = SF_NONE;
  if (!this.parent) {
    ASSERT.call(this, this.isGlobal() || this.isBundle(),
      'global scope is the only scope that ' +
      'can have a null parent');
    return fl;
  }

  if (this.isClass() || this.isModule() ||
    this.parent.insideStrict())
    fl |= SF_STRICT;

  if (!this.isAnyFn() && this.parent.insideLoop())
    fl |= SF_LOOP;

  if (this.isAnyFn() && !this.isSimpleFn())
    fl |= SF_UNIQUE;

  return fl;
};

cls.spCreate_this =
function(ref) {
  ASSERT.call(this, this.canMakeThis(), 'this');

  if (!ref)
    ref = new Ref(this);

  ASSERT.call(this, this.spThis === null,
    'this scope has already got a this liquid');

  // TODO: tz check is also needed for 'this' (in some cases)
  var spThis = new Liquid('<this>')
    .r(ref)
    .n('this_');

  return this.spThis = spThis;
};

cls.setSynthBase =
function(base) {
  ASSERT.call(this, this.synthBase === this.scs, 'synth-base is not intact');
  ASSERT.call(this, base.isConcrete(), 'base' );
  this.synthBase = base;
};

cls.getSourceLevelScope =
function() {
  var l = this.sourceScope ; // up
  if (l === null) {
    var u = this.parent;
    while (u) {
      if (u.isSourceLevel()) {
        l = this.sourceScope = u;
        break;
      }
    }
    ASSERT.call(this, u, 'source-scope ' );
  }
  return l;
};


