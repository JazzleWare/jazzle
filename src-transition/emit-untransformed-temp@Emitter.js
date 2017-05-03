UntransformedEmitters['temp'] = function(n, prec, flags) {
  ASSERT.call(this, n.liquid.synthName !== "",
    'a liquid has to have a synthesized name in order to be emittable');
  this.w(n.liquid.synthName);
};
