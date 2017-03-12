function Ref(scope) {
  this.lors = [];
  this.indirect = new RefCount();
  this.scope = scope;
  this.direct = new RefCount();
  this.resolved = false;
}
