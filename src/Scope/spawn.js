  import Scope from './cls.js';
  import {ST_BLOCK, ST_FN, ST_CLS, ST_BARE} from '../other/scope-constants.js';
  import FunScope from '../FunScope/cls.js';
  import CatchScope from '../CatchScope/cls.js';
  import ParenScope from '../ParenScope/cls.js';
  import ClassScope from '../ClassScope/cls.js';
  import {cls} from './cls.js';

this.spawnBlock =
function() { return new Scope(this, ST_BLOCK); };

this.spawnFn =
function(st) { return new FunScope(this, st|ST_FN); }

this.spawnCatch =
function() { return new CatchScope(this); };

this.spawnParen =
function() { return new ParenScope(this); };

this.spawnCls =
function(st) { return new ClassScope(this, st|ST_CLS); };

this.spawnBare =
function() { return new Scope(this, ST_BARE); };

