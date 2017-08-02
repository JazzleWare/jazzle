var util = require('../../common/util.js');
var ASSERT = util.ASSERT;
var HAS = util.HAS;
var lib = require('../lib.js');

var fs = require('fs');

function ncap(str) {
  var e = 0, inClass = false, esc = false, np = 0;
  while (e < str.length) {
    switch(str.charAt(e)) {
    case '\\':
      esc = !esc;
      break;
    case ']':
      if (esc) esc = false;
      else if (inClass) inClass = false;
      break;
    case '[':
      if (esc) esc = false;
      else if (!inClass) inClass = true;
      break;
    case '(':
      if (esc) esc = false;
      else if (!inClass) {
        if (e + 1 < str.length && str.charAt(e+1) !== '?')
          ++np;
      }
      break;
    default:
      if (esc) esc = false;
      break;
    }
    e++;
  }

  return np;
};

function createRegexTester(Parser, tpath) {
  var ts = new lib.TestSuite('Regex-Suite');

  ts.tester.make =
  function(test) {
    var p = new Parser(test.get('src'));
    return p;
  };

  ts.tester.run =
  function(tester, test) {
    return { src: tester.src, result: tester.parseRegex(0, 1, 0, tester.src.length + 1, ncap(tester.src), "") };
  };

  ts.comp.fail =
  function(e,a) {
    return { value: null, compatible: true, state: 'complete' };
  };

  ts.comp.pass =
  function(e,a) {
    var aR = a.result, eR = e.result;
    var eS = e.src, aS = a.src;
//  console.error("E", util.obj2str(eR), "A", util.obj2str(aR));
    var comp = util.compare_ea(eR, aR, null, function(e,a) {
      delete a.loc; 
//    console.error("E", e);
//    console.error("A", a);
      if (a.type !== '#Regex.Quantified')
        return;
      a.raw = aS.substring(a.start, a.end );
      switch (a.quantifier) {
      case '?': a.min = 0; a.max = 1; break;
      case '+': case '*':
        a.min = a.quantifier !== '*' ? 1 : 0;
        a.max = null;
        break;
      default:
        a.min = a.rangeQuantifier.min.value;
        if (a.rangeQuantifier.max !== null)
          a.max = a.rangeQuantifier.max.value;
        else
          a.max = null;
      }
      delete a.quantifier;
      delete a.rangeQuantifier;
    });
    return { value: comp, compatible: comp === null, state: 'complete' };
  };

  var NAMES = { g: 'ignore', e: 'compatible', c: 'contrary', i: 'non-matching' };
  ts.listener = {
    notify: function(state, test) {
      if (test && test.contrary() && test.actual.type !== 'fail')
        console.error(test, state);
      if (state === 'complete') {
        this.stats[test.actual.type].total++;
        this.stats[test.actual.type][test.geci()]++;
      }
      else if (state === 'finish') 
        console.error(this.stats);

      if (state !== 'finish')
        console.error(
          state + '[ex='+test.expected.type+' got='+test.actual.type+']',
          NAMES[test.geci()],
          test.name
        );

      if (test && test.contrary()) {
        console.error(test);
        throw new Error('actual type is not matching the expected type');
      }

      if (test && test.actual.type === 'pass' && test.incompatible()) {
        console.error(test);
        console.error(util.obj2str(test.comp.value));
        throw new Error('pass but not matching strictly');
      }
    },
    stats: {
      pass: { g: 0, e: 0, c: 0, i: 0, total: 0 },
      fail: { g: 0, e: 0, c: 0, i: 0, total: 0 }
    }
  };

  loadRegexTests(ts, tpath);
  return ts;
};

function loadRegexTests(ts, tpath) {
  var json = fs.readFileSync(tpath, 'utf-8').toString();
  json = JSON.parse(json);
  for (var name in json) {
    if (!HAS.call(json, name)) continue;
    var test = new lib.Test();
    test.set('src', name);

    var originalResult = json[name];
    test.set('original', originalResult);
    if (originalResult.type === 'error')
      test.expectVT({src: name, result: originalResult}, 'fail');
    else
      test.expectVT({src: name, result: regexCast(originalResult)}, 'pass');
    ts.add(test);
  }
}

function regexNormalize(n) {
  switch (n.type) {
  case '#Regex.Main':
    return n;
  case '#Regex.Branch':
    return {
      type: '#Regex.Main',
      branches: [n],
      start: n.start,
      end: n.end
    };
  default:
    return regexNormalize({
      type: '#Regex.Branch',
      elements: [n],
      start: n.start,
      end: n.end
    });
  }
}

function regexBranch(r) {
  if (r === null)
    return r;
  if (r.type === '#Regex.Branch')
    return r;

  var elements = [r];
  return {
    type: '#Regex.Branch',
    elements: elements,
    start: r.start,
    end: r.end
  };
};

