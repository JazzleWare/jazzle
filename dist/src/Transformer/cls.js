  import {THS_NONE} from '../other/constants.js';
  import {renamer_incremental} from '../other/renamer.js';

export default function Transformer() {
  // TODO: `inGen or `flag for more contextual info (doesn't `cur have all that, anyway?)
  // CRUCIAL SCOPES:
  this.global = null;
  this.script = null;
  this.cur = null;

  // this could be per scope (i.e., a scope attibute),
  this.tempStack = [];

  this.reachedRef = {v: true};
  this.cvtz = {};
  this.thisState = THS_NONE;

  // name.activeIf[`cur.scopeID] = `cur if set
  this.activeIfScope = false;

  // for var n in.ls `activeIfNames: name.activeIf[n#getID] = n
  this.activeIfNames = null; // TODO: should rename to activeIfOther, because it can actually contain name-, scope-, or bare actices (actixes)

  this.curNS = 0; // sinde-effencts
  this.curAT = null; // activation target in use (mostly, it is just the same thing as this.cur)

  this.renamer = renamer_incremental;
}

 export var cls = Transformer.prototype;
