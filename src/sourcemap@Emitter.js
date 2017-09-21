this.smSetName =
function(name) {
  var nc = this.namei_cur;
  if (name.length) {
    var mname = _m(name);
    this.namei_cur =
      this.smNameList.has(mname) ?
        this.smNameList.get(mname) :
        this.smNameList.set(mname, this.smNameList.length());
  } else
    this.namei_cur = -1;

  return nc;
};

this.smSetSrc =
function(srcName) {
  var sc = this.srci_cur;
  var mname = _m(srcName);
  if (srcName.length) {
    this.srci_cur =
      this.smSrcList.has(mname) ?
        this.smSrcList.get(mname) :
        this.smSrcList.set(mname, this.smSrcList.length());
  } else
    this.srci_cur = -1;

  return sc;
};

this.smRefresh = this.sr =
function(loc) {
  if (loc === this.loc_latestRec)
    return;

  var l = 0;
  if (this.lineIsLn) {
//  console.log('<ln>', this.emcol_cur);
    this.ln_emcol_cur = this.emcol_cur;
    this.emcol_latestRec = this.emcol_cur;

    l = this.srci_latestRec;
    this.ln_srci_vlq = vlq(this.srci_cur-(l<0?0:l));
    this.srci_latestRec = this.srci_cur;

    if (this.namei_cur>=0) {
      l = this.namei_latestRec;
      this.ln_namei_vlq = vlq(this.namei_cur-(l<0?0:l));
      this.namei_latestRec = this.namei_cur;
    }
    else this.ln_namei_vlq = "";

    this.ln_loc_vlq = 
      vlq(loc.line-this.loc_latestRec.line) +
      vlq(loc.column-this.loc_latestRec.column);
    this.loc_latestRec = loc;
    this.lineIsLn = false;
    this.ln = true;
  } else {
    if (this.lm.length)
      this.lm += ',';

    this.lm += vlq(this.emcol_cur-this.emcol_latestRec);
//  console.log('src@('+loc.line+','+loc.column+') -> (col:'+this.emcol_cur+')@em');
    this.emcol_latestRec = this.emcol_cur;

    l = this.srci_latestRec;
    this.lm += vlq(this.srci_cur-(l<0?0:l));
    this.srci_latestRec = this.srci_cur;

    this.lm +=
      vlq(loc.line-this.loc_latestRec.line) +
      vlq(loc.column-this.loc_latestRec.column);
    this.loc_latestRec = loc;

    if (this.namei_cur>=0) {
      l = this.namei_latestRec; // needless
      this.lm += vlq(this.namei_cur-(l<0?0:l));
      this.namei_latestRec = this.namei_cur;
    }
  }
};

this.lw =
function(lw) {
// line below commented out to allow latest loc be used
//ASSERT_EQ.call(this,this.locw,null);
  ASSERT.call(this,lw,'lw');
  this.locw = lw;

  return this;
};
