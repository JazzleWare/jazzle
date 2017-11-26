  import {cls} from './cls.js';

cls.regUnitAssertion =
function() {
  var c0 = this.c, loc0 = this.loc();
  var kind = this.src.charAt(this.c);
  this.setsimpoff(this.c+1);
  return {
    type: '#Regex.Assertion',
    kind: kind,
    start: c0,
    end: this.c,
    loc: { start: loc0, end: this.loc() }
  };
};

cls.regBbAssertion =
function() {
  var c0 = this.c, loc0 = this.loc();
  var kind = this.src.charAt(c0+1);
  this.setsimpoff(c0+2);
  return {
    type: '#Regex.Assertion',
    kind: kind,
    start: c0,
    end: this.c,
    loc: { start: loc0, end: this.loc() }
  };
};


