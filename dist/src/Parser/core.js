  import {DT_NONE, DT_FN, DT_CLS, DT_INFERRED} from '../other/scope-constants.js';
  import {getIDName} from '../other/util.js';
  import {cls} from './cls.js';

cls.inferName =
function(left, right, isComputed) {
  if (isComputed && left.type === 'Identifier')
    return null;

  var t = DT_NONE, c = false;
  switch (right.type) {
  case 'FunctionExpression':
  case 'FunctionDeclaration': // TODO: must be a default ex
    if (right.id) return null;
    t = DT_FN;
    break;
  case 'ClassExpression':
    if (right.id)
      return null;
    t = DT_CLS;
    c = true;
    break; 
  case 'ArrowFunctionExpression':
    t = DT_FN;
    break;

  default: return null
  }

  var scope = right['#scope'];
  t |= DT_INFERRED;
  var name = "";

  name = getIDName(left);
  if (name === "")
    return null;

  var scopeName = null;
  if (name !== 'default') {
    scopeName = scope.setName(name, null).t(t);
    scopeName.site = left;
    scopeName.synthName = scopeName.name;
  }

  if (c && right['#ct'] !== null) this.inferName(left, right['#ct'].value, false);

  return scopeName;
};

cls.cutEx =
function() {
  var ex = this.ex;
  this.ex = DT_NONE;
  return ex;
};


