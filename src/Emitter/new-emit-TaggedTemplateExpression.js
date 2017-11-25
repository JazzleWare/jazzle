  import {Emitters} from '../other/globals.js';
  import {EC_NEW_HEAD, EC_NONE} from '../other/constants.js';

Emitters['TaggedTemplateExpression'] =
function(n, flags, isStmt) {
  var callee = n.tag;
  var hasParen = flags & EC_NEW_HEAD;
  if (hasParen) { this.w('('); flags = EC_NONE; }

  this.eH(callee, flags, false).w('(');
  this.jz('t').w('(');

  var list = n.quasi.quasis, l = 0;
  this.w('[');
  while (l < list.length) {
    l && this.wm(',','');
    this.writeString(list[l++].value.cooked, "'");
  }
  this.wm(']',',').os();

  l = 0;
  this.w('[');
  while (l < list.length) {
    l && this.wm(',','');
    var item = list[l++ ];
    if (item.value.raw === item.value.cooked)
      this.writeString('', '"');
    else
      this.writeString(item.value.raw, "\'");
  }
  this.w(']');

  this.w(')');

  list = n.quasi.expressions; l = 0;
  while (l < list.length)
    this.wm(',','').eN(list[l++], EC_NONE, false);

  this.w(')');
  hasParen && this.w(')');

  isStmt && this.w(';');
};

