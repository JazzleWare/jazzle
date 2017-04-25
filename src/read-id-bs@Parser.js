this.readID_bs =
function() {
  var bsc = this.readBS();
  var ccode = bsc;
  var head = String.fromCharCode(bsc);
  if (bsc >= 0x0D800 && bsc <= 0x0DBFF) {
    var secondByte = this.readSecondByte();
    ccode = surrogate(bsc, secondByte);
    head += String.fromCharCode(secondByte);
  }

  return this.readID_withHead(head);
};
