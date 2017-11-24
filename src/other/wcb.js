

function wcb_ADD_b(rawStr, tt) {
  if (tt & ETK_ADD) this.bs();
  else NL(tt) || this.os();
}

function wcb_DIV_b(rawStr, tt) {
  if (tt & ETK_DIV) this.bs();
  else NL(tt) || this.os();
}

function wcb_MIN_b(rawStr, tt) {
  if (tt & ETK_MIN) this.bs();
  else NL(tt) || this.os();
}

function wcb_ADD_u(rawStr, tt) {
  if (tt & ETK_MIN) this.bs();
}

function wcb_intDotGuard(rawStr, tt) {
  rawStr === '.' && this.bs();
}

function wcb_MIN_u(rawStr, tt) {
  if (tt & ETK_MIN) this.bs();
}

function wcb_idNumGuard(rawStr, tt) {
  if (tt & (ETK_NUM|ETK_ID)) this.bs();
}

function wcb_afterStmt(rawStr, tt) {
  if (!NL(tt) || (tt & ETK_COMMENT))
    this.l();
}

function wcb_afterLineComment(rawStr, tt) {
  if (tt === ETK_NL)
    return;
  this.finishCurrentLine();
}

function wcb_afterNew(rawStr, tt) {
  wcb_idNumGuard.call(this, rawStr, tt);
}

function wcb_afterElse(rawStr, tt) {
  wcb_idNumGuard.call(this, rawStr, tt);
}

function wcb_startStmtList(rawStr, tt) {}

function wcb_afterCase(rawStr, tt) {
  wcb_idNumGuard.call(this, rawStr, tt);
}

function wcb_afterVar(rawStr, tt) {
  wcb_idNumGuard.call(this, rawStr, tt);
}

function wcb_afterVDT(rawStr, tt) {
  wcb_idNumGuard.call(this, rawStr, tt);
}

// NOTE: only register it after a return that has a non-null argument
function wcb_afterRet(rawStr, tt) {
  if (NL(tt)) {
    this.os();

    // use `w because `wtcl_raw alone is not handling spaces enqueued
    var wl = this.wrapLimit;
    this.wrapLimit = 0;
    this.w('(');
    this.wrapLimit = wl;

    this.guardArg.hasParen = true;
    return; 
  }
  var lineLen = this.curLine.length;
  if (tt & (ETK_NUM|ETK_ID)) {
    if (this.ol(1+rawStr.length) > 0) {
      this.writeToCurrentLine_raw('(');
      this.guardArg.hasParen = true;
      this.l();
    }
    else this.hs();
    return;
  }
  if (this.ol(rawStr.length) > 0) {
    if (this.ol(rawStr.length) > 0) {
      this.writeToCurrentLine_raw('(');
      this.guardArg.hasParen = true;
      this.l();
    }
    return;
  }
  this.os();
}

function wcb_wrap(rawStr, tt) {
  if (tt & ETK_NL) return;
  this.insertLineBreak(true);
}

function guard_simpleListener(rawStr, tt) {}

 export {wcb_ADD_b, wcb_DIV_b, wcb_MIN_b, wcb_ADD_u, wcb_intDotGuard, wcb_MIN_u, wcb_idNumGuard, wcb_afterStmt, wcb_afterLineComment, wcb_afterNew, wcb_afterElse, wcb_startStmtList, wcb_afterCase, wcb_afterVar, wcb_afterVDT, wcb_afterRet, wcb_wrap, guard_simpleListener};
