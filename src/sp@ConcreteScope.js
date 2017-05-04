this.spCreate_this =
function(ref) {
  if (!ref)
    ref = new Ref(this);

  ASSERT.call(this, this.spThis === null,
    'this scope has already got a this liquid');

  // TODO: tz check is also needed for 'this' (in some cases)
  var lq = new Liquid('<this>')
    .r(ref)
    .name('this_');

  return this.spThis = lq;
};
