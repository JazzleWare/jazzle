function Macro() {
  this.def = {};
  this.preprocessors = [];
}

var macro = Macro.prototype;

macro.define = function(sym) {
  this.def[sym+'%'] = true;
};

macro.isOn = function(sym) {
  sym += '%';
  return this.def.hasOwnProperty(sym) && this.def[sym];
};

function findSpecialComment(str, offset, name) {
  var comment0 = '/* #'+name;
  var offset0 = str.indexOf(comment0, offset);
  var comment = '// #'+name;
  offset = str.indexOf(comment, offset);
  var l = true;
  if ( offset0 !== -1 && ( offset === -1 || offset0 < offset ) ) {
    comment = comment0;
    offset = offset0;
    l = false;
  }
  else if (offset === -1 && offset0 === -1)
    return null;
 
  var lineStart = l ? str.lastIndexOf('\n', offset) : offset;
  if (lineStart === -1)
    lineStart = 0;

  var lineEnd = str.indexOf(l ? '\n' : '*/', offset+1);

  if (lineEnd === -1) {
    if (!l) throw new Error ('Unfinished comment on ' + lineStart);
    lineEnd = str.length;
  }
  else if (!l) lineEnd += 2;
  
  return { lineStart: lineStart, name: name, nameStart: offset, lineEnd: lineEnd, nameEnd: offset+comment.length, fullComment: comment, line: l };
};

function readCond(str, sp) {
  var not = false;
  var l = str.slice(sp.nameEnd, sp.lineEnd);
  l = (sp.line ? /^\s*([^\s]*)\s*$/ : /\s*([^\s]*)\s*\*\/$/).exec(l)[1];
  if (l.charAt(0)==='!') { not = true; l = l.slice(1); }
  return { n: not, name: l };
}
  
macro.callOn = function(str) {
  var e = -1;
  var s = 0;
  var fragments = [];

  var list = this.preprocessors, i = 0;
  while (i < list.length)
    str = list[i++].call(this, str);

  while (true) {
    var ifComment = findSpecialComment(str, s, 'if');
    var holds = false;
    if (!ifComment) break;
    if (s !== ifComment.lineStart) fragments.push(str.slice(s,ifComment.lineStart));

    var cond = readCond(str, ifComment);
    holds = this.isOn(cond.name);

    if (cond.n) holds = !holds;
    var current = ifComment;

    var end = findSpecialComment(str, current.lineEnd, 'end');
    if (!end) throw new Error("Unfinished macro at "+current.lineEnd);

    var elseComment = findSpecialComment(str, ifComment.lineEnd, 'else');
    if (elseComment && elseComment.lineStart < end.lineStart) {
      if (holds) {
        fragments.push(str.slice(ifComment.lineEnd, elseComment.lineStart));
        holds = false;
      }
      else { current = elseComment; holds = true; }
    }
    if (holds) fragments.push(str.slice(current.lineEnd, end.lineStart));
    s = end.lineEnd;
  }
  if (s < str.length)
    fragments.push(s === 0 ? str : str.slice(s) );

  return fragments;
};

 module.exports.Macro = Macro;
