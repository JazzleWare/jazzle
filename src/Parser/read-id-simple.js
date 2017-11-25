  import {cls} from './cls.js';

cls.readID_simple =
function() {
  return this.readID_withHead(
    this.src.charAt(this.c++)
  );
};


