
function Bundler(pathMan) {
  this.type = '#Bundler';
  this.pathMan = pathMan;
  this.curDir = "";
  this.curURI = "";
  this.resolver = null;
  this.freshSources = [];
  this['#scope'] = null;
  this.rootNode = null;
  this.bundleScope = null;
}

 export default Bundler;
 export var cls = Bundler.prototype;
