  import {ref_arguments_m, ref_this_m, ref_scall_m} from '../other/ref-cat.js';
  import {ASSERT} from '../other/constants.js';
  import {cls} from './ctor.js';

cls.handOver_m =
function(mname, ref) {
  if (!this.isArrow()) {
    if (ref_arguments_m(mname))
      return this.spCreate_arguments(ref);

    if (this.isExpr() &&
      this.scopeName &&
      this.scopeName.hasName_m(mname))
      return this.scopeName.ref.absorbDirect(ref);
  }

  return this.parent.refIndirect_m(mname, ref);
};

cls.refInHead =
function(mname, ref) {
  if (!this.isArrow()) {
    if (ref_this_m(mname))
      return this.spCreate_this(ref);
    if (ref_scall_m(mname)) {
      ASSERT.call(this, this.isCtor(),
        'a scall ref must only come in a ctor scope');
      return this.spCreate_scall(ref);
    }
  }

  return this.focRefAny_m(mname).absorbDirect(ref);
};


