
function wcb_ADD_b(rawStr, tt) {
  if (tt & ETK_ADD) this.bs();
  else this.os();
}

function wcb_DIV_b(rawStr, tt) {
  if (tt & ETK_DIV) this.bs();
  else this.os();
}

function wcb_MIN_b(rawStr, tt) {
  if (tt & ETK_MIN) this.bs();
  else this.os();
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

function wcb_afterStmt(rawStr, tt) { this.l(); }

function wcb_afterLineComment(rawStr, tt) {
  tt === ETK_NL || this.l();
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
  if (tt & ETK_NL) { this.os().w('('); this.wcbp.hasParen = true; return; }
  var lineLen = this.curLine.length;
  if (tt & (ETK_NUM|ETK_ID)) {
    if (this.ol(lineLen+1+rawStr.length) > 0) {
      this.rwr('(');
      this.wcbp.hasParen = true;
      this.l();
    }
    else this.hs();
    return;
  }
  if (this.ol(lineLen+1+rawStr.length) > 0) {
    if (this.ol(lineLen+rawStr.length) > 0) {
      this.rwr('(');
      this.wcbp.hasParen = true;
      this.l();
    }
    return;
  }
  this.hs();
}
