function Transformer() {
  // TODO: `inGen or `flag for more contextual info (doesn't `cur have all that, anyway?)
  // CRUCIAL SCOPES:
  this.global = null;
  this.script = null;
  this.cur = null;

  // the could be per scope (i.e., a scope attibute),
  this.bundler = null;
  this.tempStack = [];
  this.reachedRef = {v: true};
  this.cvtz = {};
}
