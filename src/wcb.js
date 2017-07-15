
function wcb_ADD(rawStr, tt) {
  if (tt & ETK_ADD) this.bs();
}

function wcb_DIV(rawStr, tt) {
  if (tt & ETK_DIV) this.bs();
}

function wcb_MIN(rawStr, tt) {
  if (tt & ETK_MIN) this.bs();
}

function wcb_intDotGuard(rawStr, tt) {
  rawStr === '.' && this.bs();
}

function wcb_idNumGuard(rawStr, tt) {
  if (tt & (ETK_NUM|ETK_ID)) this.bs();
}

function wcb_afterStmt(rawStr, tt) {
  this.l();
}

function wcb_afterElse(rawStr, tt) {
  wcb_idNumGuard.call(this, rawStr, tt);
}

function wcb_afterNew(rawStr, tt) {
  wcb_idNumGuard.call(this, rawStr, tt);
}

