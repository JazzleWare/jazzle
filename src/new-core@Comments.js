this. push =
function(comment) {
  this.c.push(comment);
  if (!this.n)
    this.n = comment.type === 'Line' ||
      (comment.loc.start.line !== comment.loc.end.line);
};
