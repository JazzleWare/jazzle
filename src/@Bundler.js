function Bundler(pathMan) {
  this.pathMan = pathMan;
  this.curDir = "";
  this.curURI = "";
  this.resolver = null;
  this.freshSources = [];
}
