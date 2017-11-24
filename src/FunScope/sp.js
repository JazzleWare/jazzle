  import {ASSERT} from '../other/constants.js';
  import Liquid from '../Liquid/cls.js';
  import {cls} from './cls.js';

this.spCreate_arguments =
function(ref) {
  ASSERT.call(this, ref,
    'ref must be provided to create an argumentsSP');

  var spArguments = new Liquid('<arguments>')
    .r(ref)
    .n('arguments');

  return this.spArguments = spArguments;
};

this.spCreate_scall =
function(ref) {
  ASSERT.call(this, this.isCtor(),
    'only ctor scopes are allowed to create scall');
  ASSERT.call(this, ref,
    'ref must be provided to create a scallSP');

  var lg = this.gocLG('scall');
  var spSuperCall = lg.newL();
  lg.seal();

  spSuperCall.ref = null;
  spSuperCall.r(ref);
  spSuperCall.name = 's';

  return this.spSuperCall = spSuperCall;
};

