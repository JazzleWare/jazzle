function get(obj, name, value) {
  if (obj === null || obj === void 0)
    return value;

  if (!HAS.call(obj, name))
    return value;
  var t = typeof value;
  switch (t) {
    case NUMBER_TYPE:
    case BOOL_TYPE:
    case STRING_TYPE:
      if (typeof obj[name] !== t) 
        return value;
    default:
      return obj[name];
  }
}

this.setOptions = function(o) {
  var list = OPTIONS, e = 0;
  while (e < list.length) {
    var cur = list[e++];
    switch (cur) {
    case 'ecmaVersion':
      this.v = get(o, cur, 7);
      break;

    case 'sourceType':
      var sourceType = get(o, cur, 'script');
      switch (sourceType) {
      case 'script': this.isScript = true; break;
      case 'module': this.isScript = false; break;
      default:
        ASSERT.call(this, false,
          'Unknown option for sourceType: '+sourceType);
      }
      break;

    case 'onToken':
      this.onToken_ = get(o, cur, null);
      break;

    case 'program':
      this.program = get(o, cur, null);
      break;

    case 'onComment':
      this.onComment_ = get(o, cur, null);

    case 'allowReturnOutsideFunction':
      this.misc.allowReturnOutsideFunction =
        get(o, cur, false);
      break;

    case 'allowImportExportEverywhere':
      this.misc.allowImportExportEverywhere =
        get(o, cur, false);
      break;

    case 'sourceFile':
      this.misc.sourceFile = 
        get(o, cur, "");
      break;

    case 'directSourceFile':
      this.misc.directSourceFile =
        get(o, cur, "");
      break;

//  case 'preserveParens':
//    if (get(o, cur, false))
//      this.core = KEEPER_CORE;
//    break;

    case 'allowHashBang':
      this.misc.allowHashBang = get(o, cur, false);

    }
  }
};
