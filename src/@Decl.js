function Decl() {
  this.ref = null;
  this.idx = -1;
  this.name = "";
  this.site = null;
  this.msynth = -1;
  this.hasTZCheck = false;
  this.reached = null;
  this.type = DT_NONE;
  this.synthName = "";

  this.ai = activeID_new();  
  this.activeIf = null;

  this.activeness = ANESS_UNKNOWN;
}
