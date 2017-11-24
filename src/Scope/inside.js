  import {SF_INSIDEIF, SF_LOOP, SF_STRICT, SF_INSIDEPROLOGUE, SF_FORINIT} from '../other/scope-constants.js';
  import {cls} from './cls.js';

this.insideIf =
function() { return this.flags & SF_INSIDEIF; };

this.insideLoop =
function() { return this.flags & SF_LOOP; };

this.insideStrict = 
function() { return this.flags & SF_STRICT; };

this.insidePrologue =
function() { return this.flags & SF_INSIDEPROLOGUE; };

this.insideForInit =
function() { return this.flags & SF_FORINIT; };

this.insideArgs =
function() { return this.isAnyFn() && !this.inBody; };

