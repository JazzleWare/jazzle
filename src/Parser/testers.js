  import {arorev} from '../other/util.js';
  import {ASSERT, PE_NO_NONVAR, PE_NO_LABEL, PE_NONE} from '../other/constants.js';
  import {cls} from './ctor.js';

cls.ensureSAT =
function(left) {

  switch (left.type) {
  case 'Identifier':
    if (this.scope.insideStrict() &&
      arorev(left.name))
      this.err('assig.to.arguments.or.eval');
  case 'MemberExpression':
    return true;
  }

  return false;
};

cls.patErrCheck =
function() {
  ASSERT.call(this, this.vpatCheck,
    'PEC msut have vpatCheck hold');
  this.vpatCheck = false;
  if (!this.scope.canDeclareLexical())
    this.vpatErr = PE_NO_NONVAR;
  else if (this.unsatisfiedLabel)
    this.vpatErr = PE_NO_LABEL;
  else return false;

  return true;
};

cls.setPatCheck =
function(shouldCheck) {
  if (shouldCheck) {
    this.vpatCheck = true;
    this.vpatErr = PE_NONE;
  }
};


