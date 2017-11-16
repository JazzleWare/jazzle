this.ac =
function(to, name, from) {
  if (from === null)
    return;
  ASSERT.call(this, from, 'from');
  if (!HAS.call(to, name))
    to[name] = from;
  else
    to[name].mergeWith(from );
};

this.gec0 =
function(cb, n) {
  return HAS.call(cb, n) ? cb[n] : null;
};
