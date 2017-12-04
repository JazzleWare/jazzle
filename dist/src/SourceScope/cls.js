import ConcreteScope from '../ConcreteScope/cls.js';
import SortedObj from '../SortedObj/cls.js';

export default function SourceScope(parent, st) {
  ConcreteScope.call(this, parent, st);
  this.spThis = null;

  this.allSourcesImported = this.asi = new SortedObj();
  this.allNamesExported = this.ane = new SortedObj();
  this.allSourcesForwarded = this.asf = new SortedObj();

  this.latestUnresolvedExportTarget = null;
  this.allUnresolvedExports = this.aue = new SortedObj();

  this.renamedHoisted = [];
  this.allImportedScopes = new SortedObj();

  this['#uri'] = "";
  this['#loader'] = "";
}

import {createObj} from '../other/util.js';
export var cls = SourceScope.prototype = createObj(ConcreteScope.prototype);
