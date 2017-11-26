  import Decl from '../Decl/cls.js';

export default function ScopeName(name, src) {
  Decl.call(this);

  this.name = name;
  this.source = src;
}

 import {createObj} from '../other/util.js';
 export var cls = ScopeName.prototype = createObj(Decl.prototype);
