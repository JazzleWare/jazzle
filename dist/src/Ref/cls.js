
export default function Ref(scope) {
  this.i = 0;
  this.rsList = [];
  this.scope = scope || null;
  this.d = 0;
  this.targetDecl_nearest = null;
  this.hasTarget = false;
  this.parentRef = null;
  this.lhs = 0;
}

 export var cls = Ref.prototype;
