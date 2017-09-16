function Transformer() {
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
  this.activeIfNames = null;

  this.renamer = renamer_incremental;
}
