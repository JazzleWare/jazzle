  import {ASSERT} from '../other/constants.js';
  import {ref_this_m} from '../other/ref-cat.js';
  import {cls} from './cls.js';

cls.handOverRefList =
function(list) {
  var len = list.length(), i = 0;
  while (i<len) {
    var ref = list.at(i), mname = list.keys[i];
    if (ref && (ref.d || ref.i)) {
      ASSERT.call(this, !ref.hasTarget, 'touched ref can not be bound');
      this.handOver_m(mname, ref);
    }
    i++;
  }
};

cls.handOver_m =
function(mname, ref) {
  if (this.isBlock() || this.isBare())
    return this.parent.refDirect_m(mname, ref);

  if (this.isCatch()) {
    ASSERT.call(this, !this.inBody,
      'the body has to finish() before the handover begins');
    return this.parent.refDirect_m(mname, ref);
  }

  if (this.isClass()) {
    if (this.isExpr() &&
    this.scopeName && this.scopeName.hasName_m(mname))
      return this.scopeName.ref.absorbDirect(ref);

    return this.parent.refDirect_m(mname, ref);
  }

  ASSERT.call(this, this.isSourceLevel(),
    'a script scope was expected');

  ASSERT.call(this, this.parent.isGlobal() || this.parent.isBundle(),
    'script must have a parent scope with type global');

  if (ref_this_m(mname))
    return this.spCreate_this(ref);

  return this.parent.spReportGlobal_m(mname, ref);
};


