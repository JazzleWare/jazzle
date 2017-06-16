function Bundler() {
  this.type = '#Bundler';
  this.loaded = {};
  this.main = null;
  this.path = "";
  this.resolver = null;
  this['#scope'] = null;
  this['#y'] = 0;
}
