function Liquid(scope, name) {
  this.name = name;
  this.scope = scope;
  this.crsList = [];
  this.crsMap = {};
  this.idealName = "";
  this.synthName = "";
  this.associatedDecl = null;
}
