function Ref(scope) {
  this.lors = [];
  this.indirect = 0;
  this.scope = scope;
  this.direct = 0;
  this.resolved = false;
  this.synthTarget = null;
  this.idealSynthName = "";
  this.decl = null;
}
