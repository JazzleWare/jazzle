  import {CB, cmn_ac} from '../other/util.js';
  import {cls} from './ctor.js';

cls.cc =
function() { // cuts comments
  var commentBuf = this.commentBuf;
  this.commentBuf = null;
  return commentBuf;
};

cls.augmentCB =
function(n, i, c) {
  if (c === null)
    return;
  var cb = n['#c'];
  if (!cb[i])
    cb[i] = c;
  else
    cb[i].mergeWith(c);
}
cls.suc =
function(cb, i) {
  cb[i] = this.cc();
};

cls.spc =
function(n, i) {
  var cb = CB(n);
  cmn_ac(cb, i, this.cc());
};


