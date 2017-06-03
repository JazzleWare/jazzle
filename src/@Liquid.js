function Liquid(category) {
  Decl.call(this);
  this.type |= DT_LIQUID;
  this.rsMap = {};
  this.category = category;
}
