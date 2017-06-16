this.forProg =
function(n) {
  ASSERT.call(this, this.main === null, 'main');
  ASSERT.call(this, n.type === 'Program', 'program');
  this.main = n;
  return this;
};

this.withPath =
function(url) {
  ASSERT.call(this, this.path === "", 'not');
  ASSERT.call(this, this.main, 'main');
  url = cd("", url);
  this.loaded[_m(url)] = this.main;
  url = pathFor(url);
  this.path = url;
  return this;
};

this.cd =
function(url) {
  var oPath = this.path;
  this.path = cd(oPath, url);
  return oPath;
};

this.has =
function(url) {
  url = cd(this.path, url);
  return HAS.call(this.loaded, _m(url));
};

this.load =
function(url) {
  var normalizedURL = cd(this.path, url);
  ASSERT.call(this, !this.has(normalizedURL));
  var src = this.resolver.load(this.path, url);
  var n = new Parser(src, {sourceType: 'module'}).parseProgram();
  this.loaded[_m(url)] = n;
  var transformer = new Transformer();
  transformer.bundler = this;
  return transformer.tr(n, false);
};

this.get =
function(url) {
  url = cd(this.path, url);
  ASSERT.call(this, this.has(url));
  return this.loaded[_m(url)];
};
