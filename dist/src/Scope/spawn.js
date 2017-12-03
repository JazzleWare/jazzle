  import Scope from './cls.js';
  import {ST_BLOCK, ST_FN, ST_CLS, ST_BARE} from '../other/scope-constants.js';
  import FunScope from '../FunScope/cls.js';
  import CatchScope from '../CatchScope/cls.js';
  import ParenScope from '../ParenScope/cls.js';
  import ClassScope from '../ClassScope/cls.js';
  import {cls} from './cls.js';

cls.spawnBlock =
function() { return new Scope(this, ST_BLOCK); };

cls.spawnFn =
function(st) { return new FunScope(this, st|ST_FN); }

cls.spawnCatch =
function() { return new CatchScope(this); };

cls.spawnParen =
function() { return new ParenScope(this); };

cls.spawnCls =
function(st) { return new ClassScope(this, st|ST_CLS); };

cls.spawnBare =
function() { return new Scope(this, ST_BARE); };


