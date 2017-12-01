  import {ASSERT} from '../other/constants.js';
  import Decl from '../Decl/cls.js';
  import {DT_GLOBAL} from '../other/scope-constants.js';
  import {_u} from '../other/scope-util.js';
  import {cls} from './cls.js';

cls.spReportGlobal_m =
function(mname, ref) {
  var globalBinding = this.findGlobal_m(mname);

  if (globalBinding) {
    ASSERT.call(this, this.isBundle(), 'not');
    globalBinding.refreshRSListWithList(ref.rsList);
    ref.parentRef = globalBinding.ref;
  }
  else {
    globalBinding = new Decl().t(DT_GLOBAL).r(ref).n(_u(mname));
    ref.rsList.push(this);
    this.insertGlobal_m(mname, globalBinding);
  }

  ref.scope = this;
  return globalBinding;
};

cls.insertGlobal_m =
function(mname, global) {
  ASSERT.call(this, this.isGlobal() || this.isBundle(), 'global or bundler' );
  ASSERT.call(this, global.isGlobal(), 'global');
  ASSERT.call(this, this.defs.has(mname) === false, 'existing');

  return this.defs.set(mname, global);
};

cls.findGlobal_m =
function(mname) {
  var global = null;
  if (this.defs.has(mname)) {
    global = this.defs.get(mname);
    ASSERT.call(this, global.isGlobal(), 'not');
  }
  return global;
};