function regexCast(r) { return regexNormalize(cast.call(r)); };

var Cast = {};

function cast() {
  if (!HAS.call(Cast, this.type)) {
    console.error(this);
    throw new Error(this.type);
  }
  return Cast[this.type].call(this);
}

function castArrayToBranch(list) {
  var r = [], last = null, e = 0;
  while (e < list.length) {
    var n = cast.call(list[e++]);
    if (last && last.type === '#Regex.CharSeq' && n.type === '#Regex.CharSeq') {
      last.cp = -1;
      last.charLength++;
      last.raw += n.raw;
      last.end = n.end;
      last.value += n.value;
    }
    else { last = n; r.push(n); }
  }
  return r;
};

Cast['value'] =
function() {
  return {
    type: '#Regex.CharSeq',
    cp: this.codePoint,
    start: this.range[0],
    end: this.range[1],
    value: String.fromCharCode(this.codePoint),
    charLength: 1,
    raw: this.raw
  };
};     

Cast['disjunction'] =
function() {
  var branches = [], list = this.body, e = 0;
  while (e < list.length) {
    var r = list[e++];
    branches.push(regexBranch(r && cast.call(r)));
  }
  return {
    type: '#Regex.Main',
    branches: branches,
    start: this.range[0],
    end: this.range[1],
  };
};

Cast['alternative'] =
function() {
  if (this.body.length === 0)
    return null;
  return {
    type: '#Regex.Branch',
    elements: castArrayToBranch(this.body),
    start: this.range[0],
    end: this.range[1]
  };
};

Cast['group'] =
function() {
  var list = this.body;
  var n = { start: this.range[0], end: this.range[1] };
  if (this.behavior === 'normal' || this.behavior === 'ignore') {
    n.type = '#Regex.Paren';
    n.capturing = this.behavior === 'normal';
  }
  else {
    n.type = '#Regex.Peek';
    n.inverse = this.behavior !== 'lookahead';
  }
  if (!list.length)
    n.pattern = null;
  else {
    var r = null;
    if (list.length === 1)
      r = regexNormalize(cast.call(list[0]));
    else {
      var branch = {
        type: '#Regex.Branch',
        elements: castArrayToBranch(list),
        start: list[0].range[0],
        end: list[list.length-1].range[1]
      };
      r = {
        type: '#Regex.Main',
        branches: [branch],
      };
      r.start = branch.start;
      r.end = branch.end;
    }
    n.pattern = r;
  }
  return n;
};

Cast['reference'] =
function() {
  return {
    type: '#Regex.Ref',
    value: this.matchIndex,
    start: this.range[0],
    end: this.range[1],
    raw: this.raw
  };
};

Cast['quantifier'] =
function() {
  var n = {
    type: '#Regex.Quantified',
    raw: this.raw,
    start: this.range[0],
    end: this.range[1],
    greedy: this.greedy
  };
  var list = this.body ;
  ASSERT.call(this, list.length <= 1, 'len');
  if (!list.length) 
    n. pattern = null;
  else
    n. pattern = cast.call(list[0]);

  n.min = this.min;
  if (HAS.call(this, 'max'))
    n.max = this.max;

  return n;
};

Cast['characterClass'] =
function() {
  var n = {
    type: '#Regex.Class',
    inverse: this.negative,
    start: this.range[0],
    end: this.range[1],
    elements: []
  };
  var list = this.body, e = 0;
  while (e < list.length) {
    var elem = n.elements[e] = cast.call(list[e]);
    if (elem.type === '#Regex.CharSeq' && elem.raw === '-')
      elem.type = '#Regex.Hy';
    e++;
  }
//console.error(util.obj2str(n));
  return n;
};

Cast['anchor'] =
function() {
  var t = "";
  switch (this.kind) {
  case 'end': t = '$'; break;
  case 'boundary': t = 'b'; break;
  case 'start': t = '^'; break;
  default: t = 'B'; break;
  }

  return {
    type: '#Regex.Assertion',
    kind: t,
    start: this.range[0],
    end: this.range[1],
  };
};

Cast['dot'] =
function() {
  return {
    type: '#Regex.Dot',
    end: this.range[1],
    start: this.range[0]
  };
};

Cast['characterClassEscape'] =
function() {
  return {
    type: '#Regex.Classifier',
    kind: this.value,
    start: this.range[0],
    end: this.range[1],
  };
};

Cast['characterClassRange'] =
function() {
  return {
    type: '#Regex.Range',
    min: cast.call(this.min),
    start: this.range[0],
    end: this.range[1],
    max: cast.call(this.max)
  };
};

 module.exports.createRegexTester = createRegexTester;

