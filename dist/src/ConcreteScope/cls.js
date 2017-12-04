  import Scope from '../Scope/cls.js';
  import SortedObj from '../SortedObj/cls.js';

export default function ConcreteScope(parent, type) {
  Scope.call(this, parent, type);

  this.liquidDefs = new SortedObj();
  this.synthNamesUntilNow = null;

  this.spThis = null;
  this.isBooted = false;

  this.renamer = null;
}

 import {createObj} from '../other/util.js';
 export var cls = ConcreteScope.prototype = createObj(Scope.prototype);
