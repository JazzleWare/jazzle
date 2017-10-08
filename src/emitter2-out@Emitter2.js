this.writeToOut_nonLineBreak =
function(str) {
  this.ensureOutActive();
  this.writeToOut_raw(str);
};

this.writeToOut_lineBreak =
function() {
  this.ensureOutActive();
  this.emline_cur++;
  this.emcol_cur = 0;
  this.sm += ';';
  this.writeToOut_raw('\n');
}; 

this.writeToOut_raw =
function(str) { this.out += str; };

this.useOut =
function(use) {
  ASSERT_EQ.call(this, !this.outActive, use);
  this.outActive = use;
};

this.ensureOutActive =
function() { ASSERT.call(this, this.outActive, 'out is not in use' ); };
