this.cc =
function() { // cuts comments
  var commentBuf = this.commentBuf;
  this.commentBuf = null;
  return commentBuf;
};

this.suc =
function(cb, i) {
  cb[i] = this.cc();
};

this.spc =
function(n, i) { n['#c'][i] = this.cc(); };
