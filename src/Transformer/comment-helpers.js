  import {ASSERT, HAS} from '../other/constants.js';
  import {cls} from './ctor.js';

cls.ac =
function(to, name, from) {
  if (from === null)
    return;
  ASSERT.call(this, from, 'from');
  if (!HAS.call(to, name))
    to[name] = from;
  else
    to[name].mergeWith(from );
};

cls.gec0 =
function(cb, n) {
  return HAS.call(cb, n) ? cb[n] : null;
};


