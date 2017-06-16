function Bundle() {
  this.type = '#Bundle';
  this.subs = {};
  this.startSub = { ast: null, path: "" };
  this['#scope'] = null;
  this.sourceLoader = null;
}
