function VirtualResourceResolver(pathMan) {
  ResourceResolver.call(this, pathMan);
  this.fsMap = {};
}
