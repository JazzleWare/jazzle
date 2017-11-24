  import {TK_ID} from '../other/lexer-constants.js';
  import {arorev} from '../other/util.js';
  import {CH_LSQBRACKET, CH_LCURLY} from '../other/constants.js';
  import {cls} from './cls.js';

this.parsePat = 
function() {
  switch (this.lttype) {
  case TK_ID:
    if (this.vpatCheck &&  this.patErrCheck())
      return null;
    this.validate(this.ltval);
    var id = this.id();
    this.declare(id);
    if (this.scope.insideStrict() && arorev(id.name))
      this.err('bind.arguments.or.eval');

    return id;

  case CH_LSQBRACKET:
    if (this.vpatCheck && this.patErrCheck())
      return null;
    return this.parsePat_array();

  case CH_LCURLY:
    if (this.vpatCheck && this.patErrCheck())
      return null;
    return this.parsePat_obj();

  default:
     return null;
  }
};

