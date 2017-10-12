this.smSetName_str =
function(name) {
  var nc = -1;
  if (name.length) {
    var mname = _m(name), list = this.smNameList;
    nc = list.has(mname) ? list.get(mname) : list.set(mname, list.length());
  }
  return this.smSetName_i(nc);
};

this.smSetName_i =
function(i) {
  var list = this.smNameList;
  ASSERT.call(this, i >= 0 ? i <= list.length() : i === -1, 'namei' );
  var nc = this.namei_cur;

  this.namei_cur = i;
  return nc;
};

this.smSetSrc_str =
function(srcName) {
  var sc = -1;
  if (srcName.length) {
    var mname = _m(srcName), list = this.smSrcList;
    sc = list.has(mname) ? list.get(mname) : list.set(mname, list.length());
  }
  return this.smSetSrc_i(sc);
};

this.smSetSrc_i =
function(i) {
  var list = this.smSrcList;
  ASSERT.call(this, i >= 0 ? i <= list.length() : i === -1, 'srci' );
  var sc = this.srci_cur;

  this.srci_cur = i;
  return sc;
};

this.writeToSMout =
function(lm) { this.sm += lm; };

this.refreshTheCurrentLineLevelSourceMapWith =
function(srcLoc) {
  var l = 0, vlqTail = "";

  l = this.srci_cur;
  vlqTail += vlq(l - this.srci_latestRec);
  this.srci_latestRec = l;

  var ll = this.loc_latestRec; // latest loc
  vlqTail += vlq(srcLoc.line - ll.line) + vlq(srcLoc.column - ll.column);
  this.loc_latestRec = srcLoc;

  if ((l=this.namei_cur) >= 0) {
    vlqTail += vlq(l - this.namei_latestRec);
    this.namei_latestRec = l;
  }

  l = this.emcol_cur;
  if (this.mustHaveSMLinkpoint) {
    this.ln_emcol_cur = l;
    this.ln_vlq_tail = vlqTail;
    this.mustHaveSMLinkpoint = false;
    this.hasRecordedSMLinkpoint = true;
  }
  else {
    var lm = this.lm;
    if (lm.length) lm += ',';
    this.lm = lm + vlq(l - this.emcol_latestRec) + vlqTail;
  }

  this.emcol_latestRec = l;
  this.emline_latestRec = this.emline_cur;
};

this.setSourceLocTo =
function(srcLoc) {
  ASSERT.call(this, srcLoc, 'lw');
  this.pendingSrcLoc = srcLoc;
};
