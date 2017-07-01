this.onW =
function() {
  ASSERT.call(this, arguments.length >= 1, 'arguments');
  ASSERT.call(this, this.onWrite_fun === null, 'onWrite_fun');
  this.onWrite_fun = arguments[0];
  this.onWrite_arg = arguments.length > 1 ? arguments[1] : null;
};

this.hasOnW =
function() { return this.onWrite_fun ; };

this.clearOnW =
function() {
  ASSERT.call(this, this.hasOnW(), 'hasOnW');
  this.onWrite_fun = null;
  this.onWrite_arg = null;
};

this.invW =
function(rawStr) { return this.onWrite_fun(); };
