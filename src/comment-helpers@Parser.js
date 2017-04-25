this.suck =
function() {
  var commentBuf = this.commentBuf;
  this.commentBuf = null;
  return commentBuf;
};

this.spew =
function() {
  this.lpn.trailingComments = this.commentBuf;
  this.commentBuf = null;
  this.lpn = null;
};
