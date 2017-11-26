  import {_m} from '../other/scope-util.js';
  import {ASSERT} from '../other/constants.js';
  import {cls} from './ctor.js';

cls.forwardsSource =
function(src) {
  return this.allSourcesForwarded.has(_m(src));
};

cls.fillForwardedSourceEntryWith =
function(fw, scope ) {
  var mname = _m(fw);
  ASSERT.call(this, this.allSourcesForwarded.has(mname) &&
    this.allSourcesForwarded.get(mname) === null, 'not null');
  ASSERT.call(this, this.allSourcesImported.has(mname),
    'must also be in importsList');

  this.allSourcesForwarded.set(mname, scope);
};


