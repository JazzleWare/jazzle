this.readID_bs =
function() {
  if (this.ct === ERR_NONE_YET) {
    this.ct = ERR_PIN_UNICODE_IN_RESV;
    this.pinLoc_c(this.c,this.li,this.col);
  }
  var bsc = this.readBS();
  var ccode = bsc;
  if (bsc >= 0x0D800 && bsc <= 0x0DBFF)
    this.err('id.head.is.surrogate');
  else if (!isIDHead(bsc))
    this.err('id.head.esc.not.idstart');

  var head = cp2sp(bsc);
  return this.readID_withHead(head);
};
