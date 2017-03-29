this.newSynthName = function(baseName, locrs) {
  locrs = locrs || null;
  var i = 0, name = baseName;

  RENAME:
  for (;; ++i, name = baseName + "" + i) {
    var mname = _m(name);
    if (!this.acceptsName_m(mname, ACC_DECL))
      continue RENAME;

    if (locrs) {
      var l = 0;
      while (l < locrs.length)
        if (!locrs[l++].acceptsName_m(mname, ACC_REF))
          continue RENAME;
    }

    break;
  }

  return name;
};
