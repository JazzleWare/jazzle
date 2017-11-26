  import {surrogate} from '../other/util.js';
  import {isIDHead} from '../other/ctype.js';
  import {cls} from './cls.js';

cls.readID_surrogate =
function(sc) {
  if (this.c+1 >= this.src.length)
    this.err('id.head.got.eof.surrogate');

  var surrogateTail = this.src.charCodeAt(this.c+1);
  var ccode = surrogate(sc, surrogateTail);
  if (!isIDHead(ccode))
    this.err('surrogate.not.id.head');

  this.c += 2;
  return this.readID_withHead(
    String.fromCharCode(sc) +
    String.fromCharCode(surrogateTail)
  );
};


