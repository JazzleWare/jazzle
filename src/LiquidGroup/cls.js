
export default function LiquidGroup(cat, scope) {
  this.category = cat;
  this.scope = scope;
  this.list = [];
  this.hasSeal = false;
  this.length = 0;
}

 export var cls = LiquidGroup.prototype;
