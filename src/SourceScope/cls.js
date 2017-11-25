  import ConcreteScope from '../ConcreteScope/cls.js';
  import SortedObj from '../SortedObj/cls.js';

function SourceScope(parent, st) {
  ConcreteScope.call(this, parent, st);
  this.spThis = null;

  this.allSourcesImported = this.asi = new SortedObj();
  this.allNamesExported = this.ane = new SortedObj();
  this.allSourcesForwarded = this.asf = new SortedObj();

  this.latestUnresolvedExportTarget = null;
  this.allUnresolvedExports = this.aue = new SortedObj();
}

 export default SourceScope;

 import {createObj} from '../other/util.js';
 export var cls = SourceScope.prototype = createObj(ConcreteScope.prototype);
