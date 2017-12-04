  import BundleScope from '../BundleScope/cls.js';

export default function Bundler(pathMan) {
  this.type = '#Bundler';
  this.pathMan = pathMan;
  this.curDir = "";
  this.curURI = "";
  this.resolver = null;
  this.freshSources = [];
  this['#scope'] = null;
  this.rootNode = null;
  this.bundleScope = new BundleScope();
}

 export var cls = Bundler.prototype;
