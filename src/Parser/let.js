  import {cls} from './cls.js';

this.handleLet =
function(letID) {
  if (this.v<=5 || !this.scope.insideStrict())
    return letID;
  this.err('let.strict');
};

