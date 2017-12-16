(function(mex) {
var path = require('path'),
    has = Object.prototype.hasOwnProperty,
    fs = require('fs');

mex.assert = function(cond, message) {
  if (!cond)
    throw new Error(message);
};

mex.dirIter = function iter(base, onItem) {
  var list = fs.readdirSync(base), e = 0;
  while (e < list.length) {
    var itemPath = path.join(base, list[e]);
    e++;
    onItem(itemPath, iter);
  }
};                

mex.readFile = function(name) {
   return fs.readFileSync(name, 'utf-8'); 
};

mex.tailIndex = function(str, e) {
  var i = str.lastIndexOf(e);
  return i >= 0 && i+e.length === str.length ? i : -1;     
};

mex.readJSON = function(filePath) {
  return JSON.parse(mex.readFile(filePath));
};

mex.has = function(obj, name) { return has.call(obj, name); };

mex.uon = function(obj) { return obj === null || obj === void 0; };

mex.TYPES = {
  STRING: typeof "STRING",
  BOOL: typeof false,
  NUMBER: typeof 12
};

mex.dump = function dump(obj, level, name, isTail, sp ) {
  var space = "", i = 0;
  while (i++ < level-1)
    space += sp;

  mex.assert(!mex.uon(name), 'name must be something other than null or undefined');
  space += name;

  if (obj === null)
    return space + "null";
  
  if (obj instanceof RegExp)
    return space + obj.toString();
  
  switch (typeof obj) {
  case mex.TYPES.BOOL:
    return space + (obj ? "true" : "false");
  
  case mex.TYPES.STRING:
     return space + '\"' + obj + '\"'  ;
  
  case mex.TYPES.NUMBER:
     return space + obj;         
  }
  
  if (obj === void 0) 
    return space + "<undefined>";

  i = 0;
  var trailingSpace = "";
  if (!isTail) {
    while (i++ < level) 
      trailingSpace += sp;
  }

  var str = "", elem = "";
  if (obj.length >= 0) {
    i = 0;
    while (i < obj.length) {
      elem = dump(obj[i], level + 1, "@" + i + ": ", i !== obj.length - 1, sp);
      str += '\n' + elem;
      i++;
    }

    if (i > 0) {
      if (!isTail)
        str += '\n' + trailingSpace;
    }
    else { str = "[]"; } 
    return space + str ;
  }      
      
  var item = null;
  i = 0;
  for (item in obj) {
    if (!mex.has(obj, item))
      continue;
    i++; 
  }

  for (item in obj) {
    if (!mex.has(obj, item))
      continue;
    --i;
    elem = dump(obj[item], level + 1, '\"' + item + '\": ', i === 0, sp);
    str += '\n' + elem;
  }
  
  if (str === "") { str = "{}"; }
  else if (!isTail) { str += '\n' + trailingSpace; }

  return space + str ;
};
  
mex.obj2str = function(obj) {
  return mex.dump(obj, 0, "", true, "|  ");
};

mex.compare_ea = function(expected, actual, name, adjust) {
  if (typeof actual !== typeof expected) 
    return { type: 'incompatible-types', actual: actual, expected: expected };

  if (actual instanceof RegExp) {
    if (!( expected instanceof RegExp ))
      return { type: 'incompatible-types', actual: actual, expected: expected };

    actual = actual.toString();
    expected = expected.toString();
  } 

  switch (typeof actual) {
  case mex.TYPES.STRING:
    if ( actual !== expected )
      return {
        type: 'not-equal',
        actual: actual + "(" + mex.toBytes(actual) + ")",
        expected: expected + "(" + mex.toBytes(expected) + ")"
      };

    return null;

  case mex.TYPES.BOOL:
  case mex.TYPES.NUMBER:
    if (actual !== expected) 
      return {
        type: 'not-equal',
        actual: actual,
        expected: expected + "(" + mex.toBytes(expected) + ")"
      };
 
      return null;
  }

  if (actual === null) {
    if (expected !== null)
      return { type: 'not-equal', actual: actual, expected: expected };

    return null;
  }

  return mex.compareObj_ea(expected, actual, name, adjust);
 
//if ( actual.length >= 0 ) {
//   if ( !(expected.length >= 0) )
//     return { type: 'incompatible-types', actual: actual, expected: expected };

//   return compareArray(expected,actual,name );
//}

}

mex.compareArray_ea = function(expected, actual, name, adjust) {
  var comp = null, i=0;
  while (i < expected.length) {
    var l = i < actual.length ?
      mex.compare_ea(expected[i], actual[i], i, adjust):
      { type: 'not-in-the-actual', val: expected[i] };

    if (l) {
      if (!comp) 
        comp = {};
      comp[i] = l;
    }
    i++;
  }
  
  if (i < actual.length) {
    if (!comp)
      comp = {};
    do {
      comp[i] = { type: 'not-in-the-expected', val: actual[i] };
      i++;
    } while (i < actual.length);
  }

  return comp;
};

mex.ej_adjust = function(e, j, name) {
  delete e.tokens; delete e.comments;
  delete e.raw; delete e. directive;
  delete e.errors; 

  delete j.y; delete j.scope;

  if (j.regex) {
    mex.assert(
      j.regex,
      "entry not in the esprima counterpart: 'regex'"
    );
    delete j.value; delete e.value;
  }

  if (!e.loc) delete j.loc;
  if (!e.range) delete j.range;

  if (name !== 'loc' && mex.has(j, 'start')) {
    if (e.range) {
      j.range = { 0: j.start, 1: j.end };
    }
    delete j.start; delete j.end;
  }

  delete j.raw;

  if (j.type === 'AssignmentProperty')
    j.type = 'Property';

  if (!mex.has(e, 'async'))
    delete j.async;

  if (name === 'params') {
    var i = 0;
    while (i < j.length) {
      if (j[i].type === 'AssignmentPattern' &&
          i < e.length &&
          j[i].type !== e[i].type ) {
         j[i] = j[i].left;
      }
      i++ ; 
    }
  }

  if (e.type === 'ForInStatement' && mex.has(e, 'each'))
    delete e.each;

  if (j.type === 'TemplateLiteral') {
    var list = j.quasis, i = 0;
    while ( i < list.length ) {
      list[i].start -= 1;
      list[i].end += i === list.length - 1 ? 1 : 2;
      list[i].loc.start.column -= 1;
      list[i].loc.end.column += i === list.length - 1 ? 1 : 2;
      i++ ; 
    }
  }

  if (e .type === 'AssignmentPattern') {
    if ( e.operator && !j.operator)
      j.operator = '=';
  }

  if (mex.has(e, 'source') &&
      e.type !== 'ExportNamedDeclaration' && 
      e.type !== 'ImportDeclaration' &&
      e.type !== 'ExportAllDeclaration')
    delete e.source;
 
  if (e.type === 'FunctionExpression' ||
      e.type === 'FunctionDeclaration')
    delete e.defaults;

  if ( e.type === 'TryStatement' ) {
    delete e.handlers; delete e.guardedHandlers;
  }
};

mex.compareObj_ea = function(expected, actual, name, adjust) {
  adjust && adjust(expected, actual, name);
  var comp = null, item = null;
  for (item in expected) {
    if (!mex.has(expected, item))
      continue;

    var l = mex.has(actual, item) ?
      mex.compare_ea(expected[item], actual[item], item, adjust ) :
      { type: 'not-in-the-actual', val: expected[item] };
 
    if (l) {
      if (!comp)
        comp = {};
      comp[item] = l;
    }
  }

  for (item in actual) {
    if (!mex.has(actual, item) ||
       mex.has(expected, item))
      continue ;

    if (!comp)
      comp = {} ;
    comp[item] = { type: 'not-in-the-expected', val: actual[item] };
  }

  return comp;
}

mex.toBytes = function(str) {
  var bytes = "", i = 0;
  while (i < str.length) {
    if (bytes.length)
      bytes += " ";
    
    bytes += str.charCodeAt(i++).toString(0x010);
  }
  return bytes;
};

})(module.exports);
