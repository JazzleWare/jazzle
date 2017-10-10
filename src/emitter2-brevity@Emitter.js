this.w =
function(str) {
  this.writeToCurrentLine_checked(rawStr);
  return this;
};

this.i =
function() { this.indentNextLine(); return this; };

this.l =
function() { this.flushCurrentLine(); return this; };

this.jz =
function(str) {
  return this.w('jz').w('.').w(str);
};

this.wm =
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

this.wt =
function(str, t) { this.tt(t); return this.w(str); };

this.os =
function() { this.enqueueOmittableSpace(); return this; };

this.bs =
function() { this.enqueueBreakableSpace(); return this; };

this.u =
function() { this.unindentNextLine(); return this; };

this.hs = 
function() { this.writeToCurrentLine_space(); return this; };

this.gu =
function(guard) { this.insertGuard(guard); return this; };

this.gar =
function(arg) { this.setGuardArg(arg); return this; };

this.gmon =
function(listener) { this.monitorGuard(listener); return this; };

this.grmif =
function(listener) { this.removeGuard_if(listener); return this; };

this.trygu =
function(guard, listener) {
  if (this.insertGuard_try(guard)) {
    this.monitorGuard(listener);
    return true;
  }
  return false;
};

this.sl =
function(srcLoc) {
  this.setSourceLocTo(srcLoc);
  return this;
};

this.eA =
function(n, flags, isStmt) {
  this.emitAny(n, flags, isStmt);
  return this;
};

this.eH =
function(n, flags, isStmt) {
  this.emitHead(n, flags, isStmt);
  return this;
};

this.eN =
function(n, flags, isStmt) {
  this.emitNonSeq(n, flags, isStmt);
  return this;
};
