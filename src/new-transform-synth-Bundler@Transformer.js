Transformers['#Bundler'] =
function(n, isVal) {
  ASSERT.call(this, this.bundler === null, 'bundler');
  this.bundler = n;
  n.main = this.tr(n.main, false);
  return n;
};
