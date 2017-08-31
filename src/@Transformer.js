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
}
