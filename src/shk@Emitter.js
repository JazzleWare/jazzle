this.active =
function(a) { // actix
  if (!this.allow.elemShake)
    return true;

  if (a.activeness === ANESS_CHECKING)
    return false;
  if (a.activeness === ANESS_ACTIVE)
    return true;
  if (a.activeness === ANESS_INACTIVE)
    return false;

  ASSERT.call(this, a.activeness === ANESS_UNKNOWN, 'aness' );
  a.activeness = ANESS_CHECKING;
  var active = false;
  if (a.ns) active = a.role != ACT_SCOPE || !a.isAnyFn();
  if (!active) {
    var list = a.activeIf, len = list ? list.length() : 0, l = 0;
    while (l < len) {
      if (this.active(list.at(l++))) {
        active = true;
        break;
      }
    }
  }

  a.activeness = active ? ANESS_ACTIVE : ANESS_INACTIVE;
  return active;
};

this.makeActive =
function(a) {
  ASSERT.call(this, a.activeness === ANESS_UNKNOWN, 'aness');
  a.activeness = ANESS_ACTIVE;
};
