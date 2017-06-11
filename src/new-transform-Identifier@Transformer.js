Transformers['Identifier'] =
function(n, isVal) {
  n = this.toResolvedName(n, 'ex');
  return n;
};

this.trSAT_name =
function(n, isVal) {
  n = this.toResolvedName(n, 'sat');
  return n;
};
