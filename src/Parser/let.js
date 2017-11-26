  import {cls} from './ctor.js';

cls.handleLet =
function(letID) {
  if (this.v<=5 || !this.scope.insideStrict())
    return letID;
  this.err('let.strict');
};


