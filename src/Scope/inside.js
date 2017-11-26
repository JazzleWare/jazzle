  import {SF_INSIDEIF, SF_LOOP, SF_STRICT, SF_INSIDEPROLOGUE, SF_FORINIT} from '../other/scope-constants.js';
  import {cls} from './ctor.js';

cls.insideIf =
function() { return this.flags & SF_INSIDEIF; };

cls.insideLoop =
function() { return this.flags & SF_LOOP; };

cls.insideStrict = 
function() { return this.flags & SF_STRICT; };

cls.insidePrologue =
function() { return this.flags & SF_INSIDEPROLOGUE; };

cls.insideForInit =
function() { return this.flags & SF_FORINIT; };

cls.insideArgs =
function() { return this.isAnyFn() && !this.inBody; };


