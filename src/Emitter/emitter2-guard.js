  import {ASSERT, ASSERT_EQ} from '../other/constants.js';
  import {guard_simpleListener} from '../other/wcb.js';
  import {cls} from './cls.js';

cls.insertGuard =
function(guard) {
  ASSERT.call(this, this.guard === null, 'existing guard');
  ASSERT.call(this, this.guardArg === null, 'existing guardArg');
  ASSERT.call(this, this.guardListener === null, 'existing guardListener');

  ASSERT.call(this, !this.runningGuard, 'running');

  this.guard = guard;
};

cls.monitorGuard =
function(listener) {
  ASSERT.call(this, this.guard !== null, 'no');
  ASSERT.call(this, this.guardListener === null, 'listener');

  this.guardListener = listener;
};

cls.runGuard =
function(str, t) {
  var guard = this.guard, guardListener = this.guardListener;
  this.removeGuard_any();

  this.runningGuard = true;
  guard.call(this, str, t);
  if (guardListener) {
    ASSERT_EQ.call(this, guardListener.used, false);
    guardListener.used = true;
  }
  this.guardArg = null;
  this.runningGuard = false;
};

cls.listenForEmits =
function(fallbackListener) {
  var l = null;
  if (this.guard === null) {
    l = fallbackListener;
    this.insertGuard(guard_simpleListener);
    this.monitorGuard(l);
  } else {
    l = this.guardListener;
    if (l === null) {
      l = this.defaultGuardListener;
      l.used = false;
      this.monitorGuard(l);
    }
  }
  return l;
};

cls.removeGuard_any =
function() {
  ASSERT.call(this, this.guard !== null, 'no');
  this.guard = this.guardListener = null;
};

cls.removeGuard_if =
function(listener) {
  // TODO: uncomment below
  // ASSERT.call(this, this.guard !== null, 'no');
  if (this.guard === null)
    return false;
  var guardListener = this.guardListener;

  // TODO: uncomment below
  // ASSERT.call(this, guardListener !== null, 'listener');
  if (guardListener === null)
    return false;

  if (listener !== guardListener)
    return false;

  ASSERT_EQ.call(this, listener.used, false);
  this.removeGuard_any();

  return true;
};

cls.setGuardArg =
function(arg) {
  ASSERT.call(this, arg === null || this.guard !== null, 'no');
  ASSERT.call(this, (arg === null ? this.guard : this.guardArg) === null, 'n');

  this.guardArg = arg;
};

cls.insertGuard_try =
function(guard) {
  if (this.guard !== null)
    return false;
  this.insertGuard(guard);
  return true;
};


