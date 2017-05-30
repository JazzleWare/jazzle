Emitters['ObjectExpression'] =
function(n, flags, isStmt) {
  var c0 = this.sc(""), list = n.properties, e = 0;
  this.w('{');

  var item = null;
  while (e < list.length) {
    item = list[e];
    if (item.computed)
      break;
    if (e) this.w(',').s();
    this.writeMemName(item.key, false).w(':').s().eN(item.value, EC_NONE, false);
    e++;
  }

  this.w('}');

  var hasParen = false;
  if (e >= list.length) {
    c0 = this.sc(c0);
    hasParen = flags & EC_START_STMT;
    hasParen && this.w('(');
    this.ac(c0);
    hasParen && this.w(')');
  } else {
    c0 = this.sc(c0);
    hasParen = flags & EC_NEW_HEAD;
    hasParen && this.w('(');
    this.jz('obj').w('(').ac(c0);
    while (e < list.length) {
      this.w(',').s();
      item = list[e];
      if (item.computed)
        this.eN(item.key, EC_NONE, false);
      else
        this.w("'")
            .writeMemName(item.key, true).w("'");
      this.w(',').s().eN(item.value, EC_NONE, false);
      e++;
    }
    this.w(')');
    hasParen && this.w(')');
  }

  isStmt && this.w(';');
  return true;
};
