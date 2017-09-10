this.refreshSM =
function(loc) {
  if (loc === this.loc_latestRec)
    return;
  if (this.lineIsLn) {
    this.ln_emcol_cur = this.emcol_cur;
    this.ln_emcol_latestRec = this.emcol_latestRec;
    this.emcol_latestRec = this.emcol_cur;

    this.ln_srci_vlq = vlq(this.srci_cur-this.srci_latestRec);
    this.srci_latestRec = this.srci_cur;

    this.n_namei_vlq = vlq(this.namei_cur-this.namei_latestRec);
    this.namei_latestRec = this.namei_cur;

    this.ln_loc_vlq = 
      vlq(this.loc_latestRec.line-loc.line) +
      vlq(this.loc_latestRec.column-loc.column);
    this.loc_latestRec = loc;
    this.lineIsLn = false;
  } else {
    if (this.lm.length)
      this.lm += ',';

    this.lm += vlq(this.emcol_cur-this.emcol_latestRec);
    this.emcol_latestRec = this.emcol_cur;

    this.lm += vlq(this.srci_cur-this.srci_latestRec);
    this.srci_latestRec = this.srci_cur;

    this.lm += vlq(this.namei_cur-this.namei_latestRec);
    this.namei_latestRec = this.namei_cur;

    this.lm +=
      vlq(this.loc_latestRec.line-loc.line) +
      vlq(this.loc_latestRec.column-loc.column);
    this.loc_latestRec = loc;
  }
};
