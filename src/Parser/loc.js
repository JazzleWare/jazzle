  import {cls} from './ctor.js';

cls.loc = function() { return { line: this.li, column: this.col }; };
cls.loc0 = function() { return  { line: this.li0, column: this.col0 }; };


