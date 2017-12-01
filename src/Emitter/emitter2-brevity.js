  import {cls} from './cls.js';

cls.w =
function(str) {
  this.writeToCurrentLine_checked(str);
  return this;
};

cls.i =
function() { this.indentNextLine(); return this; };

cls.l =
function() { this.flushCurrentLine(); return this; };

cls.jz =
function(str) {
  // TODO: helpers should be tracked in the transformer
  this.jzHelpers.use('#'+str)
  var jzLiquid = this.jzLiquid;
  return this.w(jzLiquid.synthName).w('.').w(str);
};

cls.wm =
function() {
  var len = arguments.length, l = 0;
  while (l < len) {
    var str = arguments[l++];
    switch (str) {
    case ' ':
      this.enqueueBreakingSpace();
      break;
    case '':
      this.enqueueOmittableSpace();
      break;
    default:
      this.writeToCurrentLine_checked(str);

    }
  }
  return this;
};

cls.wt =
function(str, t) { this.tt(t); return this.w(str); };

cls.os =
function() { this.enqueueOmittableSpace(); return this; };

cls.bs =
function() { this.enqueueBreakingSpace(); return this; };

cls.u =
function() { this.unindentNextLine(); return this; };

cls.hs = 
function() { this.writeToCurrentLine_space(); return this; };

cls.gu =
function(guard) { this.insertGuard(guard); return this; };

cls.gar =
function(arg) { this.setGuardArg(arg); return this; };

cls.gmon =
function(listener) { this.monitorGuard(listener); return this; };

cls.grmif =
function(listener) { this.removeGuard_if(listener); return this; };

cls.trygu =
function(guard, listener) {
  if (this.insertGuard_try(guard)) {
    this.monitorGuard(listener);
    return true;
  }
  return false;
};

cls.sl =
function(srcLoc) {
  this.setSourceLocTo(srcLoc);
  return this;
};

cls.eA =
function(n, flags, isStmt) {
  this.emitAny(n, flags, isStmt);
  return this;
};

cls.eH =
function(n, flags, isStmt) {
  this.emitHead(n, flags, isStmt);
  return this;
};

cls.eN =
function(n, flags, isStmt) {
  this.emitNonSeq(n, flags, isStmt);
  return this;
};


