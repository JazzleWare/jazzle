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

function createRegexTester(Parser, tpaths) {
  var ts = new lib.TestSuite('Regex-Suite');

  ts.tester.make =
  function(test) {
    var p = new Parser(test.get('src'));
    return p;
  };

  ts.tester.run =
  function(tester, test) {
//  console.error(test);
    var fl = test.get('flags');
    var n = {
      src: tester.src,
      result: tester.parseRegex(0, 1, 0, tester.src.length + 1 + fl.length, ncap(tester.src), fl, tester.src.length + 1, 1, tester.src.length + 1)
    };
    if (!n.result)
      console.error(n);
    if (n.result.type === '#Regex.Err')
      throw n;
    return n;
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
//    delete a.loc; 
//    console.error("E", e);
//    console.error("A", a);
      if (a.type === '#Regex.Ho') {
        if (a.c1)
          ASSERT.call(this, a.c2 && a.c1.next === a.c2);
        delete a.c1; delete a.c2
      }
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
    if (comp) { console.error("E", util.obj2str(eR)); console.error("A", util.obj2str(aR)); }
      
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
          "["+test.get('src')+"]"
        );

      if (test && test.contrary()) {
        console.error(test);
        throw new Error('actual type is not matching the expected type');
      }

      if (test && test.actual.type === 'pass' && test.incompatible()) {
        console.error(test);
        console.error( util.obj2str (test.comp.value));
        throw new Error('pass but not matching strictly');
      }
    },
    stats: {
      pass: { g: 0, e: 0, c: 0, i: 0, total: 0 },
      fail: { g: 0, e: 0, c: 0, i: 0, total: 0 }
    }
  };

  var ignores = {
    '[\\0001]': true,
    '[\\B]': true,
    '\\0': true 
  };
  var l = 0x0410; while (l < 0x0450) ignores['\\c'+String.fromCharCode(l++)] = true;

  ts.addIgnorer('.ignore', function(test) {
    var src = test.get('src');
    return HAS.call(ignores, src) && ignores[src];
  });

  loadRegexTests(ts, tpaths);

  return ts;
};

function loadRegexTests(ts, tpaths) {
  var e = 0;
  while (e < tpaths.length) {
    var elem = tpaths[e];
    var json = fs.readFileSync(elem.path, 'utf-8').toString();
    json = JSON.parse(json);
    for (var name in json) {
      if (!HAS.call(json, name)) continue;
      var test = new lib.Test();
      test.set('src', name);
      test.set('flags',elem.flags);

      var originalResult = json[name];
      test.set('original', originalResult);
      if (originalResult.type === 'error')
        test.expectVT({src: name, result: originalResult}, 'fail');
      else
        test.expectVT({src: name, result: regexCast(originalResult)}, 'pass');
      ts.add(test);
    }
    e++;
  }
}

function LOC(n) {
  var str = ""; // util.obj2str(n);
  ASSERT.call(this, !HAS.call(n, 'loc'), 'loc '+str);
  ASSERT.call(this, HAS.call(n, 'end'), 'end '+str);
  ASSERT.call(this, HAS.call(n, 'start'), 'start '+str);
  n.loc = { start: { line: 1, column: n.start }, end: { line: 1, column: n.end } };
  return n;
}

function regexNormalize(n) {
  switch (n.type) {
  case '#Regex.Main':
    return n;
  case '#Regex.Branch':
    return LOC({
      type: '#Regex.Main',
      branches: [n],
      start: n.start,
      end: n.end
    });
  default:
    return regexNormalize(LOC({
      type: '#Regex.Branch',
      elements: [n],
      start: n.start,
      end: n.end
    }));
  }
}

function regexBranch(r) {
  if (r === null)
    return r;
  if (r.type === '#Regex.Branch')
    return r;

  var elements = [r];
  return LOC({
    type: '#Regex.Branch',
    elements: elements,
    start: r.start,
    end: r.end
  });
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
      last.loc.end = n.loc.end;
    }
    else {
      if (last && last.type === '#Regex.SurrogateComponent' && last.kind === 'lead' &&
        n.type === '#Regex.SurrogateComponent' && n.kind === 'trail')
        last.next = n;
      last = n; r.push(n);
    }
  }
  return r;
};

