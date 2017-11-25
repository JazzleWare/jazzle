  import {ASSERT_EQ, ASSERT} from '../other/constants.js';
  import {cls} from './cls.js';

cls.writeToOut_nonLineBreak =
function(str) {
  this.ensureOutActive();
  this.writeToOut_raw(str);
};

cls.writeToOut_lineBreak =
function() {
  this.ensureOutActive();
  this.emline_cur++;
//this.emcol_cur = 0;
  this.writeToSMout(';'); // TODO: ensure we are allowed to actually write to SM; we must have actually committed anything in lm beforehands
  this.writeToOut_raw('\n');
}; 

cls.writeToOut_raw =
function(str) { this.out = this.out.concat(str); this.outLen += str.length; };

cls.useOut =
function(use) {
  ASSERT_EQ.call(this, !this.outActive, use);
  this.outActive = use;
};

cls.ensureOutActive =
function() { ASSERT.call(this, this.outActive, 'out is not in use' ); };


