this.verifyForStrictness =
function() {
  this.verifyForUniqueArgs();
  var list = this.paramList, i = 0;
  while (i < list.length) {
    var elem = list[i++];
    if (arguments_or_eval(elem.name))
      this.parser.err('binding.to.arguments.or.eval');
    if (this.validateID(elem.name))
      this.parser.err('invalid.argument.in.strict.mode');
  }
};
