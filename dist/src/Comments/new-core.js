  import {cls} from './cls.js';

cls. push =
function(comment) {
  this.c.push(comment);
  if (!this.n) {
    this.firstLen += comment['#firstLen'];
    this.n = comment.type === 'Line' ||
      (comment.loc.start.line !== comment.loc.end.line);
  }
};

cls.mergeWith =
function(another) {
  if (!this.n)
    this.n = another.n;
  this.c = this.c.concat(another.c);
};


