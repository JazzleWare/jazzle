
function wcb_ADD(rawStr) {
  if (this.hastt(ETK_ADD)) this.bs();
}

function wcb_DIV(rawStr) {
  if (this.hastt(ETK_DIV)) this.bs();
}

function wcb_MIN(rawStr) {
  if (this.hastt(ETK_MIN)) this.bs();
}

function wcb_intDotGuard(rawStr) {
  rawStr === '.' && this.bs();
}

function wcb_idNumGuard(rawStr) {
  if (this.hastt(ETK_NUM|ETK_ID)) this.bs();
}

function wcb_afterStmt(rawStr) {
  this.l();
}

function wcb_afterElse(rawStr) {
  wcb_idNumGuard.call(this, rawStr);
}

function wcb_afterNew(rawStr) {
  wcb_idNumGuard.call(this, rawStr);
}

