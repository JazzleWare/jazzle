Transformers['#Bundler'] =
function(n, isVal) {
  n.loaded[_m(n.path)] = n.main;
  ASSERT.call(this, this.bundler === null, 'bundler');
  this.bundler = n;
  n.main = this.tr(n.main, false);
  return n;
};
