this.readID_surrogate =
function(sc) {
  var secondByte = this.readSecondByte();
  var ccode = surrogate(sc, secondByte);
  if (!isIDHead(ccode))
    this.err('surrogate.not.id.head');

  return this.readID_withHead(
    String.fromCharCode(sc) +
    String.fromCharCode(secondByte)
  );
};
