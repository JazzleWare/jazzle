  import {surrogate} from '../other/util.js';
  import {cls} from './cls.js';

this.regMakeSurrogate =
function(c1, c2) {
  return {
    type: '#Regex.Ho',
    cp: surrogate(c1.cp, c2.cp ),
    start: c1.start,
    end: c2.end,
    raw: c1.raw + c2.raw,
    loc: { start: c1.loc.start, end: c2.loc.end },
    c1: c1,
    c2: c2
  };
};

this.regSurrogateComponent_VOKE =
function(cp, offset, kind, escape) {
  var c0 = this.c, loc0 = this.loc();
  this.setsimpoff(offset);
  this.regQuantifiable = true;
  return {
    type: '#Regex.SurrogateComponent',
    kind: kind,
    start: c0,
    end: offset,
    cp: cp,
    loc: { start: loc0, end: this.loc() },
    next: null, // if it turns out to be the lead of a surrogate pair
    escape : escape ,
    raw: this.src.substring(c0, offset)
  };
};

