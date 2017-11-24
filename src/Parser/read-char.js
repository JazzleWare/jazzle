  import {cls} from './cls.js';

this.readSingleChar =
function() {
  var ch = this.src.charAt(this.c);
  this.lttype = ch.charCodeAt(0);
  this.ltraw = ch;
  this.setsimpoff(this.c+1);
};

