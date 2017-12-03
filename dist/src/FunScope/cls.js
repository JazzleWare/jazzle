  import ConcreteScope from '../ConcreteScope/cls.js';
  import {ST_FN} from '../other/scope-constants.js';
  import SortedObj from '../SortedObj/cls.js';

// TODO: inBody makes the logic brittle
export default function FunScope(parent, type) {
  ConcreteScope.call(this, parent, type|ST_FN);

  this.argList = [];
  this.argMap = {};
  this.argRefs = new SortedObj();
  this.prologue = [];
  this.scopeName = null;
  this.firstNonSimple = 
  this.firstDup =
  this.firstEvalOrArguments = null;
  this.inBody = false;
  this.bodyRefs = new SortedObj();

  this.closureLLINOSA = null;

  this.refs = this.argRefs;

  this.spArguments = null;
  this.spSuperCall = null;

}

 import {createObj} from '../other/util.js';
 export var cls = FunScope.prototype = createObj(ConcreteScope.prototype);