Cast['value'] =
function() {
  var v = -1;
  v = this.codePoint;
  if (v > 0xFFFF)
    return LOC({
      type: '#Regex.Ho',
      cp: v,
      start: this.range[0],
      end: this.range[1],
      raw: this.raw
    });

  if ((v >= 0x0d800 && v <= 0x0dbff) || (v >= 0x0dc00 && v <= 0x0dfff))
    return LOC({
      type: '#Regex.SurrogateComponent',
      kind: v > 0x0dbff ? 'trail' : 'lead',
      start: this.range[0],
      end: this.range[1],
      cp: this.codePoint,
      next: null,
      raw: this.raw
    });

  return LOC({
    type: '#Regex.CharSeq',
    cp: this.codePoint,
    start: this.range[0],
    end: this.range[1],
    value: String.fromCharCode(this.codePoint),
    charLength: 1,
    raw: this.raw
  });
};     

Cast['disjunction'] =
function() {
  var branches = [], list = this.body, e = 0;
  while (e < list.length) {
    var r = list[e++];
    branches.push(regexBranch(r && cast.call(r)));
  }
  return LOC({
    type: '#Regex.Main',
    branches: branches,
    start: this.range[0],
    end: this.range[1],
  });
};

Cast['alternative'] =
function() {
  if (this.body.length === 0)
    return null;
  return LOC({
    type: '#Regex.Branch',
    elements: castArrayToBranch(this.body),
    start: this.range[0],
    end: this.range[1]
  });
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
      var branch = LOC({
        type: '#Regex.Branch',
        elements: castArrayToBranch(list),
        start: list[0].range[0],
        end: list[list.length-1].range[1]
      });
      r = {
        type: '#Regex.Main',
        branches: [branch],
      };
      r.start = branch.start;
      r.end = branch.end;
      r = LOC(r);
    }
    n.pattern = r;
  }
  return LOC(n);
};

Cast['reference'] =
function() {
  return LOC({
    type: '#Regex.Ref',
    value: this.matchIndex,
    start: this.range[0],
    end: this.range[1],
    raw: this.raw
  });
};

Cast['quantifier'] =
function() {
  var n = LOC({
    type: '#Regex.Quantified',
    raw: this.raw,
    start: this.range[0],
    end: this.range[1],
    greedy: this.greedy
  });
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
  var n = LOC({
    type: '#Regex.Class',
    inverse: this.negative,
    start: this.range[0],
    end: this.range[1],
    elements: []
  });
  var list = this.body, last = null, e = 0;
  while (e < list.length) {
    var elem = n.elements[e] = cast.call(list[e]);
    if (elem.type === '#Regex.CharSeq' && elem.raw === '-')
      elem.type = '#Regex.Hy';
    var l = last;
    if (l && l.type === '#Regex.Range')
      l = l.max;
    if (l && l.type === '#Regex.SurrogateComponent' && l.kind === 'lead' &&
      elem.type === '#Regex.SurrogateComponent' && elem.kind === 'trail')
      l.next = elem;
    last = elem;
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

  return LOC({
    type: '#Regex.Assertion',
    kind: t,
    start: this.range[0],
    end: this.range[1],
  });
};

Cast['dot'] =
function() {
  return LOC({
    type: '#Regex.Dot',
    end: this.range[1],
    start: this.range[0]
  });
};

Cast['characterClassEscape'] =
function() {
  return LOC({
    type: '#Regex.Classifier',
    kind: this.value,
    start: this.range[0],
    end: this.range[1],
  });
};

Cast['characterClassRange'] =
function() {
  return LOC({
    type: '#Regex.Range',
    min: cast.call(this.min),
    start: this.range[0],
    end: this.range[1],
    max: cast.call(this.max)
  });
};

 module.exports.createRegexTester = createRegexTester;

