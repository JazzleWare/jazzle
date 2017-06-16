this.has =
function(base, sub) {
  base = cd("", base);
  sub = cd(base, sub);
  return HAS.call(this.fsmap, _m(sub));
};

this.load =
function(base, sub) {
  base = cd("", base);
  ASSERT.call(this, this.has(base, sub), '[:'+sub+':]');
  sub = cd(base, sub);
  return this.fsmap[_m(sub)];
};

this.set =
function(base, sub, src) {
  base = cd("", base);
  sub = cd(base, sub);
  this.fsmap[_m(sub)] = src;
  return this;
};
