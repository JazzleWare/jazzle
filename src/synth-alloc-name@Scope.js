Scope.newSynthName = function(baseName, declScope, locrs, originalDecl) {
  locrs = locrs || null;
  originalDecl = originalDecl || null;
  var i = 0, name = baseName;

  RENAME:
  for (;; ++i, name = baseName + "" + i) {
    var mname = _m(name);
    if (declScope) {
      if (!declScope.acceptsName_m(mname, ACC_DECL, originalDecl))
        continue RENAME;
    }

    if (locrs) {
      var l = 0;
      while (l < locrs.length)
        if (!locrs[l++].acceptsName_m(mname, ACC_REF, originalDecl))
          continue RENAME;
    }

    break;
  }

  return name;
};
