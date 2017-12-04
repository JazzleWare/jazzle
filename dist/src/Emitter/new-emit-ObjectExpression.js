  import {Emitters} from '../other/globals.js';
  import {CB} from '../other/util.js';
  import {EC_NEW_HEAD, EC_START_STMT, EC_NONE} from '../other/constants.js';

Emitters['ObjectExpression'] =
function(n, flags, isStmt) {
  var cb = CB(n); this.emc(cb, 'bef' );
  var list = n.properties, ci = n['#ci'], e = 0;
  var hasParen = false;
  if (ci >= 0) {
    hasParen = flags & EC_NEW_HEAD;
    hasParen && this.w('(');
    this.jz('obj').w('(');
  } else {
    hasParen = flags & EC_START_STMT;
    hasParen && this.w('(');
  }
  this.w('{');

  var cbe = null;

  var item = null, last = ci >= 0 ? ci : list.length;

  while (e < last) {
    item = list[e];
    if (e) this.w(',').os();
    cbe = CB(item); this.emc(cbe, 'bef' );
    this.writeMemName(item.key, false).w(':').os().eN(item.value, EC_NONE, false).emc(cbe, 'aft');
    e++;
  }

  this.emc(cb, 'inner');
  this.w('}');

  if (ci >= 0) {
    while (e < list.length) {
      this.w(',').os();
      item = list[e];
      cbe = CB(item); this.emc(cbe, 'bef' );
      if (item.computed)
        this.eN(item.key, EC_NONE, false);
      else
        this.writeMemName(item.key, true);
      this.w(',').os().eN(item.value, EC_NONE, false).emc(cbe, 'aft');
      e++;
    }
    this.emc(cb, 'inner');
    this.w(')');
  }

  hasParen && this.w(')');
  this.emc(cb, 'aft');

  isStmt && this.w(';');
  return true;
};

