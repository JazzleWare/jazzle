this.has =
function(url) {
  return HAS.call(this.fsmap, _m(url));
};

this.load =
function(url) {
  url = cd("", url);
  ASSERT.call(this, this.has(url), '[:'+url+':]');
  return this.fsmap[_m(url)];
};

this.set =
function(url, src) {
  url = cd("", url);
  this.fsmap[_m(url)] = src;
  return this;
};
