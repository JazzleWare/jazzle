this.cc =
function() { // cuts comments
  var commentBuf = this.commentBuf;
  this.commentBuf = null;
  return commentBuf;
};

this.augmentCB =
function(n, i, c) {
  if (c === null)
    return;
  var cb = n['#c'];
  if (!cb[i])
    cb[i] = c;
  else
    cb[i].mergeWith(c);
}
this.suc =
function(cb, i) {
  cb[i] = this.cc();
};

this.spc =
function(n, i) { n['#c'][i] = this.cc(); };

