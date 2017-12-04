  import {_m} from '../other/scope-util.js';
  import {cls} from './cls.js';

cls.parseLabel = function(label, allowNull) {
  var ref = this.scope.findRefAny_m(_m(label.name));
  ref.d--;
  this.spc(label, 'aft');
  this.next();
  var mname = _m(label.name);
  var ex = this.findLabel_m(mname); // existing label
  ex && this.err('label.is.a.dup',{tn:label,extra:ex});

  this.labels[mname] =
    this.unsatisfiedLabel ?
    this.unsatisfiedLabel :
    this.unsatisfiedLabel = { loop: false };

  var stmt = this.parseStatement(allowNull);
  this.labels[mname] = null;

  return {
    type: 'LabeledStatement',
    label: label,
    start: label.start,
    end: stmt.end,
    loc: { start: label.loc.start, end: stmt.loc.end },
    body: stmt,
    '#y': this.Y0(stmt), '#c': {}
  };
};


