(function(){
"use strict";
;
function CatchScope(sParent) {
  Scope.call(this, sParent, ST_CATCH);

  this.args = new SortedObj();
  this.argRefs = new SortedObj();
  this.argIsSimple = false;
  this.argIsSignificant = false;
  this.inBody = false;
  this.bodyRefs = new SortedObj();

  this.refs = this.argRefs;
}
;
function ClassScope(sParent, sType) {
  Scope.call(this, sParent, sType|ST_CLS);  

  this.scopeName = null;
  this.clsTemp = null;
}
;
function ConcreteScope(parent, type) {
  Scope.call(this, parent, type);

  this.liquidDefs = new SortedObj();
  this.synthNamesUntilNow = new SortedObj();

  this.spThis = null;
}
;
function Decl() {
  this.ref = null;
  this.idx = -1;
  this.name = "";
  this.site = null;
  this.hasTZCheck = false;
  this.reached = false;
}
;
function Emitter(spaceString) {
  this.spaceString = arguments.length ? spaceString : "  ";
  this.indentCache = [""];
  this.lineStarted = false;
  this.indentLevel = 0;
  this.code = "";
  this.noWrap_ = false;
}
;
function ErrorString(stringsAndTemplates) {
  this.stringsAndTemplates = stringsAndTemplates;
}

function eof_rcurly(str, i) {
  if (i >= str.length)
    ASSERT.call(this, false, 'reached eof before a }');

  return str.charCodeAt(i) === CH_RCURLY; 
}

function readTemplate(str, i) {
  if (str.charCodeAt(i) === CH_RCURLY)
    return null;
  return Template.from(str, i, eof_rcurly);
}

ErrorString.from = function(str) {
  var elem = "", i = 0, list = [];
  while (i < str.length) {
    if (str.charCodeAt(i) === CH_LCURLY) {
      i++;
      var template = readTemplate(str, i);
      if (template === null)
        elem += '{';
      else {
        list.push(elem);
        list.push(template);
        elem = "";
        i += template.str.length;
      }
    }
    else
      elem += str.charAt(i);
    
    i++;
  }
  if (elem.length)
    list.push(elem);

  var error = new ErrorString(list);
  error.str = str;

  return error;
};
;
function FunScope(parent, type) {
  ConcreteScope.call(this, parent, type);

  this.argList = [];
  this.argMap = {};
  this.argRefs = new SortedObj();
  this.prologue = [];
  this.scopeName = null;
  this.firstNonSimple = 
  this.firstDup =
  this.firstEvalOrArguments = null;
  this.inBody = false;
  this.bodyRefs = new SortedObj();

  this.refs = this.argRefs;

  this.spArguments = null;
  this.spSuperCall = null;
}
;
function GlobalScope() {
  Scope.call(this, null, ST_GLOBAL);  
  this.scriptScope = null;
}

;
function Hitmap() {
  var validNames = arguments.length ? new SortedObj({}) : null;
  var i = 0;
  while (i < arguments.length)
    validNames.set(arguments[i++], true);
  this.validNames = validNames;
  this.names = new SortedObj({});
}
;
function LabelTracker(parent) {
  // the parent label tracker, or null if it is a top-level label tracker
  this.parent = parent || null;

  // the labels the label tracker has been given
  // before reaching a non-Labeledstatement node
  this.activeLabels = [];

  // the labels contained in this label tracker; it initially contains the active labels,
  // but each time a descendant label tracker finishes, that descendant label tracker concatenates
  // the array given below with its own contained labels
  this.containedLabels = [];

  // when the label tracker exits, it synthesizes a label name for a container it has been given
  this.synthAtExit = false;

  this.target = null;
}
;
function Liquid(category) {
  Decl.call(this);

  this.rsMap = {};
  this.category = category;
}
;
function ModuleScope(sParent, type) {
  Scope.call(this, sParent, type);

  this.inNames = new SortedObj();
  this.outNames = new SortedObj();
}
;
function ParenScope(sParent) {
  Scope.call(this, sParent, ST_PAREN);
  this.ch = [];
}

ParenScope.prototype = createObj(Scope.prototype);
;
var Parser = function (src, o) {

  this.src = src;
  this.unsatisfiedLabel = null;
  this.nl = false;

  this.ltval = null;
  this.lttype= "";
  this.ltraw = "" ;
  this.prec = 0 ;
  this.vdt = VDT_NONE;

  this.labels = {};

  this.li0 = 0;
  this.col0 = 0;
  this.c0 = 0;

  this.li = 1;
  this.col = 0;
  this.c = 0;

  this.luo = 0; // latest used offset
  this.lpn = null; // latest parsed node
  
  this.canBeStatement = false;
  this.foundStatement = false;

  this.isScript = false;
  this.v = 7;

  this.first__proto__ = false;

  this.scope = null;
  this.declMode = DT_NONE;
 
  this.exprHead = null;

  // ERROR TYPE           CORE ERROR NODE    OWNER NODE
  this.pt = ERR_NONE_YET; this.pe = null; this.po = null; // paramErr info
  this.at = ERR_NONE_YET; this.ae = null; this.ao = null; // assigErr info
  this.st = ERR_NONE_YET; this.se = null; this.so = null; // simpleErr info

  this.suspys = null;
  this.missingInit = false;

  // "pin" location; for errors that might not have been precisely caused by a syntax node, like:
  // function l() { '\12'; 'use strict' }
  //                 ^
  // 
  // for (a i\u0074 e) break;
  //         ^
  //
  // var e = [a -= 12] = 5
  //            ^
  this.ct = ERR_NONE_YET;
  this.pin = {
    c: { c:-1, li:-1, col:-1 },
    a: { c:-1, li:-1, col:-1 },
    s: { c:-1, li:-1, col:-1 },
    p: { c:-1, li:-1, col:-1 }
  };

  this.parenAsync = null; // so that things like (async)(a,b)=>12 will not get to parse.

  this.commentBuf = null;
  this.errorListener = this; // any object with an `onErr(errType "string", errParams {*})` will do
  this.parenScope = null;
};
;
function Ref() {
  this.i = 0;
  this.rsList = [];
  this.scope = null;
  this.d = 0;
  this.targetDecl = null;
  this.isResolved = false;
  this.parentRef = null;
}
;
function Scope(sParent, type) {
  this.parent = sParent;
  this.type = type;
  this.refs = new SortedObj();
  this.defs = new SortedObj();
  this.hasTZCheckPoint = false;
  this.scs = this.isConcrete() ?
    this :
    this.parent.scs;

  this.allowedActions = this.determineActions();
  this.flags = this.determineFlags();

  this.scopeID_ref = this.parent ?
    this.parent.scopeID_ref : {v: 0};
  this.scopeID = this.scopeID_ref.v++;

  this.parser = this.parent && this.parent.parser;

  this.di_ref = this.isConcrete() ?
    {v: 0} : this.parent.diRef;
  this.di0 = this.di_ref.v++;
}
;
function SortedObj(obj) {
  this.keys = [];
  this.obj = obj || {};
}

SortedObj.from = function(parent) {
  return new SortedObj(createObj(parent.obj));
};
;
function Template(idxList) {
  this.idxList = idxList;
  this.str = "";
}

function readParen(str, i, eof) {
  var elem = "";
  while (!eof(str, i)) {
    switch (str.charCodeAt(i)) {
    case CH_SINGLEDOT: elem += '.'; break;
    case CH_GREATER_THAN: elem += ')'; break;
    case CH_LESS_THAN: elem += '('; break;
    case CH_RPAREN: return elem;
    default:
      ASSERT.call(this, false, 
        'invalid character at index '+i+' -- "'+str.charAt(i)+'"');
    }
    i++;
  }
  ASSERT.call(this, false, 
    'reached eof before any ")" was found');
}

function eof_default(str, i) {
  return i >= str.length;
}

Template.from = function(str, i, eof) {
  i = i || 0;
  eof = eof || eof_default;
  var start = i, needDot = false, list = [], pendingDot = false, elem = "";
  while (!eof(str, i)) {
    var ch = str.charCodeAt(i);
    if (ch === CH_SINGLEDOT) {
      if (pendingDot)
        break;

      i++;
      list.push(elem);
      elem = "";
      if (needDot)
        needDot = false;

      pendingDot = true;
      continue;
    }
    if (needDot)
      ASSERT.call(this, false, 'dot expected at index'+(i-1));

    pendingDot = false;
    if (ch === CH_LPAREN) {
      i++;
      elem += readParen(str, i, eof);
      if (elem.length === 0)
        needDot = true; 
      
      i += elem.length + 1; // length + ')'.length
      continue;
    }

    // TODO: can be faster, yet for its limited use case it looks fast enough
    elem += str.charAt(i);
    i++;
  }

  pendingDot && ASSERT.call(this, false, 
    'unexpected ' + (!eof(str, i) ? 'dot (index='+i+')' : 'eof'));

  if (needDot || elem.length > 0)
    list.push(elem);

  var template = new Template(list);
  template.str = (start === 0 && i === str.length) ?
    str :
    str.substring(start, i);

  return template;
};
;
// were it not needed by the AssignmentExpression transform, using a transformer would have been
// limited to the generator bodies; the only reason a transformer is needed as for now
// is that the allocation of temps should be limited to the transform phase -- after all, a
// temp is a variable declaration that had better come at the beginning of a function's body;
// but this is not the reason a transformer is needed for the whole AST -- because a function's declarations
// can well come at its very end.
// a transform on an AssignmentExpression is always needed, but there is a difference between probing a whole AST for
// AssignmentExpressions before any emitting is done, versus converting them as they are encountered during the emit phase;
// the latter is obviously faster, but would not work correctly with things like below:
//
// actual code: [a=l([b]=12)] = 120
// emit-phase transform:
// (transform for [a=l([b]=12), e] = 120) #t = arrIter(120),  a = unornull(#t1 = #t.get()) ? l([b] = 12) : #t1, e = #t.get()
// (transform for [b] = 12) #t = arrIter(12), b = #t.get, #t.val
// (combined) #t = arrIter(120), a = unornull( #t1 = #t.get() ) ? l( #t = arrIter(12), b = #t.get(), #t.val ) : #t1, e = #t.get()
//
// it's evident from the piece above that `[b] = 12` is transformed after `[a=l([b] = 12)] = 120`, the reason being
// the fact that l([b] = 12) is transformed _after_ `[a = l([b] = 12)] = 120` is done getting transformed, due to the way
// transformation works:
//   transform( [a=l([b]=12)]=120 ): #t = arrIter(120), a = unornull(#t1 = #t.get) ? l([b] = 12) : #t1, #t.val
// 
// when the above transform is finished, all temps are released, and the transformed assignment is fed into
// the emitter; when the emitter encounters l([b] = 12),  it reallocate some of the temps previously alloctated, and that is where
// the clash is going to happen.
//
// doing a rigorous transform on all AST nodes, then, is the best bet, until a more lightweight alternative is found.
function Transformer() {
  this.globalScope = null;
  this.scriptScope = null;
  this.currentScope = null;
  this.tempStack = [];
}
;
var CH_1 = char2int('1'),
    CH_2 = char2int('2'),
    CH_3 = char2int('3'),
    CH_4 = char2int('4'),
    CH_5 = char2int('5'),
    CH_6 = char2int('6'),
    CH_7 = char2int('7'),
    CH_8 = char2int('8'),
    CH_9 = char2int('9'),
    CH_0 = char2int('0'),

    CH_a = char2int('a'), CH_A = char2int('A'),
    CH_b = char2int('b'), CH_B = char2int('B'),
    CH_e = char2int('e'), CH_E = char2int('E'),
    CH_g = char2int('g'),
    CH_f = char2int('f'), CH_F = char2int('F'),
    CH_i = char2int('i'),
    CH_m = char2int('m'),
    CH_n = char2int('n'),
    CH_o = char2int('o'), CH_O = char2int('O'),
    CH_r = char2int('r'),
    CH_t = char2int('t'),
    CH_u = char2int('u'), CH_U = char2int('U'),
    CH_v = char2int('v'), CH_X = char2int('X'),
    CH_x = char2int('x'),
    CH_y = char2int('y'),
    CH_z = char2int('z'), CH_Z = char2int('Z'),

    CH_UNDERLINE = char2int('_'),
    CH_$ = char2int('$'),

    CH_TAB = char2int('\t'),
    CH_CARRIAGE_RETURN = char2int('\r'),
    CH_LINE_FEED = char2int('\n'),
    CH_VTAB = char2int('\v'),
    CH_FORM_FEED   = char2int( '\f') ,

    CH_WHITESPACE = char2int(' '),

    CH_BACKTICK = char2int('`'),
    CH_SINGLE_QUOTE = char2int('\''),
    CH_MULTI_QUOTE = char2int('"'),
    CH_BACK_SLASH = char2int(('\\')),

    CH_DIV = char2int('/'),
    CH_MUL = char2int('*'),
    CH_MIN = char2int('-'),
    CH_ADD = char2int('+'),
    CH_AND = char2int('&'),
    CH_XOR = char2int('^'),
    CH_MODULO = char2int('%'),
    CH_OR = char2int('|'),
    CH_EQUALITY_SIGN = char2int('='),

    CH_SEMI = char2int(';'),
    CH_COMMA = char2int(','),
    CH_SINGLEDOT = char2int('.'),
    CH_COLON = char2int((':')),
    CH_QUESTION = char2int('?'),

    CH_EXCLAMATION = char2int('!'),
    CH_COMPLEMENT = char2int('~'),

    CH_ATSIGN = char2int('@'),

    CH_LPAREN = char2int('('),
    CH_RPAREN = char2int(')'),
    CH_LSQBRACKET = char2int('['),
    CH_RSQBRACKET = char2int(']'),
    CH_LCURLY = char2int('{'),
    CH_RCURLY = char2int('}'),
    CH_LESS_THAN = char2int('<'),
    CH_GREATER_THAN = char2int('>')
 ;

var INTBITLEN = (function() {
  var allOnes = ~0;
  var i = 0;
  while (allOnes) {
    allOnes >>>= 1;
    i++;
  }

  return i;
}());


var D_INTBITLEN = 0, M_INTBITLEN = INTBITLEN - 1;
while ( M_INTBITLEN >> (++D_INTBITLEN) );

var PAREN = 'paren';
var PAREN_NODE = PAREN;

var INTERMEDIATE_ASYNC = 'intermediate-async';

var FUNCTION_TYPE = typeof function() {};
var STRING_TYPE = typeof "string";
var NUMBER_TYPE = typeof 0;
var BOOL_TYPE = typeof false;

var OPTIONS =
[
  'ecmaVersion','sourceType','onToken','program',
  'onComment','allowReturnOutsideFunction','allowImportExportEverywhere',
  'sourceFile','directSourceFile',
//'preserveParens',
  'allowHashBang' ];

var HAS = {}.hasOwnProperty;

function ASSERT(cond, message) { if (!cond) throw new Error(message); }

var CTX_NONE = 0,
    CTX_PARAM = 1,
    CTX_FOR = CTX_PARAM << 1,
    CTX_PAT = CTX_FOR << 1,
    CTX_NULLABLE = CTX_PAT << 1,
    CTX_HASPROTO = CTX_NULLABLE << 1,
    CTX_HASPROTOTYPE = CTX_HASPROTO << 1,
    CTX_CTOR_NOT_ALLOWED = CTX_HASPROTOTYPE << 1,
    CTX_DEFAULT = CTX_CTOR_NOT_ALLOWED << 1,
    CTX_HAS_A_PARAM_ERR = CTX_DEFAULT << 1,
    CTX_HAS_AN_ASSIG_ERR = CTX_HAS_A_PARAM_ERR << 1,
    CTX_HAS_A_SIMPLE_ERR = CTX_HAS_AN_ASSIG_ERR << 1,
    CTX_NO_SIMPLE_ERR = CTX_HAS_A_SIMPLE_ERR << 1,
    CTX_ASYNC_NO_NEWLINE_FN = CTX_NO_SIMPLE_ERR << 1,
    CTX_PARPAT = CTX_PARAM|CTX_PAT,
    CTX_PARPAT_ERR = CTX_HAS_A_PARAM_ERR|CTX_HAS_AN_ASSIG_ERR|CTX_HAS_A_SIMPLE_ERR,
    CTX_TOP = CTX_PAT|CTX_NO_SIMPLE_ERR;

var ARGLEN_GET = 0,
    ARGLEN_SET = 1,
    ARGLEN_ANY = -1;

var EC_NONE = 0,
    EC_NEW_HEAD = 1,
    EC_START_STMT = 2,
    EC_EXPR_HEAD = EC_START_STMT << 1,
    EC_CALL_HEAD = EC_EXPR_HEAD << 1,
    EC_NON_SEQ = EC_CALL_HEAD << 1;

;
function y(n) {
  if (n === null)
    return 0;

  var y = yList[n.type].call(n);
  if (y === -1) return 0;
  return y;
}

var yList = {};

function yArray(n) {
  var e = 0, yArray = 0;
  while ( e < n.length )
    yArray += y(n[e++]);

  return yArray;
}

yList['LogicalExpression'] =
yList['AssignmentExpression'] =
yList['BinaryExpression'] =
yList['AssignmentPattern'] =
  function() { return this.y !== -1 ? this.y : this.y = y(this.left) + y(this.right); };
yList['ArrayPattern'] =
yList['ArrayExpression'] =
  function() { return this.y !== -1 ? this.y : this.y = yArray(this.elements); };
yList['ForOfStatement'] =
yList['ForInStatement'] =
  function() { return this.y !== -1 ? this.y : this.y = y(this.right) + y(this.left) + y(this.body); };
yList['DoWhileStatement'] =
  function() { return this.y !== -1 ? this.y : this.y = y(this.test) + y(this.body); };
yList['ForStatement'] =
  function() { return this.y !== -1 ? this.y : this.y = y(this.init) + y(this.test) + y(this.update) + y(this.body); };
yList['IfStatement'] = 
yList['ConditionalExpression'] = 
  function() { return this.y !== -1 ? this.y : this.y = y(this.test) + y(this.consequent) + y(this.alternate); };
yList['CallExpression'] =
yList['NewExpression'] =
  function() { return this.y !== -1 ? this.y : this.y = y(this.callee) + yArray(this.arguments); };
yList['ClassDeclaration'] =
yList['ClassExpression'] =
  function() { return this.y !== -1 ? this.y : this.y = y(this.superClass) + y(this.body); };
yList['CatchClause'] = 
  function() { return this.y !== -1 ? this.y : this.y = y(this.param) + y(this.body); };
yList['BlockStatement'] = 
yList['ClassBody'] =
  function() { return this.y !== -1 ? this.y : this.y = yArray(this.body); };
yList['ThrowStatement'] =
yList['SpreadElement'] =
yList['ReturnStatement'] =
yList['RestElement'] =
yList['UnaryExpression'] =
yList['UpdateExpression'] =
  function() { return y(this.argument); };
yList['ObjectExpression'] =
yList['ObjectPattern'] =
  function() { return this.y !== -1 ? this.y : this.y = yArray(this.properties); };
yList['BreakStatement'] = 
yList['EmptyStatement'] = 
yList['ContinueStatement'] = 
yList['DebuggerStatement'] =
yList['Identifier'] = 
yList['Literal'] = 
yList['FunctionDeclaration'] =
yList['FunctionExpression'] =
yList['ArrowFunctionExpression'] =
yList['ThisExpression'] = 
yList['Super'] =
yList['TemplateElement'] =
  function() { return -1; };
yList['ExportAllDeclaration'] =
yList['ExportDefaultDeclaration'] =
yList['ExportNamedDeclaration'] =
yList['ExportSpecifier'] =
  function() { return -1; };
yList['ExpressionStatement'] =
  function() { return y(this.expression); };
yList['ImportDeclaration'] =
yList['ImportDefaultSpecifier'] =
yList['ImportNamespaceSpecifier'] =
yList['ImportSpecifier'] =
  function() { return -1; };
yList['SwitchCase'] = 
  function() { return this.y !== -1 ? this.y : this.y = y(this.test) + yArray(this.consequent); };
yList['SwitchStatement'] = 
  function() { return this.y !== -1 ? this.y : this.y = y(this.discriminant) + yArray(this.cases); };
yList['LabeledStatement'] =
  function() { return y(this.body); };
yList['MemberExpression'] = 
  function() { return this.y !== -1 ? this.y : this.y = this.computed ? y(this.object) + y(this.property) : y(this.object); };
yList['MetaProperty'] =
  function() { return -1; };
yList['Program'] = yList['BlockStatement']; 

function kv() { return this.y !== -1 ? this.y : this.y = this.computed ? y(this.key) + y(this.value) : y(this.value); }; 

yList['Property'] =
yList['AssignmentProperty'] = kv;
yList['MethodDefinition'] = kv;
yList['SequenceExpression'] = 
yList['TemplateLiteral'] =
  function() { return this.y !== -1 ? this.y : this.y = yArray(this.expressions); };
yList['TaggedTemplateExpression'] =
  function() { return this.y !== -1 ? this.y : this.y = y(this.tag) + y(this.quasi); };
yList['TryStatement'] =
  function() { return this.y !== -1 ? this.y : this.y = y(this.block) + y(this.handler) + y(this.finalizer); };
yList['VariableDeclaration'] =
  function() { return this.y !== -1 ? this.y : this.y = yArray(this.declarations); };
yList['VariableDeclarator'] =
  function() { return this.y !== -1 ? this.y : this.y = y(this.id) + y(this.init); };
yList['WithStatement'] =
  function() { return this.y !== -1 ? this.y : this.y = y(this.object) + y(this.body); }; 
yList['YieldExpression'] = 
  function() { return this.y !== -1 ? this.y : this.y = 1 + y(this.argument); };
yList['WhileStatement'] =
  function() { return this.y !== -1 ? this.y : this.y = y(this.test) + y(this.body); };
;
function isNum(c) {
  return (c >= CH_0 && c <= CH_9);
}

function isIDHead(c) {
  return (
    (c <= CH_z && c >= CH_a) ||
    (c <= CH_Z && c >= CH_A) ||
    c === CH_UNDERLINE ||
    c === CH_$ ||
    (IDS_[c >> D_INTBITLEN] & (1 << (c & M_INTBITLEN)))
  );
}

function isIDBody (c) {
  return (
    (c <= CH_z && c >= CH_a) ||
    (c <= CH_Z && c >= CH_A) ||
    (c <= CH_9 && c >= CH_0) ||
    c === CH_UNDERLINE ||
    c === CH_$ ||
    (IDC_[c >> D_INTBITLEN] & (1 << (c & M_INTBITLEN))) 
  );
}

function isHex(e) {
  return (
    (e >= CH_a && e <= CH_f) ||
    (e >= CH_0 && e <= CH_9) ||
    (e >= CH_A && e <= CH_F)
  );
}
;
function toBody(b) {
  if (b.length > 1)
    return { type: 'BlockStatement', body: b };

  if (b.length === 1)
    return b[0];

  return { type: 'EmptyStatement' };
}

function spreadIdx(array, start) {
  var list = array, i = start;
  while (i < list.length) {
    var elem = list[i];
    if (elem !== null && elem.type === 'SpreadElement')
      return i;
    ++i;
  }
  return -1;
}
;
var ERR_FLAG_LEN = 0;

var ERR_P_SYN = 1 << ERR_FLAG_LEN++,
    ERR_A_SYN = 1 << ERR_FLAG_LEN++,
    ERR_S_SYN = 1 << ERR_FLAG_LEN++,
    ERR_P_SEM = 1 << ERR_FLAG_LEN++,
    ERR_A_SEM = 1 << ERR_FLAG_LEN++,
    ERR_S_SEM = 1 << ERR_FLAG_LEN++,
    ERR_PIN = 1 << ERR_FLAG_LEN, // looks like it need not have any sub-type yet
    ERR_SYN = ERR_P_SYN|ERR_A_SYN|ERR_S_SYN,
    ERR_SEM = ERR_P_SEM|ERR_A_SEM|ERR_S_SEM,
    ERR_I = 0;

function newErr(flags) {
  return (ERR_I++ << ERR_FLAG_LEN)|flags;
}

var ERR_NONE_YET = 0,
    // [([a])] = 12; <p syntactic, a syntactic, s none>
    ERR_PAREN_UNBINDABLE = newErr(ERR_P_SYN|ERR_A_SYN),

    // { a = 12 }; <p none, a none, s syntactic>@pin@
    ERR_SHORTHAND_UNASSIGNED = newErr(ERR_S_SYN|ERR_PIN),

    // [...a, b] = [...e,] = 12 ; <p syntactic, a syntactic, s none>@pin@
    ERR_NON_TAIL_REST = newErr(ERR_P_SYN|ERR_PIN|ERR_A_SYN),

    // [arguments, [arguments=12], [arguments]=12, eval] = 'l'; <p none, a none, s semantic>
    ERR_ARGUMENTS_OR_EVAL_ASSIGNED = newErr(ERR_S_SEM),

    // function* l() { ([e=yield])=>12 }; <p semantic or syntactic, a semantic or syntactic, s none>
    ERR_YIELD_OR_SUPER = newErr(ERR_P_SEM|ERR_A_SEM),

    // (a, ...b); <p none, a none, s syntactic>
    ERR_UNEXPECTED_REST = newErr(ERR_S_SYN),

    // (); <p none, a none, s syntactic>
    ERR_EMPTY_LIST_MISSING_ARROW = newErr(ERR_S_SYN),

    // (a,); <p none, a none, s syntactic>@pin@
    ERR_NON_TAIL_EXPR = newErr(ERR_S_SYN|ERR_PIN),

    // async a
    ERR_INTERMEDIATE_ASYNC = newErr(ERR_S_SYN),

    /* async
       (a)=>12 */
    ERR_ASYNC_NEWLINE_BEFORE_PAREN = newErr(ERR_P_SYN),

    ERR_ARGUMENTS_OR_EVAL_DEFAULT = newErr(ERR_S_SYN),
 
    // function l() { '\12'; 'use strict'; }
    ERR_PIN_OCTAL_IN_STRICT = newErr(ERR_S_SYN|ERR_PIN),

    // for (a i\u0074 e) break;
    ERR_PIN_UNICODE_IN_RESV = newErr(ERR_S_SYN|ERR_PIN),

    // [ a -= 12 ] = 12; <p syntactic, a syntactic, s none>@pin@
    ERR_PIN_NOT_AN_EQ = newErr(ERR_S_SYN|ERR_PIN);

// if a new error is a syntactic error, and the current error is a semantic one, then replace
function agtb(a, b) {
  return (a & ERR_SYN) ?
    (b & ERR_SYN) === 0 :
    false;
}

// TODO: choose a more descriptive name
var NORMALIZE_COMMON = ['li0', 'c0', 'col0', 'li', 'c', 'col', 'loc0', 'loc'];
;
var Emitters = {};
var UntransformedEmitters = {};
var transform = {};
;
var VDT_VOID = 1;
var VDT_TYPEOF = 2;
var VDT_NONE = 0;
var VDT_DELETE = 4;
var VDT_AWAIT = 8;

var TK_NONE = 0;
var TK_EOF = 1 << 8;
var TK_NUM = TK_EOF << 1;
var TK_ID = TK_NUM << 1;
var TK_SIMP_ASSIG = TK_ID << 1;
var TK_UNARY = TK_SIMP_ASSIG << 1;
var TK_SIMP_BINARY = TK_UNARY << 1;
var TK_AA_MM = TK_SIMP_BINARY << 1;
var TK_OP_ASSIG = TK_AA_MM << 1;
var TK_YIELD = TK_OP_ASSIG << 1;
var TK_DIV = TK_YIELD << 1;
var TK_UNBIN = TK_SIMP_BINARY|TK_UNARY;
var TK_ANY_ASSIG = TK_SIMP_ASSIG|TK_OP_ASSIG;
var TK_ANY_BINARY = TK_SIMP_BINARY|TK_ANY_ASSIG;

var PREC_NONE = 0; // [<start>]
var PREC_COMMA = nextl(PREC_NONE); // ,
var PREC_ASSIG = nextr(PREC_COMMA); // =, [<op>]=
var PREC_COND = nextl(PREC_ASSIG); // ?:
var PREC_LOG_OR = nextl(PREC_COND); // ||
var PREC_LOG_AND = nextl(PREC_LOG_OR); // &&
var PREC_BIT_OR = nextl(PREC_LOG_AND); // |
var PREC_BIT_XOR = nextl(PREC_BIT_OR); // ^
var PREC_BIT_AND = nextl(PREC_BIT_XOR); // &
var PREC_EQ = nextl(PREC_BIT_AND); // !=, ===, ==, !==
var PREC_COMP = nextl(PREC_EQ); // >, <=, <, >=, instanceof, in
var PREC_SH = nextl(PREC_COMP); // >>>, >>, <<
var PREC_ADD = nextl(PREC_SH); // +, -
var PREC_MUL = nextl(PREC_ADD); // *, /
var PREC_EX = nextl(PREC_MUL); // **
var PREC_UNARY = nextr(PREC_EX); // delete, void, -, +, typeof; not really a right-associative thing
var PREC_UP = nextr(PREC_UNARY); // ++, --; not really a right-associative thing

var FL_HEADLESS_FLOAT = 0,
    FL_SIMPLE_FLOAT = 1,
    FL_GET_E = 2;

function isLA(nPrec) { return !isRA(nPrec); }
function nextl(nPrec) { return (nPrec&1) ? nPrec + 1 : nPrec + 2; }
function nextr(nPrec) { return (nPrec&1) ? nPrec + 2 : nPrec + 1; }
function isLog(nPrec) {
  switch (nPrec) {
  case PREC_LOG_AND:
  case PREC_LOR_OR:
    return true;
  }
  return false;
}
function isRA(nPrec) { return nPrec&1; }
;
function isArguments(mname) {
  return mname === RS_ARGUMENTS;
}

function isSupCall(mname) {
  return mname === RS_SCALL;
}

function isSupMem(mname) {
  return mname === RS_SMEM;
}

function isNewTarget(mname) {
  return mname === RS_NTARGET;
}

function isThis(mname) {
  return mname === RS_THIS;
}
;
var ST_GLOBAL = 1,
    ST_MODULE = ST_GLOBAL << 1,
    ST_SCRIPT = ST_MODULE << 1,
    ST_EXPR = ST_SCRIPT << 1,
    ST_DECL = ST_EXPR << 1,
    ST_OBJ = ST_DECL << 1,
    ST_FN = ST_OBJ << 1,
    ST_CLS = ST_FN << 1,
    ST_CLSMEM = ST_CLS << 1,
    ST_STATICMEM = ST_CLSMEM << 1,
    ST_OBJMEM = ST_STATICMEM << 1,
    ST_METH = ST_OBJMEM << 1,
    ST_CTOR = ST_METH << 1,
    ST_SETTER = ST_CTOR << 1,
    ST_GETTER = ST_SETTER << 1,
    ST_ARROW = ST_GETTER << 1,
    ST_GEN = ST_ARROW << 1,
    ST_ASYNC = ST_GEN << 1,
    ST_BLOCK = ST_ASYNC << 1,
    ST_BARE = ST_BLOCK << 1,
    ST_CATCH = ST_BARE << 1,
    ST_PAREN = ST_CATCH << 1,
    ST_NONE = 0;

var SA_THROW = 1,
    SA_AWAIT = SA_THROW << 1,
    SA_BREAK = SA_AWAIT << 1,
    SA_YIELD = SA_BREAK << 1,
    SA_RETURN = SA_YIELD << 1,
    SA_CONTINUE = SA_RETURN << 1,
    SA_CALLSUPER = SA_CONTINUE << 1,
    SA_MEMSUPER = SA_CALLSUPER << 1,
    SA_NONE = 0;

var SF_LOOP = 1,
    SF_UNIQUE = SF_LOOP << 1,
    SF_STRICT = SF_UNIQUE << 1,
    SF_ARGS = SF_STRICT << 1,
    SF_IF = SF_ARGS << 1,
    SF_COND = SF_IF << 1,
    SF_FORINIT = SF_COND << 1,
    SF_WITH_SCALL = SF_FORINIT << 1,
    SF_WITH_SMEM = SF_WITH_SCALL << 1,
    SF_INSIDEPROLOGUE = SF_WITH_SMEM << 1,
    SF_NONE = 0;

var DT_CLS = 1,
    DT_FN = DT_CLS << 1,
    DT_CONST = DT_FN << 1,
    DT_VAR = DT_CONST << 1,
    DT_CATCHARG = DT_VAR << 1,
    DT_SPECIAL = DT_CATCHARG << 1,
    DT_LIQUID = DT_SPECIAL << 1,
    DT_LET = DT_LIQUID << 1,
    DT_ARGUMENTS = DT_LET << 1,
    DT_FNARG = DT_ARGUMENTS << 1,
    DT_CLSNAME = DT_FNARG << 1,
    DT_FNNAME = DT_CLSNAME << 1,
    DT_GLOBAL = DT_FNNAME << 1,
    DT_INFERRED = DT_GLOBAL << 1,
    DT_NONE = 0;
;
function _m(name) { return name+'%'; }
function _u(name) {
  ASSERT.call(this, name.charCodeAt(name.length-1) === CH_MODULO,
    'only mangled names are allowed to get unmangled');
  return name.substring(0, name.length-1);
}
function _full(nameSpace, name) { return nameSpace+':'+name; }
;
var IDS_ = fromRunLenCodes([0,8472,1,21,1,3948,2],
 fromRunLenCodes([0,65,26,6,26,47,1,10,1,4,1,5,23,1,31,1,458,4,12,14,5,7,1,1,1,129,
5,1,2,2,4,1,1,6,1,1,3,1,1,1,20,1,83,1,139,8,166,1,38,2,1,7,39,72,27,5,3,45,43,35,2,
1,99,1,1,15,2,7,2,10,3,2,1,16,1,1,30,29,89,11,1,24,33,9,2,4,1,5,22,4,1,9,1,3,1,23,
25,71,21,79,54,3,1,18,1,7,10,15,16,4,8,2,2,2,22,1,7,1,1,3,4,3,1,16,1,13,2,1,3,14,2,
19,6,4,2,2,22,1,7,1,2,1,2,1,2,31,4,1,1,19,3,16,9,1,3,1,22,1,7,1,2,1,5,3,1,18,1,15,
2,23,1,11,8,2,2,2,22,1,7,1,2,1,5,3,1,30,2,1,3,15,1,17,1,1,6,3,3,1,4,3,2,1,1,1,2,3,
2,3,3,3,12,22,1,52,8,1,3,1,23,1,16,3,1,26,3,5,2,35,8,1,3,1,23,1,10,1,5,3,1,32,1,1,
2,15,2,18,8,1,3,1,41,2,1,16,1,16,3,24,6,5,18,3,24,1,9,1,1,2,7,58,48,1,2,12,7,58,2,
1,1,2,2,1,1,2,1,6,4,1,7,1,3,1,1,1,1,2,2,1,4,1,2,9,1,2,5,1,1,21,4,32,1,63,8,1,36,27,
5,115,43,20,1,16,6,4,4,3,1,3,2,7,3,4,13,12,1,17,38,1,1,5,1,2,43,1,333,1,4,2,7,1,1,
1,4,2,41,1,4,2,33,1,4,2,7,1,1,1,4,2,15,1,57,1,4,2,67,37,16,16,86,2,6,3,620,2,17,1,
26,5,75,3,11,7,13,1,4,14,18,14,18,14,13,1,3,15,52,35,1,4,1,67,88,8,41,1,1,5,70,10,
31,49,30,2,5,11,44,4,26,54,23,9,53,82,1,93,47,17,7,55,30,13,2,10,44,26,36,41,3,10,
36,107,4,1,4,3,2,9,192,64,278,2,6,2,38,2,6,2,8,1,1,1,1,1,1,1,31,2,53,1,7,1,1,3,3,1,
7,3,4,2,6,4,13,5,3,1,7,116,1,13,1,16,13,101,1,4,1,2,10,1,1,2,6,6,1,1,1,1,1,1,16,2,
4,5,5,4,1,17,41,2679,47,1,47,1,133,6,4,3,2,12,38,1,1,5,1,2,56,7,1,16,23,9,7,1,7,1,
7,1,7,1,7,1,7,1,7,1,7,550,3,25,9,7,5,2,5,4,86,4,5,1,90,1,4,5,41,3,94,17,27,53,16,512,
6582,74,20950,42,1165,67,46,2,269,3,16,10,2,20,47,16,31,2,80,39,9,2,103,2,35,2,8,63,
11,1,3,1,4,1,23,29,52,14,50,62,6,3,1,1,1,12,28,10,23,25,29,7,47,28,1,16,5,1,10,10,
5,1,41,23,3,1,8,20,23,3,1,3,50,1,1,3,2,2,5,2,1,1,1,24,3,2,11,7,3,12,6,2,6,2,6,9,7,
1,7,1,43,1,10,10,115,29,11172,12,23,4,49,8452,366,2,106,38,7,12,5,5,1,1,10,1,13,1,
5,1,1,1,2,1,2,1,108,33,363,18,64,2,54,40,12,116,5,1,135,36,26,6,26,11,89,3,6,2,6,2,
6,2,3,35,12,1,26,1,19,1,2,1,15,2,14,34,123,69,53,267,29,3,49,47,32,16,27,5,38,10,30,
2,36,4,8,1,5,42,158,98,40,8,52,156,311,9,22,10,8,152,6,2,1,1,44,1,2,3,1,2,23,10,23,
9,31,65,19,1,2,10,22,10,26,70,56,6,2,64,1,15,4,1,3,1,27,44,29,3,29,35,8,1,28,27,54,
10,22,10,19,13,18,110,73,55,51,13,51,784,53,75,45,32,25,26,36,41,35,3,1,12,48,14,4,
21,1,1,1,35,18,1,25,84,7,1,1,1,4,1,15,1,10,7,47,38,8,2,2,2,22,1,7,1,2,1,5,3,1,18,1,
12,5,286,48,20,2,1,1,184,47,41,4,36,48,20,1,59,43,85,26,390,64,31,1,448,57,1287,922,
102,111,17,196,2748,1071,4049,583,8633,569,7,31,113,30,18,48,16,4,31,21,5,19,880,69,
11,1,66,13,16480,2,3070,107,5,13,3,9,7,10,5990,85,1,71,1,2,2,1,2,2,2,4,1,12,1,1,1,
7,1,65,1,4,2,8,1,7,1,28,1,4,1,5,1,1,3,7,1,340,2,25,1,25,1,31,1,25,1,31,1,25,1,31,1,
25,1,31,1,25,1,8,4148,197,1339,4,1,27,1,2,1,1,2,1,1,10,1,4,1,1,1,1,6,1,4,1,1,1,1,1,
1,3,1,2,1,1,2,1,1,1,1,1,1,1,1,1,1,2,1,1,2,4,1,7,1,4,1,4,1,1,1,10,1,17,5,3,1,5,1,17,
4420,42711,41,4149,11,222,2,5762,10590,542]));

var IDC_ = fromRunLenCodes([0,183,1,719,1,4065,9,1640,1],fromRunLenCodes ( ( [ 0 ,
48,10,7,26,4,1,1,26,47,1,10,1,1,1,2,1,5,23,1,31,1,458,4,12,14,5,7,1,1,1,17,117,1,2,
2,4,1,1,6,5,1,1,1,20,1,83,1,139,1,5,2,166,1,38,2,1,7,39,9,45,1,1,1,2,1,2,1,1,8,27,
5,3,29,11,5,74,4,102,1,8,2,10,1,19,2,1,16,59,2,101,14,54,4,1,5,46,18,28,68,21,46,129,
2,10,1,19,1,8,2,2,2,22,1,7,1,1,3,4,2,9,2,2,2,4,8,1,4,2,1,5,2,12,15,3,1,6,4,2,2,22,
1,7,1,2,1,2,1,2,2,1,1,5,4,2,2,3,3,1,7,4,1,1,7,16,11,3,1,9,1,3,1,22,1,7,1,2,1,5,2,10,
1,3,1,3,2,1,15,4,2,10,9,1,7,3,1,8,2,2,2,22,1,7,1,2,1,5,2,9,2,2,2,3,8,2,4,2,1,5,2,10,
1,1,16,2,1,6,3,3,1,4,3,2,1,1,1,2,3,2,3,3,3,12,4,5,3,3,1,4,2,1,6,1,14,10,16,4,1,8,1,
3,1,23,1,16,3,8,1,3,1,4,7,2,1,3,5,4,2,10,17,3,1,8,1,3,1,23,1,10,1,5,2,9,1,3,1,4,7,
2,7,1,1,4,2,10,1,2,14,3,1,8,1,3,1,41,2,8,1,3,1,5,8,1,7,5,2,10,10,6,2,2,1,18,3,24,1,
9,1,1,2,7,3,1,4,6,1,1,1,8,6,10,2,2,13,58,5,15,1,10,39,2,1,1,2,2,1,1,2,1,6,4,1,7,1,
3,1,1,1,1,2,2,1,13,1,3,2,5,1,1,1,6,2,10,2,4,32,1,23,2,6,10,11,1,1,1,1,1,4,10,1,36,
4,20,1,18,1,36,9,1,57,74,6,78,2,38,1,1,5,1,2,43,1,333,1,4,2,7,1,1,1,4,2,41,1,4,2,33,
1,4,2,7,1,1,1,4,2,15,1,57,1,4,2,67,2,3,9,9,14,16,16,86,2,6,3,620,2,17,1,26,5,75,3,
11,7,13,1,7,11,21,11,20,12,13,1,3,1,2,12,84,3,1,4,2,2,10,33,3,2,10,6,88,8,43,5,70,
10,31,1,12,4,12,10,40,2,5,11,44,4,26,6,11,37,28,4,63,1,29,2,11,6,10,13,1,8,14,66,76,
4,10,17,9,12,116,12,56,8,10,3,49,82,3,1,35,1,2,6,246,6,282,2,6,2,38,2,6,2,8,1,1,1,
1,1,1,1,31,2,53,1,7,1,1,3,3,1,7,3,4,2,6,4,13,5,3,1,7,66,2,19,1,28,1,13,1,16,13,51,
13,4,1,3,12,17,1,4,1,2,10,1,1,2,6,6,1,1,1,1,1,1,16,2,4,5,5,4,1,17,41,2679,47,1,47,
1,133,6,9,12,38,1,1,5,1,2,56,7,1,15,24,9,7,1,7,1,7,1,7,1,7,1,7,1,7,1,7,1,32,517,3,
25,15,1,5,2,5,4,86,2,7,1,90,1,4,5,41,3,94,17,27,53,16,512,6582,74,20950,42,1165,67,
46,2,269,3,28,20,48,4,10,1,115,37,9,2,103,2,35,2,8,63,49,24,52,12,69,11,10,6,24,3,
1,1,1,2,46,2,36,12,29,3,65,14,11,6,31,1,55,9,14,2,10,6,23,3,73,24,3,2,16,2,5,10,6,
2,6,2,6,9,7,1,7,1,43,1,10,10,123,1,2,2,10,6,11172,12,23,4,49,8452,366,2,106,38,7,12,
5,5,12,1,13,1,5,1,1,1,2,1,2,1,108,33,363,18,64,2,54,40,12,4,16,16,16,3,2,24,3,32,5,
1,135,19,10,7,26,4,1,1,26,11,89,3,6,2,6,2,6,2,3,35,12,1,26,1,19,1,2,1,15,2,14,34,123,
69,53,136,1,130,29,3,49,15,1,31,32,16,27,5,43,5,30,2,36,4,8,1,5,42,158,2,10,86,40,
8,52,156,311,9,22,10,8,152,6,2,1,1,44,1,2,3,1,2,23,10,23,9,31,65,19,1,2,10,22,10,26,
70,56,6,2,64,4,1,2,5,8,1,3,1,27,4,3,4,1,32,29,3,29,35,8,1,30,25,54,10,22,10,19,13,
18,110,73,55,51,13,51,781,71,31,10,15,60,21,25,7,10,6,53,1,10,16,36,2,1,9,69,5,3,3,
11,1,1,35,18,1,37,72,7,1,1,1,4,1,15,1,10,7,59,5,10,6,4,1,8,2,2,2,22,1,7,1,2,1,5,2,
9,2,2,2,3,2,1,6,1,5,7,2,7,3,5,267,70,1,1,8,10,166,54,2,9,23,6,34,65,3,1,11,10,38,56,
8,10,54,26,3,15,4,10,358,74,21,1,448,57,1287,922,102,111,17,196,2748,1071,4049,583,
8633,569,7,31,1,10,102,30,2,5,11,55,9,4,12,10,9,21,5,19,880,69,11,47,16,17,16480,2,
3070,107,5,13,3,9,7,10,3,2,5318,5,3,6,8,8,2,7,30,4,148,3,443,85,1,71,1,2,2,1,2,2,2,
4,1,12,1,1,1,7,1,65,1,4,2,8,1,7,1,28,1,4,1,5,1,1,3,7,1,340,2,25,1,25,1,31,1,25,1,31,
1,25,1,31,1,25,1,31,1,25,1,8,2,50,512,55,4,50,8,1,14,1,22,5,1,15,3408,197,11,7,1321,
4,1,27,1,2,1,1,2,1,1,10,1,4,1,1,1,1,6,1,4,1,1,1,1,1,1,3,1,2,1,1,2,1,1,1,1,1,1,1,1,
1,1,2,1,1,2,4,1,7,1,4,1,4,1,1,1,10,1,17,5,3,1,5,1,17,4420,42711,41,4149,11,222,2,5762,
10590,542,722658,240 ]) ) )  ;

function set(bits, i) {
  bits[i>>D_INTBITLEN] |= ( 1 << ( i & M_INTBITLEN ) );

}

set(IDC_,0x200C);
set(IDC_,0x200D);


;

function char2int(c) { return c.charCodeAt(0); }
var hexD = [ '1', '2', '3', '4', '5',
             '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f' ];
hexD = ['0'].concat(hexD);

function hex(number) {
  var str = "";
  str = hexD[number&0xf] + str
  str = hexD[(number>>=4)&0xf] + str ;
  str = hexD[(number>>=4)&0xf] + str ;
  str = hexD[(number>>=4)&0xf] + str ;
  
  return str;
}

function hex2(number) {
  var str = "";
  str = hexD[number&0xf] + str
  str = hexD[(number>>=4)&0xf] + str ;
  
  return str;
}

function fromRunLenCodes(runLenArray, bitm) {
  bitm = bitm || [];
  var bit = runLenArray[0];
  var runLenIdx = 1, bitIdx = 0;
  var runLen = 0;
  while (runLenIdx < runLenArray.length) {
    runLen = runLenArray[runLenIdx];
    while (runLen--) {
      while ((INTBITLEN * (bitm.length)) < bitIdx) bitm.push(0);
      if (bit) bitm[bitIdx >> D_INTBITLEN] |= (1 << (M_INTBITLEN & bitIdx));
      bitIdx++ ;
    }
    runLenIdx++ ;
    bit ^= 1;
  }
  return (bitm);
}

function arguments_or_eval(l) {
  switch ( l ) {
     case 'arguments':
     case 'eval':
       return true;
  }

  return false;
};

function cp2sp(codePoint )  {
  if ( codePoint <= 0xFFFF)
    return String.fromCharCode(codePoint) ;

  return String.fromCharCode(
    ((codePoint-0x10000 )>>10)+0x0D800,
    ((codePoint-0x10000 )&(1024-1))+0x0DC00
  );
}

function core(n) { return n.type === PAREN ? n.expr : n; };

function hex2num(n) {
  return (n >= CH_0 && n <= CH_9) ? n - CH_0 :
         (n <= CH_f && n >= CH_a) ? 10 + n - CH_a :
         (n >= CH_A && n <= CH_F) ? 10 + n - CH_A : -1;
}

function createObj(baseObj) {
  function E() {} E.prototype = baseObj;
  return new E();
}

function needsConstCheck(n) {
  return n.type === '#ResolvedName' && n.constCheck;
}

function octStr2num(octStr) {
  var v = 0, e = 0;
  while (e < octStr.length)
    v = (v<<3)|(octStr.charCodeAt(e++)-CH_0);
  return v;
}

function surrogate(ch1, ch2) {
  return ((ch1-0x0d800)<<10)+(ch2-0x0dc00)+0x010000;
}

function isDirective(n) {
  return (
    n.type === 'Literal' &&
    typeof(n.value) === STRING_TYPE
  );
}
;
 (function(){
       var i = 0;
       while(i < this.length){
          var def = this[i++];
          if ( !def ) continue;
          var e = 0;
          while ( e < def[1].length )
             def[1][e++].call(def[0]);
       }
     }).call([
null,
null,
null,
null,
[Emitter.prototype, [function(){
this.indent = function() {
  this.indentLevel++; 
};

this.i = function() {
  this.indent();
  return this; 
};

this.l = function() {
  this.startLine();
  return this; 
};

this.emitHead =
function(n, isStmt, flags) {
  return this.emitAny(n, isStmt, flags|EC_EXPR_HEAD|EC_NON_SEQ);
};

this.eH = function(n, isStmt, flags) {
  this.emitHead(n, isStmt, flags);
  return this;
};

this.emitAny = function(n, isStmt, startStmt) {
  if (HAS.call(Emitters, n.type))
    return Emitters[n.type].call(this, n, isStmt, startStmt);
  this.err('unknow.node');
};

this.eA = function(n, isStmt, startStmt) {
  this.emitAny(n, isStmt, startStmt); 
  return this; 
};

this.emitNonSeq = function(n, isStmt, flags) {
  this.emitAny(n, isStmt, flags|EC_NON_SEQ);
};

this.eN = function(n, isStmt, flags) {
  this.emitNonSeq(n, isStmt, flags);
  return this;
};

this.write = function(rawStr) {
  ASSERT.call(this, rawStr !== "",
    'not allowed to write empty strings to output');

  if (this.lineStarted) {
    this.code += this.getOrCreateIndent(this.indentLevel);
    this.lineStarted = false;
  }
  this.code += rawStr;
};

this.w = function(rawStr) {
  ASSERT.call(this, arguments.length === 1,
    'one argument was expected but got '+arguments.length);

  this.write(rawStr);
  return this;
};

this.space = function() {
  if (this.lineStarted)
    this.err('useless.space');

  this.write(' ');
};

this.s = function() {
  this.space();
  return this;
};

this.writeMulti =
this.wm = function() {
  var i = 0;
  while (i < arguments.length) {
    var str = arguments[i++];
    if (str === ' ')
      this.space();
    else
      this.write(str);
  }

  return this;
};

this.unindent = function() {
  if (this.indentLevel <= 0)
    this.err('unindent.nowidth');

  this.indentLevel--;
};

this.u = function() {
  this.unindent();
  return this;
};

this.getOrCreateIndent = function(indentLen) {
  var cache = this.indentCache;
  if (indentLen >= cache.length) {
    if (indentLen !== cache.length)
      this.err('inceremental.indent');
    cache.push(cache[cache.length-1] + this.spaceString);
  }
  return cache[indentLen];
};

this.startLine = function() {
  this.insertNL();
  this.lineStarted = true;
};

this.insertNL = function() {
  this.code += '\n';
};

this.noWrap = function() {
  this.noWrap_ = true;
  return this;
};

this.jz = function(name) {
  return this.wm('jz','.',name);
};

this.emitCallHead = function(n, isStmt, flags) {
  return this.eH(n, isStmt, flags|EC_CALL_HEAD);
};

this.emitNewHead = function(n, isStmt, flags) {
  return this.eH(n, isStmt, flags|EC_NEW_HEAD);
};

},
function(){
Emitters['UpdateExpression'] = function(n, isStmt, flags) {
  var paren = flags & EC_EXPR_HEAD;
  var cc = needsConstCheck(n.argument);
  if (!paren) { paren = cc; }
  if (paren) { this.w('('); flags = EC_NONE; }

  cc && this.jz('cc').wm('(','\'')
    .writeStrWithVal(n.argument.name).wm('\'',')',',').s();

  var o = n.operator;
  if (n.prefix) {
    if (this.code.charCodeAt(this.code.length-1) === o.charCodeAt(0))
      this.s();
    this.w(o).eH(n.argument, false, EC_NONE);
  } else
    this.eH(n.argument, false, flags).w(o);

  paren && this.w(')');
};

},
function(){
Emitters['ArrayExpression'] = function(n, isStmt, flags) {
  var list = n.elements, i = 0;
  var si = spreadIdx(list, 0);
  if (si !== -1)
    return this.emitArrayWithSpread(list, flags, si);

  this.w('[');
  this.emitArrayChunk(list, 0, list.length-1);
  this.w(']');
};

this.emitArrayWithSpread = function(list, flags, si) {
  var paren = flags & EC_NEW_HEAD;
  if (paren) this.w('(');
  this.wm('jz','.','concat','(')
  var startChunk = 0;
  while (si !== -1) {
    if (startChunk > 0)
      this.wm(',',' ');
    if (si > startChunk) {
      this.w('[');
      this.emitArrayChunk(list, startChunk, si-1);
      this.wm(']',',',' ');
    }
    this.eN(list[si].argument);
    startChunk = si + 1;
    si = spreadIdx(list, startChunk);
  }
  if (startChunk < list.length) {
    if (startChunk > 0) this.wm(',',' ');
    this.w('[').emitArrayChunk(list, startChunk, list.length-1); 
    this.w(']');
  }
  this.w(')');
  if (paren) this.w(')');
};

this.emitArrayChunk = function(list, from, to) {
  var i = from;
  while (i <= to) {
    if (i !== from) this.wm(',',' ');
    var elem = list[i];
    if (elem === null) this.w('void 0');
    else this.eN(elem, PREC_NONE, EC_NONE);
    i++;
  }
};

},
function(){
Emitters['#SubAssig'] =
Emitters['AssignmentExpression'] =
this.emitAssig = function(n, isStmt, flags) {
  var paren = flags & EC_EXPR_HEAD;
  var cc = needsConstCheck(n.left);
  if (!paren) { paren = cc; }
  if (paren) { this.w('('); flags = EC_NONE; }
  if (cc)
    this.jz('cc').w('(')
        .w('\'').writeStrWithVal(n.left.name).w('\'')
        .w(')')
        .w(',')
        .s();

  this.emitAssigLeft(n.left, flags);
  this.wm(' ',n.operator,' ');
  this.emitAssigRight(n.right);

  paren && this.w(')');
  isStmt && this.w(';');
};

this.emitAssigLeft = function(n, flags) {
  return this.emitHead(n, false, flags);
};

this.emitAssigRight = function(n) {
  this.eN(n, false, EC_NONE);
};

},
function(){
Emitters['BinaryExpression'] =
Emitters['LogicalExpression'] =
this.emitBinary = function(n, prec, flags) {
  var paren = flags & EC_EXPR_HEAD;
  if (paren) { this.w('('); flags = EC_NONE; }
  var o = n.operator;
  if (o === '**')
    return this.emitPow(n, flags);

  var left = n.left,
      right = n.right;

  if (isBinaryExpression(left))
    this.emitLeft(left, o, flags);
  else this.emitBinaryExpressionComponent(left, flags);

  this.s().w(o).s();

  if (isBinaryExpression(right))
    this.emitRight(right, o, EC_NONE);
  else this.emitBinaryExpressionComponent(right, EC_NONE);

  paren && this.w(')');
};

function isBinaryExpression(n) {
  switch (n.type) {
  case 'BinaryExpression':
  case 'LogicalExpression':
    return true;
  default:
    return false;
  }
}

this.emitBinaryExpressionComponent = function(n, flags) {
  if (n.type === 'UnaryExpression' || n.type === 'UpdateExpression')
    return this.emitAny(n, false, flags);
    
  return this.emitHead(n, false, flags);
};

this.emitRight = function(n, ownerO, flags) {
  var childO = n.operator, paren = false;

  // previous op has higher prec because it has higher prec
  if (bp(childO) < bp(ownerO))
    paren = true;

  // previous op has higher prec because it is the previous op
  else if (bp(childO) === bp(ownerO))
    paren = isLeftAssoc(ownerO);

  if (!paren) { paren = flags & EC_EXPR_HEAD; }

  if (paren) { flags = EC_NONE; this.w('('); }
  this.emitBinary(n, PREC_NONE, flags);
  if (paren) this.w(')');
};

this.emitLeft = function(n, childO, flags) {
  var ownerO = n.operator, paren = false;
  
  if (bp(childO) > bp(ownerO))
    paren = true;
  else if (bp(childO) === bp(ownerO))
    paren = isRightAssoc(childO);

  if (paren) { flags = EC_NONE; this.w('('); }
  this.emitBinary(n, PREC_NONE, flags);
  if (paren) this.w(')');
};

this.emitPow = function(n, flags) {
  var paren = flags & EC_NEW_HEAD;
  if (paren) this.w('(');
  this.wm('jz','.','e','(')
      .eN(n.left, PREC_NONE, EC_NONE)
      .wm(',',' ')
      .eN(n.right, PREC_NONE, EC_NONE)
      .w(')');
  if (paren) this.w(')');
};

},
function(){
this.emitDependentStmt = function(n, isElse) {
  if (n.type === 'BlockStatement')
    this.s().emitBlock(n, PREC_NONE, EC_NONE);
  else if (isElse && n.type === 'IfStatement')
    this.s().emitIf(n);
  else
    this.i().l().eA(n, PREC_NONE, EC_NONE).u();
};

Emitters['BlockStatement'] =
this.emitBlock = function(n, prec, flags) {
  this.w('{');
  var list = n.body;
  if (list.length > 0 || n.scope.defs.length()) {
    this.i();
    if (n.scope.defs.length())
      this.l().emitLexicalBindings(n.scope, false);

    var i = 0;
    while (i < list.length) {
      this.l().emitAny(list[i], true, EC_START_STMT);
      i++;
    }
    this.u().l();
  }
  this.w('}');
};

},
function(){
Emitters['CallExpression'] = function(n, prec, flags) {
  var ri = spreadIdx(n.arguments, 0); 
  if (ri !== -1)
    return this.emitCallWithSpread(n, flags, ri);
  
  var paren = flags & EC_NEW_HEAD;
  if (paren) {
    flags = EC_NONE;
    this.w('(');
  }

  this.eH(n.callee, false, flags|EC_CALL_HEAD);
  this.w('(');
  this.emitArrayChunk(n.arguments, 0, n.arguments.length-1);
  this.w(')');

  if (paren) this.w(')');
};

this.emitCallWithSpread =
function(n, flags, ri) {
  var paren = flags & EC_NEW_HEAD;
  if (paren) {
    flags = EC_NONE;
    this.w('(');
  }

  var c = n.callee;
  if (c.type === 'MemberExpression') {
    this.jz('meth').w('(')
        .jz('b').w('(')
        .eN(c.object, PREC_NONE, EC_NONE)
        .wm(',',' ');
    if (c.computed)
      this.eN(c.property, PREC_NONE, EC_NONE);
    else 
      this.emitStringLiteralWithRawValue("'"+c.property.name+"'");
    this.w(')');
  } else {
    this.wm('jz','.','call','(')
        .eN(c, PREC_NONE, EC_NONE);
  }
  this.wm(',',' ')
      .emitArrayWithSpread(n.arguments, EC_NONE, ri);
  this.w(')');
  if (paren) this.w(')');
};  


},
function(){
Emitters['ClassExpression'] = 
Emitters['ClassDeclaration'] = function(n, prec, flags) {
  this.w('[:<'+n.type+'>:]');
};

},
function(){
Emitters['ConditionalExpression'] = function(n, isStmt, flags) {
  var paren = flags & EC_EXPR_HEAD;
  if (paren) { this.w('('); flags = EC_NONE; }
  this.emitCondTest(n.test, flags);
  this.wm(' ','?',' ').eN(n.consequent, false, EC_NONE);
  this.wm(' ',':',' ').eN(n.alternate, false, EC_NONE);
  paren && this.w(')');
};

this.emitCondTest = function(n, prec, flags) {
  var paren = false;
  switch (n.type) {
  case 'AssignmentExpression':
  case 'ConditionalExpression':
    paren = true;
  }

  if (paren) { this.w('('); flags = EC_NONE; }
  this.eN(n, false, flags);
  if (paren) this.w(')');
};

},
function(){
Emitters['VariableDeclaration'] = function(n, prec, flags) { return; };

},
function(){
this.emitDefs = function(defs) {
  var len = defs.length(), i = 0;
  this.w('var').s();
  while (i < len) {
    i && this.w(',').s();
    var elem = defs.at(i++);
    this.w(elem.synthName);
    if (elem.isLexical() && elem.ref.scope.insideLoop() && elem.ref.indirect)
      this.wm(' ','=',' ','{','v',':',' ','void',' ','0','}');
  }
  this.w(';');
};

},
function(){
Emitters['DoWhileStatement'] = function(n, prec, flags) {
  this.w('do').emitDependentStmt(n.body);
  if (n.body.type !== 'BlockStatement')
    this.l();
  this.wm('while',' ','(').eA(n.test, false, EC_NONE).w(')');
};

},
function(){
this.emitTopLevelBindings = function(scope, needsNL) {
  var emitted = false;
  ASSERT.call(this, scope.isScript() || scope.isModule(),
    'a script or module was actually expected but got <'+scope.typeString()+'>');
  var list = scope.funcDecls, i = 0, len = list.length(), elem = null;
  while (i < len) {
    if (i === 0 && needsNL) { this.l(); needsNL = false }
    else if (i > 0) this.l();
    this.emitTopLevelFnList(list.at(i++));
  }
    
  needsNL = emitted = len > 0;

  list = scope.defs,
  i = 0,
  len = list.length(),
  elem = null;
  var b = 0;

  while (i < len) {
    elem = list.at(i++);
    if (elem.isVName()) {
      if (b === 0) {
        if (needsNL) { this.l(); needsNL = false; }
        this.w('var').s();
      }
      else this.w(',').s();
      this.w(elem.synthName);
      b++;
    }
  }
  b && this.w(';');
  return emitted || b !== 0;
}; 

this.emitTopLevelFnList = function(fnList) {
  var i = 0;
  while (i < fnList.length) {
    i && this.l();
    this.emitTopLevelFn(fnList[i], i === 0);
    i++;
  }
};

this.emitTopLevelFn = function(n, isFirst) {
  var fn = n.fn, decl = n.decl, hasVar = false;
  if (decl.name !== decl.synthName && isFirst) {
    hasVar = true;
    isFirst = false;
  }
  if (isFirst)
    this.emitRawFn(fn, decl.name);
  else {
    hasVar && this.wm('var',' ');
    this.w(decl.synthName)
      .wm(' ','=',' ')
      .emitRawFn(fn, decl.name);
    this.w(';');
  }
};

this.emitLexicalBindings = function(scope, needsNL) {
  var list = scope.defs, i = 0, len = list.length(), elem = null, b = 0;
  while (i < len) {
    elem = list.at(i++);
    if (!scope.ownsDecl(elem) || !elem.isLlinosa())
      continue;
    if (b === 0) {
      if (needsNL) { this.l(); needsNL = false; }
      this.wm('var',' ');
    }
    else if (b > 0) 
      this.wm(',',' ');

    this.emitLlinosa(elem);
    b++;
  }

  var emitted = b > 0;
  if (emitted) {
    this.w(';');
    needsNL = true;
  }

  list = scope.funcDecls, i = 0, len = list.length();
  while (i < len) {
    elem = list.at(i);
    ASSERT.call(this, elem.length === 1,
      'lexical fns are not allowed to have more than a single defsite');

    if (i === 0 && needsNL) { this.l(); needsNL = false; }
    else if (i > 0) this.l();
    this.emitLexicalFn(elem[0]);
    i++;
  }

  if (!emitted) emitted = !i;
  return emitted;
};

this.emitLlinosa = function(llinosa) {
  this.w(llinosa.synthName).s().w('=').s().wm('{','v',':',' ','void',' ','0','}');
};

this.emitLexicalFn = function(n) {
  var fn = n.fn, decl = n.decl;
  var isV = decl.isLlinosa(), loopLexicals = null;

  if (!isV) this.wm('var').s();
  this.w(decl.synthName);
  if (isV) this.wm('.','v');

  this.s().w('=').s();

  loopLexicals = fn.scope.getLoopLexicalRefList();
  if (loopLexicals) {
    this.writeClosureHead(loopLexicals);
    this.i().l().w('return').s();
    this.emitRawFn(fn, decl.name);
    this.w(';').u().l();
    this.writeClosureTail(loopLexicals);
  }
  else
    this.emitRawFn(fn, decl.name);

  this.w(';');
};

},
function(){
Emitters['ExpressionStatement'] = function(n, isStmt, flags) {
  if (n.expression.type === '#Sequence')
    this.emitSynthSequence(n.expression, true, EC_NONE);
  else { 
    this.eA(n.expression, false, EC_START_STMT);
    this.w(';');
  }
};

},
function(){
Emitters['FunctionExpression'] = function(n, isStmt, flags) {
  var paren = flags & EC_START_STMT,
      altName = false,
      scopeName = n.scope.funcHead.scopeName;

  if (scopeName && scopeName.name !== scopeName.synthName)
    altName = true;

  var loopLexicals = n.scope.getLoopLexicalRefList();

  if (altName || loopLexicals) {
    if (!paren) paren = flags & EC_NEW_HEAD;
  }

  if (paren) { this.w('('); flags = EC_NONE; }

  if (altName || loopLexicals) {
    this.writeClosureHead(loopLexicals);
    if (altName) {
      this.i().l().wm('var',' ',scopeName.synthName,' ','=',' ');
      this.emitRawFn(n, scopeName.name);
      this.w(';').l().wm('return',' ',scopeName.synthName,';').u().l();
    }
    else {
      this.i().l().wm('return',' ').emitRawFn(n, scopeName.name);
      this.u().l();
    }
    this.writeClosureTail(loopLexicals);
  }
  else this.emitRawFn(n, scopeName ? scopeName.name : "");

  paren && this.w(')');
};

},
function(){
Emitters['FunctionDeclaration'] = function(n, prec, flags) {
  if (n.generator)
    return this.emitGenerator(n, prec, flags);

  var paren = false;
  if (n.type === 'FunctionExpression')
    paren = flags & EC_START_STMT;
  if (paren) this.w('(');

  this.w('function');
  if (n.id) { this.w(' ').writeIdentifierName(n.id.name); }
  this.w('(');
  if (!functionHasNonSimpleParams(n))
    this.emitParams(n.params);
  this.wm(')',' ').emitFuncBody(n);
  if (paren) this.w(')');
};

this.emitParams = function(list) {
  var i = 0;
  while (i < list.length) {
    if (i) this.wm(',',' ');
    var elem = list[i];
    ASSERT.call(this, elem.type === 'Identifier',
      '<'+elem.type+'> is not a valid type for a parameter during the emit phase');
    this.writeIdentifierName(elem.name);
    i++;
  }
};

this.emitFuncBody = function(n) {
  var body = n.body.body;
  this.w('{').i();

  var needsNL = true;
  var e = this.emitPrologue(body, true);
  needsNL = !e;

  needsNL = !this.emitTemps(n, needsNL);
  needsNL = !this.emitTZ(n, needsNL);
  needsNL = !this.emitThis(n, needsNL);
  needsNL = !this.emitArguments(n, needsNL);

  if (n.argumentPrologue)
    this.l().emitAny(n.argumentPrologue, true, EC_START_STMT);

  this.emitVars(n, true);
  this.emitFuncs(n, true);

  while (e < body.length) {
    this.l();
    this.emitAny(body[e++], true, EC_START_STMT);
  }

  this.u();
  if (e || n.argumentPrologue) 
    this.l();

  this.w('}');
};

},
function(){
this.emitTZ = function(fn, needsNL) {
  var s = fn.scope;
  if (!s.hasTZ) return false;
  needsNL && this.l();
//if (s.isConcrete())
//  this.wm('var',' ');
  var tz = s.scs.findLiquid('<tz>');
  this.w(tz.synthName).s().w('=').s().writeNumWithVal(s.di).w(';');
  return true;
};

this.emitTemps = function(fn, needsNL) {
  var s = fn.scope, list = s.liquidDefs, e = 0, elem = null, len = list.length();
  while (e < len) {
    if (e === 0) {
      needsNL && this.l();
      this.w('var').s();
    }
    else this.w(',').s();
    elem = list.at(e++);
    this.w(elem.synthName);
  }
  e && this.w(';');
  return e !== 0;
};

this.emitThis = function(fn, needsNL) {
  var s = fn.scope; 
  var _this = s.special.lexicalThis;
  if (_this === null || !_this.ref.indirect)
    return false;
  needsNL && this.l();
  this.wm(_this.synthName,' ','=',' ','this',';');

  return true;
};

this.emitPrologue = function(list, needsNL) {
  var i = 0, s = 0;
  while (i < list.length) {
    var stmt = list[i];
    if ( stmt.type === 'ExpressionStatement' &&
      stmt.expression.type === 'Literal' &&
      (typeof stmt.expression) === STRING_TYPE) {
      if (s===0 && needsNL) this.l();
      this.emitAny(stmt, true, EC_START_STMT);
      s++;
      i++;
    }
    else break;
  }
  return i;
};

this.emitArguments = function(fn) {};
this.emitVars = function(fn) {};
this.emitFuncs = function(fn) {};

},
function(){
Emitters['Identifier'] = function(n, prec, flags) {
  return this.emitIdentifierWithValue(n.name);
};

// TODO: write chunks instead of characters
this.writeIdentifierName =
this.emitIdentifierWithValue = function(value) {
  var i = 0;
  while (i < value.length) {
    var ch = value.charCodeAt(i);
    if (ch <= 0xFF) this.w(value.charAt(i));
    else this.writeUnicodeEscapeWithValue(ch);
    i++;
  }
};

},
function(){
Emitters['IfStatement'] =
this.emitIf = function(n, prec, flags) {
  this
    .wm('if',' ','(')
    .eA(n.test, PREC_NONE, EC_NONE)
    .w(')')
    .emitDependentStmt(n.consequent, false);
  if (n.alternate) {
    this.l();
    this.w('else').emitDependentStmt(n.alternate, true);
  }
};

},
function(){
Emitters['Literal'] =
this.emitLiteral = function(n, prec, flags) {
  switch (n.value) {
  case true: return this.write('true');
  case false: return this.write('false');
  case null: return this.write('null');
  default:
    switch (typeof n.value) {
    case NUMBER_TYPE:
      return this.emitNumberLiteralWithValue(n.value);
    case STRING_TYPE:
      return this.emitStringLiteralWithRawValue(n.raw);
    }
    ASSERT.call(this, false,
      'Unknown value for literal: ' + (typeof n.value));
  }
};

this.emitNumberLiteralWithValue =
function(nv) {
  this.write(""+nv);
};

this.emitStringLiteralWithRawValue =
function(svRaw) {
  this.write(svRaw);
};

},
function(){
Emitters['MemberExpression'] = function(n, prec, flags) {
  var objParen = false;
  this.eH(n.object, false, flags);

  if (n.computed)
    this.w('[').eA(n.property, false, EC_NONE).w(']');
  else if (this.isReserved(n.property.name)) {
    this.w('[').w('\'').writeStringWithVal(n.property.name).w('\'');
    this.w(']');
  }
  else {
    this.w('.');
    this.emitIdentifierWithValue(n.property.name);
  }
};

},
function(){
Emitters['NewExpression'] = function(n, prec, flags) {
  this.wm('new',' ').emitNewHead(n.callee);
  this.w('(').emitArgList(n.arguments);
  this.w(')');
};

this.emitArgList = function(argList) {
  var i = 0;
  while (i < argList.length) {
    if (i>0) this.w(',',' ');
    this.eN(argList[i], false, EC_NONE);
    i++;
  }
};

},
function(){
Emitters['ObjectExpression'] = function(n, prec, flags) {
  var list = n.properties;
  var mi = findComputed(list);
  if (mi !== -1)
    return this.emitObjectWithComputed(n, prec, flags, mi);

  var paren = flags & EC_START_STMT;

  if (paren) this.w('(');
  this.w('{').emitObjectChunk(list, 0, list.length-1); 
  this.w('}')
  if (paren) this.w(')');
};

this.emitObjectChunk = function(list, from, to) {
  var i = from;
  while (i <= to) {
    if (i > from) this.wm(',',' ');
    this.emitProp(list[i]);
    i++;
  }
};

// mi -> member idx
this.emitObjectWithComputed = function(n, prec, flags, mi) {
  var paren = flags & EC_NEW_HEAD;
  if (paren) this.w('(');
  this.wm('jz','.','obj','(','{');
  var list = n.properties;
  this.emitObjectChunk(n.properties, 0, mi-1);
  this.w('}');
  while (mi < list.length) {
    var prop = list[mi];

    this.wm(',',' ');
    if (prop.computed) this.eN(prop.key);
    else this.emitNonComputedAsString(prop.key);
    
    this.wm(',',' ').eN(prop.value);
    
    ++mi;
  }
  this.w(')');
  if (paren) this.w(')');
};  

this.emitProp = function(prop) {
  ASSERT.call(this, !prop.computed, 
    'computed prop is not emittable by this function');
  this.emitNonComputed(prop.key);
  this.wm(':',' ').eN(prop.value);
};

this.emitNonComputed = function(name) {
  switch (name.type) {
  case 'Identifier':
    if (this.isReserved(name.name))
      this.emitStringLiteralWithRawValue(name.name);
    else
      this.emitIdentifierWithValue(name.name);
    break;
  
  case 'Literal':
    this.emitLiteral(name);
    break;

  default:
    ASSERT.call(this, false,
      'Unknown type for prop key');
  }
};

this.emitNonComputedAsString = function(name) {
  switch (name.type) {
  case 'Identifier':
    return this.emitStringLiteralWithRawValue("'"+name.name+"'");
  case 'Literal':
    return this.emitLiteral(name);
  }
};

function findComputed(list) {
  var i = 0;
  while (i < list.length) {
    if (list[i].computed)
      return i;
    i++;
  }

  return -1;
}

},
function(){
Emitters['Program'] = function(n, prec, flags) {
  this.emitTopLevelBindings(n.scope);

  var list = n.body, i = 0;

  while (i < list.length) {
    var stmt = list[i++];
    i > 0 && this.startLine();
    this.emitAny(stmt, true, EC_START_STMT);
  }
};

},
function(){
Emitters['ReturnStatement'] = function(n, prec, flags) {
  this.w('return');
  if (n.argument)
    this.noWrap().s().emitAny(n.argument, false, EC_NONE);
  this.w(';');
};

},
function(){
Emitters['SynthSequenceExpression'] =
Emitters['SequenceExpression'] = function(n, prec, flags) {
  var paren = flags & EC_NON_SEQ;
  if (paren) { this.w('('); flags = EC_NONE; }
  var list = n.expressions, i = 0;
  this.eN(list[i], prec, flags);
  i++;
  while (i < list.length) {
    this.wm(',',' ').eN(list[i], false, EC_NONE);
    i++;
  }
  paren && this.w(')');
};

},
function(){


},
function(){
Emitters['SwitchStatement'] = function(n, prec, flags) {
  this.wm('switch',' ','(')
      .eA(n.discriminant, false, EC_NONE)
      .wm(')',' ','{');
  var list = n.cases, i = 0;
  if (list.length > 0) {
    while (i < list.length)
      this.l().emitCase(list[i++]);
    this.l();
  }
  this.w('}');
};

this.emitCase = function(c) {
  if (c.test) {
    this.wm('case',' ')
        .eA(c.test, false, EC_NONE)
        .w(':');
  } else
    this.wm('default',':');

  var list = c.consequent, i = 0;
  if (list.length > 0) {
    this.i();
    while (i < list.length)
      this.l().eA(list[i++], PREC_NONE, EC_NONE);
    this.u();
  }
};

},
function(){
Emitters['#DeclAssig'] = function(n, prec, flags) {
  var decl = n.left.decl;
  var isV =
    decl.isLexical() &&
    decl.ref.scope.insideLoop() && decl.ref.indirect;
  if (!isV) {
    if (decl.isFuncArg() || decl.isLexical())
      this.wm('var',' ');
  }
  this.w(decl.synthName);
  if (isV)
    this.wm('.','v');
  if (n.right) {
    this.s().w('=').s();
    this.eN(n.right);
  }
  else if (decl.ref.scope.insideLoop())
    this.wm(' ','=',' ','void',' ','0');

  this.w(';');
  if (decl.hasTZ) {
    this.l();
    var liquidSource = decl.ref.scope.scs;
    if (liquidSource.isAnyFnHead())
      liquidSource = liquidSource.funcBody;

    var tz = liquidSource.findLiquid('<tz>');
    this.wm(tz.synthName,' ','=',' ').writeNumWithVal(decl.i).w(';');
  }
};

},
function(){
Emitters['#ResolvedFn'] = function(n, isStmt, flags) {
  return;
  var decl = n.decl,
      isV = false;

  if (decl.isLexical() && decl.ref.scope.insideLoop() && decl.ref.indirect)
    isV = true;

  this.w(decl.synthName);
  isV && this.wm('.','v');
  this.wm(' ','=',' ');

  this.emitFn(n.fn, decl.name, EC_NONE);

  isV && this.w('}').w(';');
};

},
function(){
Emitters['#ResolvedName'] = function(n, prec, flags) {
  var isV = false;
  if (n.decl.isLexical() &&
    n.decl.ref.scope.insideLoop() && n.decl.ref.indirect)
    isV = true;

  if (n.shouldTest)
    this.emitResolvedName_tz(n, prec, flags, isV, n.alternate);
  else
    this.emitResolvedName_simple(n, prec, flags, isV);
};

this.emitResolvedName_tz = function(n, prec, flags, isV, alternate) {
  var paren = flags & (EC_NEW_HEAD|EC_EXPR_HEAD|EC_CALL_HEAD);
  paren && this.w('(');
  var liquidSource = n.decl.ref.scope.scs;
  if (liquidSource.isAnyFnHead())
    liquidSource = liquidSource.funcBody; 

  this.writeName(liquidSource.findLiquid('<tz>').synthName)
      .w('<').writeNumWithVal(n.decl.i).w('?')
      .jz('tz').wm('(',"'").writeStrWithVal(n.name).wm("'",')').w(':');  
  if (alternate) {
    var a = alternate;
    if (a.type === '#Untransformed' && a.kind === 'const-check')
      a = alternate.assigner;
 
    var core = null;
    switch (a.type) {
    case '#SubAssig':
    case 'AssignmentExpression':
      core = a.left;
      break;
    case 'UpdateExpression':
      core = a.argument;
      break;
    default:
      ASSERT.call(this, false, 'Unknown alternate has type <'+a.type+'>');
    }
    ASSERT.call(this, core === n,
      'alternate must have the same head as the resolved name');
    core.shouldTest = false;
    this.eN(alternate, PREC_NONE, EC_NONE);
  }
  else if (isV)
    this.writeVName(n.decl.synthName, EC_NONE);
  else
    this.writeName(n.decl.synthName);

  paren && this.w(')');
};

this.emitResolvedName_simple = function(n, prec, flags, isV) {
  if (isV) this.writeVName(n.decl.synthName, flags);
  else if (n.decl.isGlobal) this.writeGName(n.decl, flags);
  else this.writeName(n.decl.synthName);
};

this.writeVName = function(name, flags) {
  var zero = flags & EC_CALL_HEAD;
  if (zero) this.wm('(','0',',');
  this.writeName(name).wm('.','v');
  zero && this.w(')');
  return this;
};

this.writeGName = function(decl, flags) {
  var zero = false;
  if (decl.synthName === '<global>') {
    zero = flags & EC_CALL_HEAD;
    zero && this.wm('(','0',',');
    this.wm(decl.ref.scope.scriptScope.findLiquid('<this>').synthName,'.',decl.name);
    zero && this.w(')');
  }
  else
    this.writeName(decl.synthName);
};

this.writeName = function(name) {
  this.w(name);
  return this;
};

},
function(){
Emitters['#ResolvedThis'] = function(n, isStmt, flags) {
  this.w(n.verbatim ? 'this' : n.decl.synthName);
};

},
function(){
Emitters['#Sequence'] = function(n, isStmt, flags) {
  this.emitSynthSequence(n, isStmt, flags);
};

this.emitSynthSequence = function(n, isStmt, flags) {
  var list = n.elements, i = 0;
  if (isStmt)
    while (i < list.length) {
      i && this.l();
      this.emitAny(list[i++], true, EC_START_STMT);
    }
  else {
    var paren = flags & (EC_EXPR_HEAD|EC_NON_SEQ);
    paren && this.w('(');
    while (i < list.length) {
      i && this.wm(',',' ');
      this.eN(list[i++], false, EC_NONE);
    }
    paren && this.w(')');
  }
};

},
function(){
Emitters['TryStatement'] = function(n, prec, flags) {
  this.w('try').emitDependentStmt(n.block, false);
  if (n.handler)
    this.l().emitCatchClause(n.handler);
  if (n.finalizer)
    this.l().w('finally').emitDependentStmt(n.finalizer);
};

this.emitCatchClause = function(c) {
  this.wm('catch',' ','(').emitIdentifierWithValue('err');
  this.w(')').emitDependentStmt(c.body);
};

},
function(){
Emitters['UnaryExpression'] = function(n, prec, flags) {
  var lastChar = this.code.charAt(this.code.length-1);
  var o = n.operator;
  if (o === '-' || o === '+')
    lastChar === o && this.s();

  this.w(o);

  this.emitUnaryArgument(n.argument);
};

this.emitUnaryArgument = function(n) {
  if (n.type === 'UnaryExpression' || n.type === 'UpdateExpression')
    this.emitAny(n, false, EC_NONE);
  else
    this.eH(n, false, EC_NONE);
};

},
function(){
UntransformedEmitters['arg-at'] = function(n, isStmt, flags) {
  var paren = flags & EC_EXPR_HEAD;
  if (paren) this.w('(');
  this.wm('arguments','.','length','>').writeNumWithVal(n.idx)
      .wm(' ','?',' ','arguments','[').writeNumWithVal(n.idx)
      .wm(']',' ',':',' ','void',' ','0');
  if (paren) this.w(')');
};

},
function(){
UntransformedEmitters['arguments-iter'] = function(n, prec, flags) {
  this.jz('argIter').wm('.','apply','(','this',',',' ','arguments',')');
};

},
function(){
UntransformedEmitters['arg-rest'] = function(n, isStmt, flags) {
  this.eA(n.target, false, EC_NONE).s().w('=').s().wm('[',']',';').l()
      .wm('while',' ','(').eA(n.target)
      .wm('.','length',' ','<',' ','arguments','.','length');
  if (n.idx !== 0) this.w('-').writeNumWithVal(n.idx);
  this.w(')').i().l()
      .eA(n.target, false, EC_NONE).w('[').eA(n.target, false, EC_NONE)
      .wm('.','length',']',' ','=',' ','arguments','[').eA(n.target, false, EC_NONE).w('.')
      .wm('length');
  if (n.idx !== 0) this.w('+').writeNumWithVal(n.idx);
  this.wm(']',';').u();
};

},
function(){
UntransformedEmitters['arr-iter-end'] = function(n, isStmt, flags) {
  this.eH(n.iter).wm('.','end','(',')');
  isStmt && this.w(';');
};

},
function(){
UntransformedEmitters['arr-iter-get'] = function(n, isStmt, flags) {
  this.eH(n.iter).wm('.',(n.rest ? 'rest' : 'get'),'(',')');
  isStmt && this.w(';');
};

},
function(){
UntransformedEmitters['arr-iter'] = function(n, prec, flags) {
  this.jz('arrIter').w('(').eN(n.iterExpr).w(')');
};

},
function(){
UntransformedEmitters['obj-iter-get'] = function(n, prec, flags) {
  this.eA(n.iter).wm('.','get','(');
  if (n.computed)
    this.eN(n.keyName);
  else if (n.keyName.type === 'Literal')
    this.eA(n.keyName);
  else {
    ASSERT.call(this, n.keyName.type === 'Identifier',
      'got a key of the type ' + n.keyName.type);
    this.w('\'').writeStrWithVal(n.keyName.name).w('\'');
  }
  this.w(')');
};

},
function(){
UntransformedEmitters['obj-iter-val'] = function(n, prec, flags) {
  var zero = flags & EC_CALL_HEAD;
  zero && this.wm('(','0',',');
  this.eN(n.iter).wm('.','val');
  zero && this.w(')');
};

},
function(){
UntransformedEmitters['obj-iter'] = function(n, prec, flags) {
  this.jz('objIter').w('(').eN(n.iterExpr).w(')');
};

},
function(){
UntransformedEmitters['temp-save'] = function(n, isStmt, flags) {
  this.eA(n.left).wm(' ','=',' ').eN(n.right);
  isStmt && this.w(';');
};

},
function(){
UntransformedEmitters['temp'] = function(n, prec, flags) {
  ASSERT.call(this, n.liquid.synthName !== "",
    'a liquid has to have a synthesized name in order to be emittable');
  this.w(n.liquid.synthName);
};

},
function(){
UntransformedEmitters['uon'] = function(n, prec, flags) {
  this.jz('uon').w('(').eN(n.argument).w(')');
};

},
function(){
Emitters['#Untransformed'] = function(n, prec, flags) {
  return UntransformedEmitters[n.kind].call(this, n, prec, flags);
};

},
function(){
Emitters['WhileStatement'] = function(n, prec, flags) {
  this.wm('while',' ','(').eA(n.test, PREC_NONE, EC_NONE)
      .w(')').emitDependentStmt(n.body, false);
};

},
function(){
this.emitFn = function(n, fnName, flags) {
  var paren = false,
      loopLexicals = n.scope.getLoopLexicalRefList();

  if (loopLexicals) paren = flags & EC_NEW_HEAD;
  if (paren) { this.w('('); flags = EC_NONE; }

  loopLexicals && this.writeClosureHead(loopLexicals);
  this.emitRawFn(n, fnName);
  loopLexicals && this.writeClosureTail(loopLexicals);

  paren && this.w(')');
};
 
this.writeClosureTail = function(loopLexicals) {
  this.wm('}','(');
  var e = 0;
  if (loopLexicals)
    while (e < loopLexicals.length) {
      e && this.wm(',',' ');
      this.w(loopLexicals[e++].synthName);
    }
  this.w(')');
};

this.writeClosureHead = function(loopLexicals) {
  this.wm('function','(');
  var e = 0;
  if (loopLexicals)
    while (e < loopLexicals.length) {
      e && this.wm(',',' ');
      this.w(loopLexicals[e++].synthName);
    }
  this.wm(')',' ','{');
};

this.emitRawFn = function(n, fnName) {
  this.wm('function').s().w(fnName).w('(');
  if (!functionHasNonSimpleParams(n))
    this.emitParams(n.params);
  this.wm(')',' ').emitFuncBody(n);
};

},
function(){
this.isReserved = function(idString) { return false; };

},
function(){
this.writeNumWithVal = function(num) {
  return this.w(num+"");
};

this.writeStrWithVal = function(str) {
  return this.w(str);
};

}]  ],
[ErrorString.prototype, [function(){
this.applyTo = function(obj) {
  var errorMessage = "",
      isString = true,
      list = this.stringsAndTemplates,
      e = 0;
  while (e < list.length) {
    errorMessage += isString ?
      list[e] : list[e].applyTo(obj);
    e++;
    isString = !isString;
  }
  
  return errorMessage;
};


}]  ],
[FunScope.prototype, [function(){
this.insideUniqueArgs =
function() { return this.flags & SF_UNIQUE; };

this.verifyForUniqueArgs =
function() { this.firstDup && this.parser.err('argsdup'); };

this.exitUniqueArgs =
function() {
  ASSERT.call(this, !this.inBody,
    'must be in args');
  ASSERT.call(this, this.insideUniqueArgs(),
    'must be in unique args');
  this.flags &= ~SF_UNIQUE;
};

this.makeArgsUnique =
function() {
  if (!this.canDup())
    return;

  this.verifyForUniqueArgs();
  this.flags |= SF_UNIQUE;
};

},
function(){
this.canDup =
function() {
  ASSERT.call(this, !this.inBody,
    'canDup allowed in args only');
  return !this.insideUniqueArgs() &&
         !this.isStrict();
};

},
function(){
this.verifyForStrictness =
function() {
  this.verifyForUniqueArgs();
  var list = this.paramList, i = 0;
  while (i < list.length) {
    var elem = list[i++];
    if (arguments_or_eval(elem.name))
      this.parser.err('binding.to.arguments.or.eval');
    if (this.validateID(elem.name))
      this.parser.err('invalid.argument.in.strict.mode');
  }
};

}]  ],
null,
[Hitmap.prototype, [function(){
this.isValidName = function(name) {
  return this.isValidName_m(name+'%');
};

this.isValidName_m = function(mname) {
  return this.validNames === null ? true : 
    this.validNames.has(mname);
};

this.set = function(name, value) {
  return this.set_m(name+'%', value);
};

this.set_m = function(mname, value) {
  ASSERT.call(this, this.isValidName_m(mname),
    'not among the valid names: <' + mname + '>');
  if (!this.names.has(mname))
    this.names.set(mname, {gets: 0, sets: 0, name: mname, value: null});

  var entry = this.names.get(mname);
  entry.sets++;
  entry.value = value;

  return entry;
};

this.getOrCreate = this.getoc = function(name) {
  return this.getOrCreate_m(name+'%');
};

this.getOrCreate_m = this.getoc_m = function(mname) {
  ASSERT.call(this, this.isValidName_m(mname),
    'not among the valid names: <' + mname + '>');
  if (!this.names.has(mname))
    this.set_m(mname).sets = 0;

  var entry = this.names.get(mname);
  entry.gets++;
  return entry;
};

}]  ],
[LabelTracker.prototype, [function(){
this.addLabel = function(labelName) {
  ASSERT.call(
    this,
    this.target === null,
    'the current label tracker '+
    'has got a target (of type'+this.target.type+'.) '+
    'the label that it has been given should probably be '+
    'tracked by another label tracker.');

  this.activeLabels.push(labelName);
};

this.takeChildLabels = function(chlt) {
  this.containedLabels =
    this.containedLabels.concat(chlt.containedLabels);
};

this.setLabelTarget = function(target) {
  if (target.type !== 'YieldContainer')
    return;
  this.target = target;
  target.setLabels(this.activeLabels);
  this.containedLabels.push(this.activeLabels);
  this.activeLabels = null;
};

this.exit = function() {
  if (this.synthAtExit) {
    ASSERT.call(this, this.target !== null,
      'there must be a target to synthesize a label for.');
    ASSERT.call(this, this.target.type === 'YieldContainer',
      'target must be a container if a label is going to'+
      'get a label synthesized for.');
    ASSERT.call(this, this.target.label.length === 0,
      'target has got a label; label synthesis is'+
      'unnecessary');
    var synthName = this.newSynthLabelName(
      'synthLabelFor'+target.kind);
    target.synthLabel = synthName;
    this.containedLabels[0].push([synthName]);
  }
 
  this.parent && this.parent.takeChildLabels();
};

this.newSynthLabelName = function(baseLabelName) {
  baseLabelName = baseLabelName || 
    (baseLabelName === "" ? 'label' : baseLabelName);
  var synthName = baseLabelName, num = 0;

  RENAME:
  for (;;num++, synthName = baseLabelName+""+num) {
    var listOfLists = this.containedLabels, loli = 0;
    while (loli < listOfLabels.length) {
      var labels = listOfLists[loli], i = 0;
      while (i < labels.length) {
        if (labels[i] === synthName)
          continue RENAME;
        i++;
      }
      loli++;
    }

    break;
  }

  return synthName;
};

}]  ],
null,
null,
null,
[Parser.prototype, [function(){
this.suck =
function() {
  var commentBuf = this.commentBuf;
  this.commentBuf = null;
  return commentBuf;
};

this.spew =
function() {
  this.lpn.trailingComments = this.commentBuf;
  this.commentBuf = null;
  this.lpn = null;
};

},
function(){
this.insidePrologue =
function() {
  return this.scope.isFunc() &&
    this.scope.insidePrologue();
};

this.exitPrologue =
function() {
  this.scope.exitPrologue();
  this.clearPendingStrictErrors();
};

this.applyDirective =
function(directive) {
  var raw = directive.raw;
  // TODO: which one should apply first?
  if (raw.substring(1,raw.length-1) === 'use strict') {
    this.scope.makeStrict();
    this.applyPendingStrictErrors();
  }
};

},
function(){
this.next =
function() {

  this.skipWS();
  if (this.c >= this.src.length) {
    this.lttype = 'eof';
    this.ltraw = '<<EOF>>';
    return;
  }

  this.c0 = this.c;
  this.li0 = this.li;
  this.col0 = this.col;

  var ch = this.src.charCodeAt(this.c);
  if (isIDHead(ch))
    return this.readID_simple();
  if (isNum(ch))
    return this.readNum_raw(ch);

  switch (ch) {
  case CH_MIN:
    return this.readOp_min();
  case CH_ADD:
    return this.readOp_add();
  case CH_MULTI_QUOTE:
    return this.read_multiQ();
  case CH_SINGLE_QUOTE:
    return this.read_singleQ();
  case CH_SINGLEDOT:
    return this.read_dot();
  case CH_EQUALITY_SIGN:
    return this.readOp_eq();
  case CH_LESS_THAN:
    return this.readOp_lt();
  case CH_GREATER_THAN:
    return this.readOp_gt();
  case CH_MUL:
    return this.readOp_mul();
  case CH_MODULO:
    return this.readOp_mod();
  case CH_EXCLAMATION:
    return this.readOp_exclam();
  case CH_COMPLEMENT:
    return this.readOp_compl();
  case CH_OR:
    return this.readOp_or();
  case CH_AND:
    return this.readOp_and();
  case CH_XOR:
    return this.readOp_xor();
  case CH_BACK_SLASH:
    return this.readID_bs();
  case CH_DIV:
    return this.readDiv();

  default:
    if (ch >= 0x0D800 && ch <= 0x0DBFF)
      return this.readID_surrogate(ch);

    return this.readSingleChar();
  }
};

this.c0_to_c =
function() { return this.src.substring(this.c0,this.c); };

},
function(){
this.parseBreak =
function() {
  this.resvchk();
  this.testStmt() || this.err('not.stmt');
  this.fixupLabels(false);

  var c0 = this.c0, loc0 = this.locBegin();
  var c = this.c, li = this.li, col = this.col;

  this.next();
  var label = null;
  if (!this.nl && this.lttype === TK_ID) {
    this.validate(this.ltval);
    label = this.id();
    var target = this.findLabel_m(_m(label.name));
    if (target === null)
      this.err('break.no.such.label');
  }

  this.semi() || this.err('no.semi');

  var ec = this.semiC || (label && label.end) || c;
  var eloc = this.semiLoc ||
    (label && label.loc.end) ||
    { line: li, column: col };

  this.foundStatement = true;
  return {
    type: 'BreakStatement',
    label: label,
    start: startc,
    end: ec,
    loc: eloc
  };
};

},
function(){
this.parseContinue =
function() {
  this.resvchk();
  this.testStmt() || this.err('not.stmt');
  this.fixupLabels(false);

  if (!this.scope.canContinue())
    this.err('continue.not.in.loop');

  var c0 = this.c0, loc0 = this.locBegin();
  var c = this.c, li = this.li, col = this.col;
  this.next(); // 'continue'

  var label = null;
  if (!this.nl && this.lttype === TK_ID) {
    this.validate(this.ltval);
    label = this.id();
    var target = this.findLabel_m(_m(label.name));
    if (target === null)
      this.err('continue.no.such.label');
    if (!target.loop)
      this.err('continue.not.a.loop');
  }

  this.semi() || this.err('no.semi');
  var ec = this.semiC || (label && label.end) || c;
  var eloc = this.semiLoc ||
    (label && label.loc.end) ||
    { line: li, column: col };

  this.foundStatement = true;
  return {
    type: 'ContinueStatement',
    label: label,
    start: c0,
    end: ec,
    loc: { start: loc0, end: eloc }
  };
};

},
function(){
this.parseExprHead =
function(ctx) {
  var head = this.exprHead;
  if (head !== null) this.exprHead = null;
  else
  switch (this.lttype) {
  case TK_ID:
    if (head = this.parseIDExprHead(ctx))
      break;

    // the head is not an id-statement,
    // but it is not an id-expr either.
    // this is actually the case for
    // void, typeof, yield, delete, and await
    return null;

  case CH_LSQBRACKET:
    head = this.parseArrayExpression(ctx);
    break;

  case CH_LPAREN:
    head = this.parseParen(ctx);
    break;

  case CH_LCURLY:
    head = this.parseObjectExpression(ctx);
    break;

  case CH_MULTI_QUOTE:
  case CH_SINGLE_QUOTE:
    head = this.parseString(this.lttype);
    break;

  case TK_NUM:
    head = this.getLit_num();
    break;

  case CH_DIV:
    head = this.parseRegExpLiteral();
    break;

  case CH_BACKTICK:
    head = this.parseTemplateLiteral();
    break;

  case TK_UNBIN:
    this.prec = PREC_UNARY;
    return null;

  default: return null;
  }

  if (head.type === 'Identifier')
    this.scope.refDirect_m(_m(head.name), null);

  return head;
};

},
function(){
this.parseIDExprHead =
function(ctx) {
  var name = this.ltval;
  SWITCH:
  switch (name.length) {
  case 1:
    return this.id();
  case 2:
    switch (name) {
    case 'do': return this.parseDoWhile();
    case 'if': return this.parseIf();
    case 'in': this.ri();
    }
    break;

  case 3:
    switch (name) {
    case 'new':
      if (this.canBeStatement)
        this.canBeStatement = false;
      return this.parseNewHead();

    case 'for': return this.parseFor();
    case 'try': return this.parseTryStatement();
    case 'let':
    case 'var':
      return this.parseVar(ctx);

    case 'int':
      this.resvchk();
      this.v <= 5 && this.ri();
    }
    break;

  case 4:
    switch (name) {
    case 'null': return this.getLit_null();
    case 'void':
      this.resvchk();
      this.lttype = TK_UNARY; 
      this.vdt = VDT_VOID;
      return null;

    case 'this': return this.parseThis();
    case 'true': return this.getLit_true();
    case 'case':
      this.resvchk();
      if (this.canBeStatement) {
        this.canBeStatement = false ;
        this.foundStatement = true;
        return null;
      }
      this.ri();

    case 'else': this.ri();
    case 'with': return this.parseWith();

    case 'enum': this.ri();

    case 'byte': case 'char':
    case 'goto': case 'long':
      this.v <= 5 && this.ri();
    }
    break;

  case 5:
    switch (name) {
    case 'super': return this.parseSuper();
    case 'break': return this.parseBreak();
    case 'catch': this.ri();
    case 'class': return this.parseClass(CTX_NONE);
    case 'const': return this.parseVar(CTX_NONE);
    case 'throw': return this.parseThrow();
    case 'while': return this.parseWhile();
    case 'yield': 
      if (this.scope.canYield()) {
        this.resvchk();
        if (this.scope.isAnyFnHead())
          this.err('yield.args');
        if ( this.canBeStatement )
          this.canBeStatement = false;
        this.lttype = TK_YIELD;
        return null;
      }
      if (this.scope.insideStrict())
        this.ri();
      break SWITCH;
          
    case 'false': return this.getLit_false();
    case 'await':
      if (this.scope.canAwait()) {
        this.resvchk();
        if (this.scope.isAnyFnHead())
          this.err('await.args');
        if (this.canBeStatement)
          this.canBeStatement = false;
        this.lttype = TK_UNARY;
        this.vdt = VDT_AWAIT;
        return null;
      }
      if (!this.isScript) {
        this.resvchk();
        this.err('await.in.strict');
      }

      // async(e=await)=>l ;
      return this.suspys = this.id(); 

    case 'async': return this.parseAsync(context);

    case 'final':
    case 'float':
    case 'short':
      this.v <= 5 && this.ri();
    }
    break;

  case 6:
    switch (name) {
    case 'static':
      if (this.scope.insideStrict() || this.v <= 5)
        this.ri();

    case 'delete':
    case 'typeof':
      this.resvchk();
      this.lttype = TK_UNARY; 
      this.vdt = name === 'delete' ?
        VDT_DELETE : VDT_VOID;
      return null;

    case 'export': return this.parseExport();
    case 'import': return this.parseImport();
    case 'return': return this.parseReturn();
    case 'switch': return this.parseSwitch();
    case 'public':
      if (this.scope.insideStrict())
        this.ri();
    case 'double':
    case 'native':
    case 'throws':
      this.v <= 5 && this.ri();
    }
    break;

  case 7:
    switch (name) {
    case 'default':
      this.resvchk();
      if (this.canBeStatement) {
        this.canBeStatement = false;
        this.foundStatement = true;
      }
      return null;

    case 'extends':
    case 'finally':
      this.ri();

    case 'package':
    case 'private':
      if (this.scope.insideStrict())
        this.ri();

    case 'boolean':
      this.v <= 5 && this.ri();
    }

  case 8:
    switch (name) {
    case 'function':
      return this.parseFunc(ctx&CTX_FOR, 0);
    case 'debugger':
      return this.parseDbg();
    case 'continue':
      return this.parseContinue();
    case 'abstract':
    case 'volatile':
      this.v <= 5 && this.ri();
    }
    break;

  case 9:
    switch (name) {
    case 'interface':
    case 'protected':
      if (this.scope.insideStrict())
        this.ri() ;
    case 'transient':
      this.v <= 5 && this.ri();
    }
    break;

  case 10:
    switch (name) {
    case 'instanceof':
      this.ri();
    case 'implements':
      if (this.v <= 5 ||
        this.scope.insideStrict())
        this.ri();
    }
    break;

  case 12:
    this.v <= 5 &&
    name === 'synchronized' &&
    this.ri();
  }

  return this.id();
};
 
this.resvchk = function() {
  if (this.esct !== ERR_NONE_YET) {
    ASSERT.call(this.esct === ERR_PIN_UNICODE_IN_RESV,
      'the error in this.esct is something other than ERR_PIN_UNICODE_IN_RESV: ' + this.esct);
    this.err('resv.unicode');
  }
};


},
function(){
this.getLit_true = function() {
  this.resvchk();
  var n = {
    type: 'Literal', value: true,
    start: this.c0, end: this.c,
    loc: { start: this.locBegin(), end: this.loc() },
    raw: this.ltraw
  };
  this.next();
  return n;
};

this.getNum_false = function() {
  
  var n = {
    type: 'Literal', value: false,
    start: this.c0, end: this.c,
    loc: { start: this.locBegin(), end: this.loc() },
    raw: this.ltraw
  };
  this.next();
  return n;
};

this.getLit_null = function() {
  this.resvchk();
  var n = {
    type: 'Literal', value: null,
    start: this.c0, end: this.c,
    loc: { start: this.locBegin(), end: this.loc() },
    raw: this.ltraw
  };
  this.next();
  return n;
};

this.getLit_num = function () {
  var n = {
    type: 'Literal', value: this.ltval,
    start: this.c0, end: this.c,
    loc: { start: this.locBegin(), end: this.loc() },
    raw: this.ltraw
  };
  this.next();
  return n;
};

},
function(){
this.parseMem =
function(ctx, st) {
  var firstMod = null, latestMod = null, nonMod = null;
  var mpending = ST_NONE, nina = false; // name is newline async

  if (this.lttype === TK_ID) {
    firstMod = latestMod = this.id();

    MM:
    while (true) {
      switch (latestMod.name) {
      case 'static':
        st |= mpending;
        if (!(st & ST_CLSMEM)) { nonMod = latestMod; break MM; }
        if (st & ST_STATICMEM) { nonMod = latestMod; break MM; }
        if (st & ST_ASYNC) { nonMod = latestMod; break MM; }
        mpending = ST_STATIC;
        break;

      case 'get':
      case 'set':
        st |= mpending;
        nonMod = latestMod;
        if (st & ST_ACCESSOR) break MM;
        if (st & ST_ASYNC) break MM;
        mpending = latestMod.name === 'get' ? ST_GETTER : ST_SETTER;
        break;

      case 'async':
        st |= mpending;
        if (this.nl) { // an async with a newline coming after it is not a modifier
          nina = true;
          nonMod = latestMod;
          break MM;
        }
        if (st & ST_ACCESSOR) { nonMod = latestMod; break MM }
        if (st & ST_ASYNC) { nonMod = latestMod; break MM; }
        mpending = ST_ASYNC;
        break;

      default:
        st |= mpending;
        nonMod = latestMod;
        break MM;
      }

      if (this.lttype === TK_ID)
        latestMod = this.id();
      else break;
    }
  }

  var memName = null;
  if (nonMod)
    memName = nonMod;
  else {
    if (this.peekMul()) {
      if (this.v<=5)
        this.err('ver.mem.gen');
      if (st & ST_ASYNC)
        this.err('async.gen.not.supported.yet');
      latestMod = null;
      st |= mpending|ST_GEN;
      this.next();
    }
    var nameVal = "";
    switch (this.lttype) {
    case TK_ID:
      if (latestMod !== null) // must not actually happen unless (st & ST_GEN) holds to be true
        this.err('pending.id');

      st |= mpending;
      nameVal = this.ltval;
      memName = this.mem_id();
      break;

    case CH_LSQBRACKET:
      st |= mpending;
      memName = this.mem_expr();
      break;

    case TK_NUM:
      st |= mpending;
      memName = this.getLit_num();
      break;

    case CH_MULTI_QUOTE:
    case CH_SINGLE_QUOTE:
      st |= mpending;
      memName = this.parseString(this.lttype);
      nameVal = memName.value;
      break;

    default:
      if (latestMod) {
        memName = latestMod;
        nameVal = memName.name; // unnecessary
      }
    }

    if (memName === null) {
      if (st & ST_GEN)
        this.err('mem.gen.has.no.name');
      return null;
    }

    if (st & ST_CLSMEM)
      switch (nameVal) {
      case 'prototype':
        ctx |= CTX_HASPROTOTYPE;
        break;

      case 'constructor':
        st |= ST_CTOR;
        break;
      }
    else if (this.v>5 && nameVal === '__proto__')
      ctx |= CTX_HASPROTO;
  }

  if (this.lttype === CH_LPAREN) {
    if (this.v <= 5) this.err('ver.mem.meth');
    var mem = this.parseMeth(memName, ctx, st);
    // TODO: loc adjustment
    return mem;
  }

  if (st & (ST_STATICMEM|ST_GEN|ST_CLSMEM|ST_ASYNC|ST_ACCESSOR))
    this.err('meth.paren');

  return this.parseNonMethObjMem(memName, ctx);
};

this.parseNonMethObjMem =
function(memName, ctx) {
  var hasProto = ctx & CTX_HASPROTO, firstProto = this.first__proto__;
  var val = null;
  ctx &= ~CTX_HASPROTO; // unnecessary (?)

  switch (this.lttype) {
  case CH_COLON:
    if (hasProto && firstProto)
      this.err('obj.proto.has.dup',{tn:memName});

    this.next();
    val = this.parseNonSeqExpr(PREC_NONE, ctx);
    if (errt_track(ctx) && val.type === PAREN_NODE) {
      // if there is no error after the parseNonSeqExpr above
      if (errt_ptrack(ctx) && this.pt === ERR_NONE_YET) {
        this.pt = ERR_PAREN_UNBINDABLE;
        this.pe = val;
      }
      if (errt_atrack(ctx) && this.at === ERR_NONE_YET &&
        !this.ensureSAT(val.expr)) {
        this.at = ERR_PAREN_UNBINDABLE;
        this.ae = val;
      }
    }

    val = {
      type: 'Property',
      start: memName.start,
      key: core(memName),
      end: val.end,
      kind: 'init',
      loc: { start: memName.loc.start, end: val.loc.end },
      computed: memName.type === PAREN,
      method: false,
      shorthand: false,
      value: core(val),
      '#y': -1
    };

    if (hasProto)
      this.first__proto__ = val;

    return val;

  case TK_SIMPLE_BINARY:
    if (this.v <= 5)
      this.err('mem.short.assig');
    if (memName.type !== 'Identifier')
      this.err('obj.prop.assig.not.id',{tn:memName});
    if (this.ltraw !== '=')
      this.err('obj.prop.assig.not.assig');
    if (errt_noLeak(ctx)) // if the owner is not leaky
      this.err('obj.prop.assig.not.allowed');

    val = this.parseAssig(memName, ctx);
    if (errt_strack(ctx) && this.st === ERR_NONE_YET) {
      this.st = ERR_SHORTHAND_UNASSIGNED;
      this.se = val;
    }

    break;

  default:
    if (this.v <= 5)
      this.err('mem.short');
    if (name.type !== 'Identifier')
      this.err('obj.prop.assig.not.id',{tn:memName});
    this.validate(memName.name);
    val = memName;
    break;
  }

  return {
    type: 'Property',
    key: name,
    start: val.start,
    end: val.end,
    loc: val.loc,
    kind: 'init',
    shorthand: true,
    method: false,
    value: val,
    computed: false,
    '#y': -1
  };
};

},
function(){
this.parseNew =
function() {
  this.resvchk();
  var c0 = this.c0, loc0 = this.loc0();
  var c = this.c, li = this.li, col = this.col;

  this.next(); // 'new'
  if (this.lttype === CH_SINGLEDOT) {
    this.next();
    return this.parseMeta(c0,loc0,c,li,col);
  }

  var head = this.parseExprHead(CTX_NONE);
  if (head === null)
    this.err('new.head.is.not.valid');

  var inner = core(head) ;

  while (true)
  switch (this.lttype) {
  case CH_SINGLEDOT:
    this.next();
    if (this.lttype !== TK_ID)
      this.err('mem.name.not.id');
    elem = this.memberID();
    if (elem === null)
      this.err('mem.id.is.null');
    head = inner = {
      type: 'MemberExpression',
      property: elem,
      start: head.start,
      end: elem.end,
      object: inner,
      loc: {
        start: head.loc.start,
        end: elem.loc.end },
      computed: false,
      '#y': -1
    };
    continue;

  case CH_LSQBRACKET:
    this.next();
    elem = this.parseExpr(PREC_NONE, CTX_NONE);
    head = inner = {
      type: 'MemberExpression',
      property: core(elem),
      start: head.start,
      end: this.c,
      loc: {
        start: head.loc.start,
        end: this.loc() },
      computed: true,
      '#y': -1
    };
    if (!this.expectType_soft(CH_RSQBRACKET))
      this.err('mem.unfinished');
    continue;

  case CH_LPAREN:
    elem = this.parseArgList();
    head = inner = {
      type: 'NewExpression',
      callee: inner,
      start: head.start,
      end: this.c,
      arguments: elem,
      loc: {
        start: head.loc.start,
        end: this.loc() },
      '#y': -1
    };
    if (!this.expectType_soft(CH_RPAREN))
      this.err('new.args.is.unfinished');
    continue;

  case CH_BACKTICK:
    elem = this.parseTemplateLiteral();
    head = inner = {
      type: 'TaggedTemplateLiteral',
      quasi: elem,
      start: head.start,
      end: elem.end,
      loc: {
        start: head.loc.start,
        end: elem.loc.end },
      tag: inner,
      '#y': -1
    };
    continue;

  default:
    return {
      type: 'NewExpression',
      callee: inner,
      start: c0,
      end: head.end,
      loc: {
        start: loc0,
        end: head.loc.end },
      arguments : [],
      '#y': -1
    };
  }
};

},
function(){
this.parseNonSeqExpr =
function(prec, ctx) {
  var head = this.exprHead;
  if (head) this.exprHead = null;
  else head = this.parseExprHead(ctx);

  if (head)
    head = this.parseTail(head);
  else
  switch (this.lttype) {
  case TK_UNARY:
  case TK_UNBIN:
    head = this.parseUnaryExpression(ctx);
    break;

  case TK_AA_MM:
    head = this.parseUpdateExpression(null, ctx);
    break;

  case TK_YIELD:
    if (prec !== PREC_NONE)
      this.err('yield.as.an.id');
    return this.parseYield(ctx);

  default:
    if (!(ctx&CTX_NULLABLE))
      this.err('nexpr.null.head');
    return null;
  }

  var hasOp = this.getOp(ctx);
  if (!hasOp) {
    if (mnl(ctx)) {
      this.flushSimpleErrors();
      this.dissolveParen();
    }
    return head;
  }

  if (this.lttype & TK_ANY_ASSIG) {
    if (prec !== PREC_NONE)
      this.err('assig.not.first');
    return this.parseAssignment(head, ctx);
  }

  if (mnl(ctx)) {
    this.flushSimpleErrors();
    this.dissolveParen();
  }

  if (this.lttype === CH_QUESTION)
    return prec === PREC_NONE ?
      this.parseCond(head, ctx) : head;

  if (this.lttype === TK_AA_MM) {
    if (this.nl)
      return head;
    head = this.parseUpdate(head, ctx);
  }

  do {
    var curPrec = this.prec;
    if (prec === PREC_U && curPrec === PREC_EX)
      this.err('unary.before.an.exponentiation');
    if (curPrec < prec)
      break;
    if (curPrec === prec && !isRA(prec))
      break;

    var o = this.ltraw;
    this.next();
    var r = this.parseNonSeqExpr(curPrec, ctx & CTX_FOR);
    head = {
      type: isLog(curPrec) ? 'LogicalExpression' : 'BinaryExpression',
      operator: o,
      start: head.start,
      end: right.end,
      loc: {
        start: head.loc.start,
        end: right.loc.end },
      left: core(head),
      right: core(right)
    };
  } while (hasOp = this.getOp(ctx));

  return head;
};

},
function(){
this.parseStatement =
function(allowNull) {
  var head = null;
  switch (this.lttype) {
  case CH_LCURLY:
    return this.parseBlockStatement();
  case CH_SEMI:
    return this.parseEmptyStatement();
  case TK_ID:
    this.canBeStatement = true;
    // TODO: CTX.PAT|CTX.NO_SIMP
    head = this.parseIdExprHead(CTX_PAT);
    if (this.foundStatement) {
      this.foundStatement = false;
      return head;
    }
    this.canBeStatement = false;
    this.exprHead = head;
    break;

  case TK_EOF:
    if (!allowNull)
      this.err('stmt.null');
    return null;
  }

  head = this.parseExpr(CTX_TOP);
  if (head === null) {
    allowNull && this.err('stmt.null');
    return null;
  }
  if (head.type === 'Identifier' &&
    this.lttype === CH_COLON)
    return this.parseLabeledStatement(
      head, allowNull);

  this.fixupLabels(false);
  if (!this.semi())
    this.err('no.semi');

  return {
    type: 'ExpressionStatement',
    expression: core(head),
    start: head.start,
    end: this.semiC || head.end,
    loc: {
      start: head.loc.start,
      end: this.semiLoc || head.loc.end }
  };
};

//if (this.insidePrologue()) {
//  if (!isDirective(head))
//    this.exitPrologue();
//  else
//    this.applyDirective(head);
//}

},
function(){
this.parseTail =
function(head) {
  switch (this.lttype) {
  case CH_SINGLEDOT:
  case CH_LSQBRACKET:
  case CH_LPAREN:
  case CH_BACKTICK:
    this.flushSimpleErrors();
  }

  var inner = core(head), elem = null;

  LOOP:
  while (true) {
    switch (this.lttype) {
    case CH_SINGLEDOT:
      this.next();
      if (this.lttype !== TK_ID)
        this.err('mem.name.not.id');
      elem = this.memberID();
      if (elem === null)
        this.err('mem.id.is.null');
      head = inner = {
        type: 'MemberExpression',
        property: elem,
        start: head.start,
        end: elem.end,
        object: inner,
        loc: {
          start: head.loc.start,
          end: elem.loc.end },
        computed: false,
        '#y': -1
      };
      continue;

    case CH_LSQBRACKET:
      this.next();
      elem = this.parseExpr(PREC_NONE, CTX_NONE);
      head = inner = {
        type: 'MemberExpression',
        property: core(elem),
        start: head.start,
        end: this.c,
        loc: {
          start: head.loc.start,
          end: this.loc() },
        computed: true,
        '#y': -1
      };
      if (!this.expectType_soft(CH_RSQBRACKET))
        this.err('mem.unfinished');
      continue;

    case CH_LPAREN:
      elem = this.parseArgList();
      head = inner = {
        type: 'CallExpression',
        callee: inner,
        start: head.start,
        end: this.c,
        arguments: elem,
        loc: {
          start: head.loc.start,
          end: this.loc() },
        '#y': -1
      };
      if (!this.expectType_soft(CH_RPAREN))
        this.err('call.args.is.unfinished');
      continue;

    case CH_BACKTICK:
      elem = this.parseTemplateLiteral();
      head = inner = {
        type: 'TaggedTemplateLiteral',
        quasi: elem,
        start: head.start,
        end: elem.end,
        loc: {
          start: head.loc.start,
          end: elem.loc.end },
        tag: inner,
        '#y': -1
      };
      continue;

    default: break LOOP;
    }
  }

  return head;
};

},
function(){
this.parseThis = function() {
  this.resvchk();
  var n = {
    type : 'ThisExpression',
    loc: { start: this.locBegin(), end: this.loc() },
    start: this.c0,
    end : this.c
  };

  this.next() ;
  this.scope.refDirect_m(RS_THIS, null);
  return n;
};



},
function(){
this.semi =
function() {
  var t = this.lttype;
  if (t === CH_SEMI) {
    this.semiC = this.c;
    this.semiLoc = this.loc();
    this.next();
    return true;
  }

  if (this.nl) {
    this.semiC = 0;
    this.semiLoc = null;
    return true;
  }

  switch (t) {
  case TK_EOF:
    this.semiC = this.c;
    this.semiLoc = this.loc();
    return true;

  case CH_RCURLY:
    this.semiC = this.c0;
    this.semiLoc = this.locOn(1);
    return true;
  }

  return false;
};

},
function(){
this.isResv =
function (name) {
  switch (name.length) {
  case 1:
    return false;
  case 2: 
    switch (name) {
    case 'do': case 'if': case 'in':
      return true;
    }
    return false;

  case 3:
    switch (name) {
    case 'int' :
      return this.v>5;
    case 'let' :
      return this.v <= 5 ||
        !this.scope.insideStrict();
    case 'var': case 'for':
    case 'try': case 'new' :
      return true;
    }
    return false;

  case 4:
    switch (name) {
    case 'byte': case 'char':
    case 'goto': case 'long':
      return this.v<=5;

    case 'case': case 'else':
    case 'this': case 'void':
    case 'with': case 'enum':
    case 'true': case 'null':
      return true;
    }
    return false;

  case 5:
    switch (name) {
    case 'await':
      return !this.isScript ||
        this.scope.canAwait();

    case 'final':
    case 'float':
    case 'short':
      return this.v<=5;
    
    case 'yield': 
      return this.scope.insideStrict() ||
        this.scope.canYield();

    case 'break': case 'catch':
    case 'class': case 'const':
    case 'false': case 'super':
    case 'throw': case 'while': 
      return true;
    }
    return false;

  case 6:
    switch (name) {
    case 'double': case 'native': case 'throws':
      return this.v<=5;
    case 'public':
      return this.v<=5 ||
        this.scope.insideStrict();
    case 'static':
      return this.scope.insideStrict();
    case 'delete': case 'export':
    case 'import': case 'typeof':
    case 'switch': case 'return': 
      return true;
    }
    return false;

  case 7:
    switch (name) {
    case 'extends':
    case 'default':
    case 'finally':
      return true;
    case 'package':
    case 'private':
      return this.v<=5 ||
        this.scope.insideStrict();
    case 'boolean':
      return this.v<=5;
    }
    return false;

  case 8:
    switch (name) {
    case 'abstract':
    case 'volatile':
      return this.v<=5;
    case 'continue':
    case 'debugger':
    case 'function':
      return true;
    }
    return false;

  case 9:
    switch (name) {
    case 'protected':
    case 'interface':
      return this.scope.insideStrict() ||
        this.v<=5;
    case 'transient':
      return this.v<=5;
    }
    return false;

   case 10:
     switch (name) {
     case 'implements':
       return this.v <= 5 ||
         this.scope.insideStrict();

     case 'instanceof':
       return true;
     }
     return false;

  case 12:
    return this.v<=5 && name === 'synchronized';
  default: return true;
  }
};



},
function(){
this.setsimpoff =
function(offset) {
  this.col += (this.c = offset) - this.luo;
  // TODO: will luo remain relevant even if
  // we only use this.c at the start and end of a lexere routine
  this.luo = offset;
};

this.setnewloff =
function(offset) {
  this.luo = offset;
  this.c = offset;
  this.col = 0;
  this.li++;
};

this.scat =
function(offset) {
  return offset < this.src.length ?
    this.src.charCodeAt(offset) : -1;
};

},
function(){
this.parsePat_obj =
function() {
  this.v<=5 && this.err('ver.patobj');

  var isID = false, c0 = this.c0, loc0 = this.loc();
  var name = null, val = null, list = [], isShort = false;

  if (this.scope.insideArgs())
    this.scope.enterUniqueArgs();

  LOOP:
  do {
    this.next();
    switch (this.lttype) {
    case TK_ID:
      isID = true;
      name = this.id();
      break;

    case CH_LSQBRACKET:
      name = this.mem_expr();
      break;

    case TK_NUM:
      name = this.getLit_num();
      break;

    case CH_SINGLE_QUOTE:
    case CH_MULTI_QUOTE:
      name = this.parseString(this.lttype);
      break;

    default: break LOOP;
    }

    isShort = false;
    if (isID) {
      isID = false;
      if (this.expectT(CH_COLON))
        val = this.parsePat();
      else if (this.lttype === TK_SIMPLE_BINARY &&
        this.ltraw === '=') {
        val = this.parsePat_assig(name);
        isShort = true;
      }
      else
        val = name;
    }
    else {
      if (!this.expectT(CH_COLON))
        this.err('obj.pattern.no.:');
      val = this.parsePat();
    }
    if (val === null)
      this.err('obj.prop.is.null');

    list.push({
      type: 'Property',
      start: name.start,
      key: core(name),
      end: val.end,
      loc: {
        start: name.loc.start,
        end: val.loc.end },
      kind: 'init',
      computed: name.type === PAREN,
      value: val,
      method: false, 
      shorthand: isShort,
      '#y': -1
    });
  } while (this.lttype === CH_COMMA);

  var n = {
    type: 'ObjectPattern',
    loc: { start: loc0, end: this.loc() },
    start: c0,
    end: this.c,
    properties: list,
    '#y': -1
  };

  if (!this.expectT(CH_RCURLY))
    this.err('pat.obj.is.unfinished');

  return n;
};

},
function(){
this.parsePat_rest =
function() {
  this.v<=5 && this.err('ver.spread.rest');
  var c0 = this.c0, loc = this.loc0();

  this.next(); // '...'

  if (this.v<7 && this.lttype !== TK_ID)
    this.err('rest.binding.arg.not.id');

  var arg = this.parsePat();

  if (arg === null)
    this.err('rest.has.no.arg');

  return {
    type: 'RestElement',
    argument: e,
    start: c0,
    end: e.end,
    loc: {
      start: startLoc,
      end: e.loc.end }
  };
};

},
function(){
this.parseString =
function(startChar) {
  var c = this.c, s = this.src, l = s.length, v = "";
  var luo = c, surrogateTail = -1, ch = -1;

  while (c<l) {
    ch = s.charCodeAt(c);
    if (ch === CH_BACK_SLASH) {
      if (luo < c)
        v += s.substring(luo,c);
      this.setsimpoff(c);
      v += this.readEsc(false);
      c = luo = this.c;
    }
    else if (ch !== startChar)
      c++;
    else {
      if (luo < c)
        v += s.substring(luo,c);
      c++;
      break;
    }
  }

  this.setsimpoff(c);
  if (ch !== startChar)
    this.err('str.unfinished');

  return {
    type: 'Literal',
    value: v,
    start: this.c0,
    end: c,
    raw: this.c0_to_c(),
    loc: {
      start: { line: this.li0, column: this.col0 },
      end: { line: this.li, column: this.col }
    }
  };
};

},
function(){
this.readBS = function() {
  var c = this.c, s = this.src, l = s.length;
  c++; // \
  if (c >= l)
    this.err('u.expected.got.eof');

  c++;
  if (s.charCodeAt(c) === CH_LCURLY)
    return this.readBS_lcurly(c);

  var val = 0;
  var c0 = c;
  while (c-c0 < 4) {
    if (c >= l) {
      this.setsimpoff(c);
      this.err('hex.expected.got.eof');
    }

    var b = hex2num(s.charCodeAt(c));
    if (b === -1) {
      this.setsimpoff(c);
      this.err('hex.expected.got.something.else');
    }

    val = (val<<4)|b;
    c++;
  }

  this.setsimpoff(c);
  return val;
};

this.readBS_lcurly =
function(c) {
  var s = this.src, l = s.length;
  c++; // {
  if (c >= l) {
    this.setsimpoff(c);
    this.err('hex.expected.got.eof');
  }

  var val = 0;
  var b = s.charCodeAt(c);
  while (true) {
    b = hex2num(b);
    if (b === -1) {
      this.setsimpoff(c);
      this.err('hex.expected.got.something.else');
    }
    val = (val<<4)|b;
    c++;
    if (c >= l) {
      this.setsimpoff(c);
      this.err('curly.expected.got.eof');
    }
    b = s.charCodeAt(c);
    if (b === CH_RCURLY)
      break;
  }

  c++; // }
  this.setsimpoff(c);

  return val;
};

},
function(){
this.readSingleChar =
function() {
  var ch = this.src.charAt(this.c);
  this.lttype = ch.charCodeAt(0);
  this.ltraw = ch;
  this.setsimpoff(this.c+1);
};

},
function(){
this.readComment_line =
function() {
  var c = this.c, s = this.src, l = s.length;
  var li0 = this.li, col0 = this.col, c0 = c;

  COMMENT:
  while (c<l)
    switch (s.charCodeAt(c)) {
    case CH_CARRIAGE_RETURN:
    case CH_LINE_FEED:
    case 0x2028:
    case 0x2029:
      break COMMENT;
    default: c++;
    }

  this.setsimpoff(c);
  this.foundComment(c0,li0,col0,'Line');
};

this.readComment_multi =
function() {
  var c = this.c, s = this.src, l = s.length;
  var li0 = this.li, col0 = this.col, c0 = c, hasNL = false, finished = false;
  
  COMMENT:
  while (c<l)
    switch (s.charCodeAt(c)) {
    case CH_CARRIAGE_RETURN:
      if (c+1<l && s.charCodeAt(c+1) === CH_LINE_FEED)
        c++;
    case CH_LINE_FEED:
    case 0x2028: case 0x2029:
      c++;
      this.setnewloff(c);
      if (!hasNL)
        hasNL = true;
      continue;

    case CH_MUL:
      if (c+1<l && s.charCodeAt(c+1) === CH_DIV) {
        c += 2; // '*/'
        finished = true;
        break COMMENT;
      }
    default: c++;
    }

  this.setsimpoff(c);
  if (!finished)
    this.err('comment.multi.is.unfinished');

  this.foundComment(c0,li0,col0,'Block');
  return hasNL;
};

this.foundComment =
function(c0,li0,col0,t) {
  var c = this.c, li = this.li, col = this.col;
  if (this.commentBuf === null)
    this.commentBuf = [];
  this.commentBuf.push(
    {
      type: t,
      value: this.src.substring(c0, t === 'Line' ? c : c-2),
      start: c0,
      end: c,
      loc: {
        start: { line: li0, column: col0 },
        end: { line: li, column: col }
      }
    }
  );
};

},
function(){
this.readDiv =
function() {
  this.lttype = CH_DIV;
  this.setsimpoff(this.c+1);
};

},
function(){
this.read_dot =
function() {
  var ch = this.scat(this.c+1);
  if (ch === CH_SINGLEDOT)
    return this.readEllipsis();
  
  this.readNum_tail(FL_HEADLESS_FLOAT);

  this.ltval = parseFloat(this.ltraw = this.c0_to_c());
  this.lttype = TK_NUM;
};

},
function(){
this.readEsc =
function(t) { // is it a template escape?
  var c = this.c,
      s = this.src,
      l = s.length,
      v = '',
      setoff = true;

  if (c+1>=l)
    this.err('slash.eof');

  var ch1 = -1, ch2 = -1;
  switch (s.charCodeAt(c+1)) {
  case CH_BACH_SLASH: c+=2; v = '\\'; break;
  case CH_MULTI_QUOTE: c+=2; v = '\"'; break;
  case CH_SINGLE_QUOTE: c+=2; v = '\''; break;
  case CH_v: c+=2; v = '\v'; break;
  case CH_b: c+=2; v = '\b'; break;
  case CH_f: c+=2; v = '\f'; break;
  case CH_t: c+=2; v = '\t'; break;
  case CH_r: c+=2; v = '\r'; break;
  case CH_n: c+=2; v = '\n'; break;

  case CH_u:
    v = cp2sp(this.readBS());
    setoff = false;
    break;

  case CH_x:
    c+=2; // \x
    if (c>=l)
      this.err('x.esc.first.got.eof');
    ch1 = hex2num(s.charCodeAt(c));
    if (ch1 === -1)
      this.err('x.esc.first.got.nonhex');
    c++;
    if (c>=l)
      this.err('x.esc.next.got.eof');
    ch2 = hex2num(s.charCodeAt(c));
    if (ch2 === -1)
      this.err('x.esc.next.got.nonhex');
    c++;
    v = String.fromCharCode((ch1<<4)|ch2);
    break;

  case CH_0:
    if (c+2>=l ||
       (ch1=s.charCodeAt(c+2), ch1 < CH_0 || ch1 >= CH_8)) {
      c += 2;
      v = '\0';
      break;
    }
  case CH_1:
  case CH_2:
  case CH_3:
  case CH_4:
  case CH_5:
  case CH_6:
  case CH_7:
    t && this.err('template.esc.is.legacy');
    v = this.readEsc_legacy();
    setoff = false;
    break;

  case CH_8:
  case CH_9:
    this.err('esc.8.or.9');
    break;

  case CH_CARRIAGE_RETURN:
    if (
      c+3<l &&
      s.charCodeAt(c+3) === CH_LINE_FEED
    ) c++;
  case CH_LINE_FEED:
  case 0x2028: case 0x2029:
    this.setnewloff(c+2);
    v = '';
    setoff = false;
    break;

  default:
    v = src.charAt(c+1);
    c+=2;
  }

  if (setoff)
    this.setsimpoff(c);

  return v;
};

this.readEsc_legacy =
function() {
  if (this.scope.insideStrict())
    this.err('esc.legacy.not.allowed.in.strict.mode');

  if (this.insidePrologue() &&
    this.ct === ERR_NONE_YET) {
    this.ct = ERR_PIN_OCTAL_IN_STRICT;
    this.pinLoc_c(this.c,this.li,this.col);
  }
    
  var c = this.c+1, s = this.src, l = s.length, v = -1;

  v = s.charCodeAt(c) - CH_0;
  var max = v >= 4 ? 1 : 2;
  c++;
  while (c<l && max--) {
    var ch = s.charCodeAt(c);
    if (ch < CH_0 || ch >= CH_8)
      break;
    v = (v<<3)|(ch-CH_0);
  }

  return String.fromCharCode(v);
};

},
function(){
this.readID_bs =
function() {
  if (this.ct === ERR_NONE_YET) {
    this.ct = ERR_PIN_UNICODE_IN_RESV;
    this.pinLoc_c(this.c,this.li,this.col);
  }
  var bsc = this.readBS();
  var ccode = bsc;
  if (bsc >= 0x0D800 && bsc <= 0x0DBFF)
    this.err('id.head.is.surrogate');
  else if (!isIDHead(bsc))
    this.err('id.head.esc.not.idstart');

  var head = cp2sp(bsc);
  return this.readID_withHead(head);
};

},
function(){
this.readID_withHead = 
function(v) {
  var c = this.c,
      s = this.src,
      l = s.length,
      surrogateTail = -1,
      luo = c, ccode = -1;

  while (c < l) {
    var ch = s.charCodeAt(c);
    if (isIDBody(ch)) c++;
    else if (ch === CH_BACK_SLASH) {
      if (luo < c)
        v += s.substring(luo,c);
      this.setsimpoff(c);
      if (this.ct === ERR_NONE_YET) {
        this.ct = ERR_PIN_UNICODE_IN_RESV;
        this.pinLoc_c(this.c,this.li,this.col);
      }
      ch = this.readBS();
      if (!isIDBody(ch))
        this.err('id.body.esc.not.idbody');
      v += cp2sp(ch);
      c = luo = this.c;
    }
    else if (ch >= 0x0D800 && ch <= 0x0DBFF) {
      c++;
      if (c>=l)
        this.err('id.body.got.eof.surrogate');
      surrogateTail = s.charCodeAt(c);
      if (surrogateTail < 0x0dc00 || surrogateTail > 0x0dfff)
        this.err('id.body.surrogate.not.in.range');
      ch = surrogate(ch, surrogateTail);
      if (!isIDBody(ch))
        this.err('id.body.surrogate.not.idbody');
      c++;
    }
    else
      break;
  }

  if (luo < c)
    v += s.substring(luo,c);

  this.setsimpoff(c);

  this.ltval = v;
  this.ltraw = this.c0_to_c();
  this.lttype = TK_ID;
};

},
function(){
this.readID_simple =
function() {
  return this.readID_withHead(
    this.src.charAt(this.c++)
  );
};

},
function(){
this.readID_surrogate =
function(sc) {
  if (this.c+1 >= this.src.length)
    this.err('id.head.got.eof.surrogate');

  var surrogateTail = this.src.charCodeAt(this.c+1);
  var ccode = surrogate(sc, surrogateTail);
  if (!isIDHead(ccode))
    this.err('surrogate.not.id.head');

  this.c += 2;
  return this.readID_withHead(
    String.fromCharCode(sc) +
    String.fromCharCode(surrogateTail)
  );
};

},
function(){
var NUM0_NONDEC = 0,
    NUM0_DEC = 1,
    NUM0_ZERO = 2;

this.readNum_raw = function(ch) {
  var c = this.c+1, s = this.src, l = s.length;
  var legacy = false, deci = false, fl = false;
  if (ch === CH_0) {
    var t0 = this.readNum_0();
    deci = t0 !== NUM0_NONDEC;
    legacy = t0 === NUM0_DEC;
    c = this.c;
  }
  else {
    deci = true;
    while (c < l) {
      ch = s.charCodeAt(c);
      if (isNum(ch))
        c++;
      else
        break;
    }
    this.setsimpoff(c);
  }

  if (deci) {
    if (c < l && s.charCodeAt(c) === CH_SINGLEDOT) {
      this.readNum_tail(FL_SIMPLE_FLOAT);
      fl = true;
      c = this.c;
    }
    if (c < l) {
      ch = s.charCodeAt(c);
      if (ch === CH_E || ch === CH_e) {
        fl = true;
        this.readNum_tail(FL_GET_E);
      }
    }
    this.ltraw = this.c0_to_c();
    this.ltval = (fl ? parseFloat : parseInt)(
      legacy ? this.ltraw.substring(1) : this.ltraw);
  }

  this.lttype = TK_NUM;
};

this.readNum_0 =
function() {
  var ch = this.scat(this.c+1);
  switch (ch) {
  case CH_X: case CH_x:
    this.readNum_0x();
    return NUM0_NONDEC;

  case CH_B: case CH_b:
    this.readNum_0b();
    return NUM0_NONDEC;

  case CH_O: case CH_o:
    this.readNum_0o();
    return NUM0_NONDEC;

  default:
    if (isNum(ch))
      return this.readNum_octLegacy(ch);

    return NUM0_ZERO;
  }
};

this.readNum_0b =
function() {
  var c = this.c+2, // '0b'
      s = this.src,
      l = s.length,
      v = 0;

  if (c >= l) {
    this.setsimpoff(c);
    this.err('bin.expected.got.eof');
  }

  var ch = s.charCodeAt(c);
  if (ch !== CH_0 && ch !== CH_1) {
    this.setsimpoff(c);
    this.err('bin.expected.got.something.else');
  }

  v = ch - CH_0;
  c++;
  while (c<l) {
    ch = s.charCodeAt(c);
    if (!isNum(ch))
      break;
    if (ch === CH_0 || ch === CH_1)
      v = (v << 1)|(ch-CH_0);
    else
      this.err('bin.but.got.nonbin');
    c++;
  }

  this.setsimpoff(c);
  this.ltval = v;
  this.ltraw = this.c0_to_c();
};

this.readNum_octLegacy =
function(ch) {
  var c = this.c+2, s = this.src, l = s.length, dec = false;
  do {
    if (!dec && ch >= CH_8)
      dec = true;
    c++;
    if (c >= l)
      break;
    ch = s.charCodeAt(c);
  } while (isNum(ch));

  this.setsimpoff(c);
  if (!dec) {
    this.ltraw = this.c0_to_c();
    this.ltval = octStr2num(this.ltraw);
    return NUM0_NONDEC;
  }

  return NUM0_DEC;
};

this.readNum_tail =
function(fl) {
  var c = this.c,
      s = this.src,
      l = s.length,
      hasSign = false,
      ch = -1;

  if (fl !== FL_GET_E) {
    c++; // '.'
    if (fl === FL_HEADLESS_FLOAT) {
      if (c >= l || !isNum(s.charCodeAt(c)))
        this.err('float.tail.is.headless.must.have.digits');
      c++;
    }
    while (c<l && isNum(s.charCodeAt(c)))
      c++;

    if (c<l) {
      ch = s.charCodeAt(c);
      if (ch === CH_E || ch === CH_e)
        fl = FL_GET_E;
    }
  }

  if (fl === FL_GET_E) {
    c++;
    if (c >= l)
      this.err('float.nothing.after.e');
    ch = s.charCodeAt(c);
    if (ch === CH_MIN || ch === CH_ADD) {
      c++;
      if (c >= l)
        this.err('float.nothing.after.sign');
      ch = s.charCodeAt(c);
      hasSign = true;
    }
    if (!isNum(ch))
      this.err('float.needs.a.mantissa');
    c++;
    while (c<l && isNum(s.charCodeAt(c)))
      c++;
  }

  this.setsimpoff(c);
};

this.readNum_0x =
function() {
  var c = this.c+2, // '0x'
      s = this.src,
      l = s.length,
      v = 0;

  if (c>=l) {
    this.setsimpoff(c);
    this.err('hex.expected.got.eof');
  }

  var ch = hex2num(s.charCodeAt(c));
  if (ch === -1)
    this.err('hex.expected.got.somthing.else');

  v = ch;
  c++;
  while (c<l) {
    ch = hex2num(s.charCodeAt(c));
    if (ch === -1)
      break;
    v = (v<<4)|ch;
    c++;
  }

  this.setsimpoff(c);
  this.ltraw = this.c0_to_c();
  this.ltval = v;
};

this.readNum_0o =
function() {
  var c = this.c+2,
      s = this.src,
      l = s.length,
      v = 0;

  if (c>=l) {
    this.setsimpoff(c);
    this.err('oct.expected.got.eof');
  }

  var ch = s.charCodeAt(c);
  if (ch < CH_0 || ch >= CH_8)
    this.err('oct.expected.got.somthing.else');

  v = ch - CH_0;
  c++;
  while (c<l) {
    ch = s.charCodeAt(c);
    if (!isNum(ch))
      break;
    if (ch < CH_0 || ch >= CH_8)
      this.err('oct.expected.got.somthing.else');
    v = (v<<3)|(ch-CH_0);
  }

  this.setsimpoff(c);
  this.ltraw = this.c0_to_c();
  this.ltval = v;
};

},
function(){
this.readOp_add = function() {
  var c = this.c; c++ // '+'
  var ch = this.scat(c);
  if (ch === CH_ADD) {
    c++;
    this.lttype = TK_AA_MM;
    this.ltraw = '++';
  }
  else if (ch === CH_EQUALITY_SIGN) {
    c++;
    this.lttype = TK_OP_ASSIG;
    this.prec = PREC_ASSIG;
    this.ltraw = '+=';
  }
  else {
    this.lttype = TK_UNBIN;
    this.ltraw = '+';
  }

  this.setsimpoff(c);
};

},
function(){
this.readOp_and = 
function() {
  var c = this.c; c++;
  var ch = this.scat(c);

  this.lttype = TK_SIMP_BINARY;
  if (ch === CH_EQUALITY_SIGN) {
    c++; this.prec = PREC_ASSIG;
    this.ltraw = '&=';
  }
  else if (ch === CH_AND) {
    c++; this.prec = PREC_LOG_AND;
    this.ltraw = '&&';
  }
  else {
    this.prec = PREC_BIT_AND;
    this.ltraw = '&';
  }

  this.setsimpoff(c);
};

},
function(){
this.readOp_compl =
function() {
  this.lttype = TK_UNARY;
  this.ltraw = '~';
  this.setsimpoff(this.c+1);
};

},
function(){
this.readOp_eq =
function() {
  var c = this.c; c++; // '='
  var ch = this.scat(c);

  this.lttype = TK_SIMP_BINARY;
  if (ch === CH_EQUALITY_SIGN) {
    c++; this.prec = PREC_EQ;
    ch = this.scat(c);
    if (ch === CH_EQUALITY_SIGN) {
      c++;
      this.ltraw = '===';
    }
    else this.ltraw = '==';
  }
  else if (ch === CH_GREATER_THAN) {
    c++; this.prec = PREC_ASSIG;
    this.ltraw = '=>';
  }
  else {
    this.prec = PREC_ASSIG;
    this.ltraw = '=';
  }

  this.setsimpoff(c);
};

},
function(){
this.readOp_exclam =
function() {
  var c = this.c; c++; // '!';
  var ch = this.scat(c);

  if (ch === CH_EQUALITY_SIGN) {
    this.prec = PREC_EQ;
    this.lttype = TK_SIMP_BINARY;
    c++;
    ch = this.scat(c);
    if (ch === CH_EQUALITY_SIGN) {
      c++; this.ltraw = '!==';
    }
    else this.ltraw = '!=';
  }
  else {
    this.lttype = TK_UNARY;
    this.ltraw = '!';
  }

  this.setsimpoff(c);
};

},
function(){
this.readOp_gt =
function() {
  var c = this.c; c++; // '>';
  var ch = this.scat(c);

  this.lttype = TK_SIMP_BINARY;
  if (ch === CH_EQUALITY_SIGN) {
    c++;
    this.prec = PREC_COMP;
    this.ltraw = '>=';
  }
  else if (ch === CH_GREATER_THAN) {
    c++;
    ch = this.scat(c);
    if (ch === CH_EQUALITY_SIGN) {
      c++; this.prec = PREC_ASSIG;
      this.ltraw = '>>=';
    }
    else if (ch === CH_GREATER_THAN) {
      c++;
      ch = this.scat(c);
      if (ch === CH_EQUALITY_SIGN) {
        c++; this.prec = PREC_ASSIG;
        this.ltraw = '>>>=';
      }
      else {
        this.prec = PREC_SH;
        this.ltraw = '>>>';
      }
    }
    else {
      this.prec = PREC_SH;
      this.ltraw = '>>';
    }
  }
  else {
    this.prec = PREC_COMP;
    this.ltraw = '>';
  }

  this.setsimpoff(c);
};

},
function(){
this.readOp_lt =
function() {
  var c = this.c; c++; // '<'
  var ch = this.scat(c);

  this.lttype = TK_SIMP_BINARY;
  if (ch === CH_EQUALITY_SIGN) {
    c++;
    this.prec = PREC_COMP;
    this.ltraw = '<=';
  }
  else if (ch === CH_LESS_THAN) {
    c++;
    ch = this.scat(c);
    if (ch === CH_EQUALITY_SIGN) {
      c++;
      this.prec = PREC_ASSIG;
      this.ltraw = '<<=';
    }
    else {
      this.prec = PREC_SH;
      this.ltraw = '<<';
    }
  }
  else {
    this.prec = PREC_COMP;
    this.ltraw = '<';
  }

  this.setsimpoff(c);
};

},
function(){
this.readOp_min =
function() {
  var c = this.c; c++; // '-'
  var ch = this.scat(c);
  if (ch === CH_MIN) {
    c++;
    this.lttype = TK_AA_MM;
    this.ltraw = '--';
  }
  else if (ch === CH_EQUALITY_SIGN) {
    c++;
    this.prec = PREC_ASSIG;
    this.lttype = TK_SIMP_BINARY;
    this.ltraw = '-=';
  }
  else {
    this.lttype = TK_UNBIN;
    this.ltraw = '-';
  }

  this.setsimpoff(c);
};

},
function(){
this.readOp_mod =
function() {
  var c = this.c; c++;
  var ch = this.scat(c);

  this.lttype = TK_SIMP_BINARY;
  if (ch === CH_EQUALITY_SIGN) {
    c++; this.prec = PREC_ASSIG;
    this.ltraw = '%=';
  }
  else {
    this.prec = PREC_MUL;
    this.ltraw = '%';
  }
};

},
function(){
this.readOp_mul =
function() {
  var c = this.c; c++; // '*'
  var ch = this.scat(c);

  this.lttype = TK_SIMP_BINARY;
  if (ch === CH_EQUALITY_SIGN) {
    c++;
    this.prec = PREC_ASSIG;
    this.ltraw = '*=';
  }
  else if (ch === CH_MUL) {
    c++; ch = this.scat(c);
    if (ch === CH_EQUALITY_SIGN) {
      c++;
      this.prec = PREC_ASSIG;
      this.ltraw = '**=';
    }
    else {
      this.prec = PREC_MUL;
      this.ltraw = '**';
    }
  }
  else {
    this.prec = PREC_MUL;
    this.ltraw = '*';
  }

  this.setsimpoff(c);
};

},
function(){
this.readOp_or =
function() {
  var c = this.c; c++; // '|'
  var ch = this.scat(c);

  this.lttype = TK_SIMP_BINARY;
  if (ch === CH_EQUALITY_SIGN) {
    c++; this.prec = PREC_ASSIG;
    this.ltraw = '|=';
  }
  else if (ch === CH_OR) {
    c++; this.prec = PREC_LOG_OR;
    this.ltraw = '||';
  }
  else {
    this.prec = PREC_BIT_OR;
    this.ltraw = '|';
  }

  this.setsimpoff(c);
};

},
function(){
this.readOp_xor =
function() {
  var c = this.c; c++; // '^'
  var ch = this.scat(c);

  this.lttype = TK_SIMP_BINARY;
  if (ch === CH_EQUALITY_SIGN) {
    c++; this.prec = PREC_ASSIG;
    this.ltraw = '^=';
  }
  else {
    this.prec = PREC_BIT_XOR;
    this.ltraw = '^';
  }

  this.setsimpoff(c);
};

},
function(){
this.read_multiQ =
function() {
  this.lttype = CH_MULTI_QUOTE;
  this.ltraw = '"';
  this.setsimpoff(this.c+1);
};

this.read_singleQ =
function() {
  this.lttype = CH_SINGLE_QUOTE;
  this.ltraw = "'";
  this.setsimpoff(this.c+1);
};

},
function(){
this.skipWS =
function() {
  var c = this.c, s = this.src, l = s.length;
  var nl = false, sourceStart = c === 0, ch = -1;

  SKIPLOOP:
  while (c < l)
    switch (s.charCodeAt(c)) {
    case CH_WHITESPACE:
      while (
        ++c < l &&
        s.charCodeAt(c) === CH_WHITESPACE
      );
      continue;

    case CH_CARRIAGE_RETURN:
      if (
        c+1 < l &&
        s.charCodeAt(c+1) === CH_LINE_FEED
      ) c++;
    case CH_LINE_FEED:
      if (!nl)
        nl = true;
      this.setnewloff(c);
      c++;
      continue;

    case CH_VTAB:
    case CH_TAB:
    case CH_FORM_FEED:
      c++;
      continue;

    case CH_DIV:
      if (c+1 >= l)
        break SKIPLOOP;

      switch (s.charCodeAt(c+1)) {
      case CH_DIV:
        this.setsimpoff(c+2); // '//'
        this.readComment_line();
        c = this.c;
        continue;

      case CH_MUL:
        this.setsimpoff(c+2); // '/*'
        nl = this.readComment_multi() || nl;
        c = this.c;
        continue;
      }

      break SKIPLOOP;

    case CH_MIN:
      if (
        this.v>5 &&
        (nl || sourceStart) &&
        this.isScript &&
        c+2<l &&
        s.charCodeAt(c+1) === CH_MIN &&
        s.charCodeAt(c+2) === CH_GREATER_THAN
      ) {
        this.setsimpoff(c+3); // '-->'
        this.readComment_line();
        c = this.c;
        continue;
      }

      break SKIPLOOP;

    case CH_LESS_THAN:
      if (
        this.v>5 &&
        this.isScript &&
        c+3<l &&
        l.charCodeAt(c+1) === CH_EXCLAMATION &&
        l.charCodeAt(c+2) === CH_MIN &&
        l.charCodeAt(c+3) === CH_MIN
      ) {
        this.setsimpoff(c+4) ;
        this.readComment_line();
        c = this.c;
        continue;
      }

      break SKIPLOOP;

    case 0x0020: case 0x00A0: 
    case 0x1680: case 0x2000: 
    case 0x2001: case 0x2002: case 0x2003:
    case 0x2004: case 0x2005: case 0x2006:
    case 0x2007: case 0x2008: case 0x2009:
    case 0x200A: case 0x202F: case 0x205F:
    case 0x3000: case 0xFEFF:
      c++;
      continue;
  
    case 0x2028:
    case 0x2029:
      this.setnewloff(c);
      c++;
      continue;

    default: break SKIPLOOP;
    }

  this.setsimpoff(c);
  this.nl = nl;
};

},
function(){
this.readSurrogateTail =
function() {
  var c = this.c, s = this.src, l = s.length, mustSetOff = false;
  c >= l && this.err('unexpected.eof.while.surrogate.tail');
  var surrogateTail = s.charCodeAt(c);
  if (surrogateTail === CH_BACK_SLASH)
    surrogateTail = this.readBS();
  else
    mustSetOff = true;

  mustSetOff && this.setsimpoff(c+1);

  return surrogateTail;
};

}]  ],
null,
[Scope.prototype, [function(){
this.canSmem =
function() { return this.allowed & SF_MEMSUP; };

this.canAwait = 
function() { return this.allowed & SF_AWAIT; };

this.canBreak = 
function() { return this.allowed & SF_BREAK; };

this.canDeclareLetOrConst =
function() {
  if (this.isBlock() ||
    this.isModule() ||
    this.isScript())
    return true;

  if (this.isAnyFn() || this.isCatch())
    return this.inBody;
  
  return this.insideForInit();
};

this.canScall = 
function() { return this.allowed & SF_CALLSUP; };

this.canDeclareFn =
function(st) {
  if (this.isBlock() ||
    this.isModule() ||
    this.isScript())
    return true;

  if (this.isAnyFn() || this.isCatch())
    return this.inBody;

  ASSERT.call(this, this.isBare(),
    'a bare scope was expected but got '+
    this.typeString());

  if (st & (ST_GEN|ST_ASYNC))
    return false;

  return this.insideIf();
};

this.canYield = 
function() { return this.allowed & SF_YIELD; };

this.canReturn = 
function() { return this.allowed & SF_RETURN; };

this.canContinue = 
function() { return this.allowed & SF_CONTINUE; };

},
function(){
this.enterForInit =
function() { this.flags |= SF_FORINIT; };

this.exitForinit =
function() {
  ASSERT.call(this, this.insideForInit(),
    'must be in a for');
  this.flags &= ~SF_FORINIT;
};

},
function(){
this.hasNewTarget =
function() { return this.allowed & SA_NEW_TARGET; };

this.hasSignificantNames =
function() {
  if (this.isModule() ||
    this.isAnyFn() ||
    this.isScript())
    return true;

  if (this.isCatch())
    return this.argIsSimple && this.argIsSimple;

  return false;
};

},
function(){
this.insideIf =
function() { return this.flags & SF_IF; };

this.insideLoop =
function() { return this.flags & SF_LOOP; };

this.insideStrict = 
function() { return this.flags & SF_STRICT; };

this.insideForInit =
function() { return this.flags & SF_FORINIT; };

},
function(){
this.isAnyFn = 
function() { return this.type & ST_FN; };

this.isCatch = 
function() { return this.type & ST_CATCH; };

this.isScript = 
function() { return this.type & ST_SCRIPT; };

this.isModule = 
function() { return this.type & ST_MODULE; };

this.isClass = 
function() { return this.type & ST_CLS; };

this.isGen = 
function() { return this.type & ST_GEN; };

this.isAsync = 
function() { return this.type & ST_ASYNC; };

this.isGetter = 
function() { return this.type & ST_GETTER; };

this.isSetter = 
function() { return this.type & ST_SETTER; };

this.isClassMem = 
function() { return this.type & ST_CLSMEM; };

this.isStaticMem = 
function() { return this.type & ST_STATICMEM; };

this.isObjMem = 
function() { return this.type & ST_OBJMEM; };

this.isArrow = 
function() { return this.type & ST_ARROW; };

this.isCtor = 
function() { return this.type & ST_CTOR; };

this.isConcrete = 
function() { return this.type & (ST_FN|ST_MODULE|ST_SCRIPT); };

this.isDecl = 
function() { return this.type & ST_DECL; };

this.isExpr = 
function() { return this.type & ST_EXPR; };

this.isConditional = 
function() { return this.flags & ST_COND; };

this.isSoft = 
function() {
  return this.isBlock() ||
         this.isClass() ||
         this.isCatch() ||
         this.isParen() ||
         this.isBare();
};

},
function(){
this.spawnBlock =
function() { return new Scope(this, ST_BLOCK); };

this.spawnFn =
function(st) { return new FunScope(this, st|ST_FN); }

this.spawnCatch =
function() { return new CatchScope(this); };

this.spawnParen =
function() { return new ParenScope(this); };

this.spawnCls =
function(st) { return new ClassScope(this, st|ST_CLS); };

this.spawnBare =
function() { return new Scope(this, ST_BARE); };

},
function(){
this.makeStrict =
function() {
  this.flags |= SF_STRICT; 
  if (this.isAnyFn())
    this.verifyForStrictness();
};

}]  ],
[SortedObj.prototype, [function(){
this.set = function(name, val) {
  if (!HAS.call(this.obj, name))
    this.keys.push(name);
  return this.obj[name] = val;
};

this.at = function(i) {
  return i < this.keys.length ? this.obj[this.keys[i]] : void 0;
};

this.get = function(name) {
  return this.obj[name]; 
};

this.remove = function(name) {
  if (!HAS.call(this.obj, name))
    return false;
  delete this.obj[name];

  var list = this.keys, i = 0;

  while (name !== list[i])
    i++;

  while (i < list.length-1) {
    list[i] = list[i+1];
    i++;
  }

  list.pop();
  return true;
};

this.has = function(name) {
  return HAS.call(this.obj, name);
};

this.length = function() {
  return this.keys.length;
};

}]  ],
[Template.prototype, [function(){
// TODO: add a mechanism to react to cases where latestVal does not have a property (own or inherited)
// whose name has the same value as idx

this.applyTo = function(obj, noErrIfUndefNull) {
  var latestVal = obj, latestIdx = "", list = this.idxList, e = 0;
  while (e < list.length) {
    var idx = list[e];
    if (latestVal === null || latestVal === void 0) {
      if (noErrIfUndefNull)
        return latestVal;
      ASSERT.call(this, false,
        (e === 0 ?
          'the value to apply the template to' :
          'the value for index ' + latestIdx + '(name="'+list[latestIdx]+'")') +
        'is ' + (latestVal !== null ? 'undefined' : 'null')
      );
    }
    
    latestVal = latestVal[idx];
    latestIdx = e;

    e++;
  }

  return latestVal;
};

}]  ],
[Transformer.prototype, [function(){
this.constCheck = function(resolvedName) {
  ASSERT.call(this, resolvedName.type === '#ResolvedName',
    'only resolved names are allowed to get a const-check');
  this.accessJZ();
  if (resolvedName.decl.isCName())
    resolvedName.constCheck = true;
};

},
function(){
this.y = function(n) {
  return this.inGen ? y(n) : 0;
};

this.transform = this.tr = function(n, list, isVal) {
  var ntype = n.type;
  switch (ntype) {
    case 'Literal':
    case 'This':
    case 'Super':
    case 'ArrIterGet':
    case 'Unornull':
    case 'ObjIterGet':
    case 'SpecialIdentifier':
    case '#Sequence':
    case '#Untransformed':
    case '#ResolvedName':
      return n;
    default:
      return transform[n.type].call(this, n, list, isVal);
  }
};

this.rlit = function(id) { isTemp(id) && this.rl(id); };

this.save = function(n, list) {
  var temp = this.allocTemp();
  push_checked(synth_assig(temp, n), list);
  return temp;
};

this.setScope = function(scope) {
  var currentScope = this.currentScope;
  this.currentScope = scope;
  return currentScope;
};

this.setTempStack = function(tempStack) {
  var ts = this.tempStack;
  this.tempStack = tempStack;
  return ts;
};

},
function(){
this.accessJZ = function() {
  this.currentScope.accessLiquid(this.scriptScope, '<jz>');
};

this.accessTZ = function(scope) {
  var tz = this.currentScope.accessLiquid(scope, '<tz>');
  if (tz.idealName === "")
    tz.idealName = 'tz';
};

},
function(){
this.synth_SubAssig = 
function(left, right, isInitializer) {
  return {
    type: isInitializer ? '#DeclAssig' : '#SubAssig',
    left: left,
    right: right,
    operator: '=',
    y: -1 
  };
};

this.synth_ObjIter =
function(expr) {
  return {
    type: '#Untransformed',
    kind: 'obj-iter',
    iterExpr: expr
  };
};

this.synth_ObjIterGet =
function(iter, keyName, isComputed) {
  return {
    type: '#Untransformed',
    kind: 'obj-iter-get',
    keyName: keyName,
    iter: iter,
    computed: isComputed
  };
};

this.synth_ObjIterVal = function(iter) {
  return {
    type: '#Untransformed',
    iter: iter,
    kind: 'obj-iter-val'
  };
};

this.synth_ResolvedName = function(name, decl, shouldTest) {
  return { 
    type: '#ResolvedName', decl: decl, name: name, shouldTest: shouldTest, constCheck: false
  };
};

this.synth_Sequence = function(list) {
  return {
    type: '#Sequence',
    elements: list,
    y: -1
  };
};

this.synth_TempSave = function(temp, expr) {
  return {
    left: temp,
    right: expr,
    kind: 'temp-save',
    type: '#Untransformed'
  };
};

this.synth_Cond = function(test, consequent, alternate) {
  return {
    type: 'ConditionalExpression',
    test: test,
    consequent: consequent,
    alternate: alternate,
    y: -1
  };
};

this.synth_ArrIterEnd = function(iter) {
  return {
    type: '#Untransformed',
    kind: 'arr-iter-end',
    iter: iter
  };
};

this.synth_ArrIter = function(expr) {
  return {
    type: '#Untransformed',
    kind: 'arr-iter',
    iterExpr: expr
  };
};

this.synth_UoN = function(expr) {
  return {
    type: '#Untransformed',
    kind: 'uon',
    argument: expr
  };
};

this.synth_ArrIterGet = function(iter, isRest) {
  return {
    type: '#Untransformed',
    kind: 'arr-iter-get',
    iter: iter,
    rest: isRest ? true : false
  };
};

this.synth_DeclAssig = function(left, right) {
  return this.synth_SubAssig(left, right, true);
};

this.synth_ConstCheck = function(n) {
  return {
    type: '#Untransformed',
    kind: 'const-check',
    assigner: n
  }
};

this.synth_ArgAssig = function(paramList) {
  return {
    type: '#ArgAssig',
    elements: paramList
  }
};

this.synth_ArgIter = function() {
  return {
    type: '#Untransformed',
    kind: 'arguments-iter'
  }
};

this.synth_ResolvedFn = function(fn, decl) {
  return {
    type: '#ResolvedFn',
    decl: decl,
    fn: fn
  };
};

this.synth_ResolvedThis = function(decl, verbatim) {
  return {
    type: '#ResolvedThis',
    decl: decl,
    verbatim: verbatim
  };
};

this.synth_ArgAt = function(idx) {
  return {
    type: '#Untransformed',
    kind: 'arg-at',
    idx: idx
  };
};

this.synth_ArgRest = function(target, idx) {
  return {
    type: '#Untransformed',
    kind: 'arg-rest',
    target: target,
    idx: idx
  };
};

},
function(){
this.findFAT = function() {
  if (this.tempStack.length === 0)
    this.prepareTemp();
  return this.tempStack[this.tempStack.length-1];
};

this.ensureFAT = function(t) {
  if (t === null)
    ASSERT.call(this, this.tempStack.length === 0,
      'temps must be empty');
  else
    ASSERT.call(this, this.findFAT() === t,
      'FAT mismatch');
};

this.allocTemp = function() {
  if (this.tempStack.length === 0)
    this.prepareTemp();
  var t = this.tempStack.pop();
  t.occupied = true;

  // TODO: track this scope; will implement after revamping the FuncHeadScope/FuncBodyScope into
  // one

  return t;
};

this.prepareTemp = function() {
  var t = this.currentScope.accessLiquid(this.currentScope.scs, '<t>', true);
  t.idealName = 't';
  this.tempStack.push(makeTemp(t));
};

this.releaseTemp = function(temp, ensureFAT) {
  ASSERT.call(this, temp !== null, 'temp is not allowed to be null');
  ASSERT.call(this, temp.occupied, 'a temp has to be an occupied temp in order to be released');
  this.tempStack.push(temp);
  temp.occupied = false;
  if (ensureFAT)
    this.ensureFAT(ensureFAT);
};

function makeTemp(liquid) {
  return {
    type: '#Untransformed', kind: 'temp', name: liquid.name, liquid: liquid, occupied: false
  };
}

this.saveInTemp = function(expr, pushTarget) {
  var t = this.allocTemp();
  pushTarget.push(this.synth_TempSave(t, expr));
  return t;
};

},
function(){
transform['UpdateExpression'] = function(n, pushTarget, isVal) {
  if (this.y(n.argument))
    n.argument = this.transform(n.argument, pushTarget, true);
  else {
    n.argument = this.transform(n.argument, null, true);
    var arg = n.argument;
    if (arg.type === '#ResolvedName') {
      this.constCheck(arg);
      if (arg.shouldTest) {
        arg.alternate = n;
        n = arg;
      }
    }
  }
  return n;
};

},
function(){


},
function(){
var assigTransformers = {};

transform['AssignmentExpression'] = 
function(n, pushTarget, isVal) {
  if (this.y(n))
    return this.transformAssigWithYield(n, pushTarget, isVal);

  ASSERT.call(this, pushTarget === null,
    'pushTarget is not alowed to be non-null');

  pushTarget = [];
  var transformer = assigTransformers[n.left.type];
  var result = transformer.call(this, n, pushTarget, isVal);
  result && pushTarget.push(result);

  return pushTarget.length === 1 ?
    pushTarget[0] : this.synth_Sequence(pushTarget);
};

transform['#DeclAssig'] = function(n, pushTarget, isVal) {
  if (this.y(n))
    return this.transformDeclAssigWithYield(n, pushTarget, isVal);

  ASSERT.call(this, !isVal,
    'decl-assig is not allowed to be transformed as a value');

  var isTop = false;
  if (pushTarget === null) {
    pushTarget = [];
    isTop = true;
  }
  else if (n.left.type !== 'Identifier')
    ASSERT.call(this, n.right, 'nonsimple subdecls must have initializers');

  var transformer = assigTransformers[n.left.type];
  var result = transformer.call(this, n, pushTarget, isVal);
//ASSERT.call(this, result,
//  'result is not allowed to be null for decl-assig');
  if (!isTop)
    return result;

  result && pushTarget.push(result);

  return pushTarget.length === 1 ?
    pushTarget[0] : this.synth_Sequence(pushTarget);
};

transform['#SubAssig'] =
function(n, pushTarget, isVal) {
  ASSERT.call(this, !isVal,
    'sub-assignments are not allowed to have values');

  if (this.y(n))
    return this.transformSubAssigWithYield(n, pushTarget, isVal);

  return assigTransformers[n.left.type].call(this, n, pushTarget, isVal);
};

assigTransformers['Identifier'] = function(n, pushTarget, isVal) {
  if (n.type === '#DeclAssig') {
    n.left = this.transformDeclName(n.left);
    if (n.right)
      n.right = this.transform(n.right, null, true);
  }
  else {
    n.left = this.transform(n.left, null, true);
    ASSERT.call(this, n.right,
        'assignment must have a right hand side');
    n.right = this.transform(n.right, null, true);
  }

  var resolvedName = n.left;
  if (n.type === '#DeclAssig') {
    resolvedName.shouldTest = false;
    resolvedName.decl.reached = true;
  }
  else {
    this.constCheck(resolvedName);
    if (resolvedName.shouldTest) {
      resolvedName.alternate = n;
      n = resolvedName;
    }
  }
  return n;
};

assigTransformers['MemberExpression'] = function(n, pushTarget, isVal) {
  n.left = this.transform(n.left, null, true);
  n.right = this.transform(n.right, null, true);
  return n;
};

assigTransformers['ObjectPattern'] = function(n, pushTarget, isVal) {
  n.right = this.transform(n.right, null, true);

  var temp = this.saveInTemp(this.synth_ObjIter(n.right), pushTarget);
  var list = n.left.properties;
  var e = 0;
  while (e < list.length) {
    var elem = list[e++];
    var result = this.transform(
      this.synth_SubAssig(
        elem.value,
        this.synth_ObjIterGet(
          temp,
          elem.computed ? this.transform(elem.key, null, true) : elem.key,
          elem.computed
        ),
        n.type === '#DeclAssig'
      ),
      pushTarget,
      false
    );
    result && pushTarget.push(result);
  }
  this.releaseTemp(temp);
  return isVal ? this.synth_ObjIterVal(temp) : null;
};

assigTransformers['AssignmentPattern'] = function(n, pushTarget, isVal) {
  ASSERT.call(this, !isVal,
    'assignment-patterns are not allowed to have a transform-value');
  var l = n.left.left,
      valDefault = n.left.right,
      r = n.right;
  var temp = this.allocTemp(),
      cond = this.synth_Cond(
        this.synth_UoN(this.synth_TempSave(temp, r)),
        valDefault,
        temp
      );
  this.releaseTemp(temp);

  // NOTE: temps allocated while transforming cond never overwrite that of the sub-assig,
  // because:
  // * if l is simple, it _might_ share temps with the transformed cond, but
  //   they have taken effect before cond is evaluated at run-time
  // * if sub assig is not simple, cond is saved first, in the form of an iter, in a temp that might be
  //   even among its own allocated names, but it is in the left hand side and will only have a value
  //   when cond is evaluated (at run-time)
  return this.transform(
    this.synth_SubAssig(l, cond, n.type === '#DeclAssig'),
    pushTarget,
    false
  );
}; 

assigTransformers['ArrayPattern'] = function(n, pushTarget, isVal) {
  n.right = this.transform(n.right, null, true);

  var t = this.saveInTemp(this.synth_ArrIter(n.right), pushTarget);
  var list = n.left.elements;
  this.assigListToIter(n.type === '#DeclAssig', list, t, pushTarget);
  this.releaseTemp(t);

  return this.synth_ArrIterEnd(t);
};

this.assigListToIter = function(isInitializer, list, iter, pushTarget) {
  var e = 0;
  while (e < list.length) {
    var elem = list[e++];
    var rest = false;
    if (elem && elem.type === 'RestElement') {
      elem = elem.argument;
      rest = true;
    }
    var result =
      elem === null ?
        this.synth_ArrIterGet(iter, rest):
        this.transform(
          this.synth_SubAssig(
            elem,
            this.synth_ArrIterGet(iter, rest),
            isInitializer
          ),
          pushTarget,
          false
        );
    result && pushTarget.push(result);
  }
};

transform['#ArgAssig'] = function(n, pushTarget, isVal) {
  ASSERT.call(
    this,
    pushTarget === null, 'pushTarget must be null');
  pushTarget = [];
  ASSERT.call(this, !isVal, 'argument assignments are not allowed to be transformed as values');
  var list = n.elements, i = 0, result = null;
  while (i < list.length) {
    var elem = list[i]; 
    if (elem.type === 'RestElement') {
      if (elem.argument.type === 'Identifier') {
        var argDecl = elem.argument = this.transformDeclName(elem.argument);
        pushTarget.push(this.synth_ArgRest(elem.argument, i));
        argDecl.decl.reached = true;
      }
      else {
        var t = this.allocTemp();
        pushTarget.push(this.synth_ArgRest(t, i));
        this.releaseTemp(t);
        result = this.transform(
          this.synth_SubAssig(elem.argument, t, true),
          pushTarget,
          false
        );
        result && pushTarget.push(result);
      }
    }
    else {
      result = this.transform(
        this.synth_SubAssig(elem, this.synth_ArgAt(i), true),
        pushTarget,
        false
      );
      result && pushTarget.push(result);
    }
    i++;
  }

//ASSERT.call(this, pushTarget.length > 1, 'length must be > 1');
  return this.synth_Sequence(pushTarget);
};

},
function(){
transform['BinaryExpression'] = function(n, pushTarget, isVal) {
  if (this.y(n))
    return this.transformBinaryExpressionWithYield(n, pushTarget, isVal);

  n.left = this.transform(n.left, null, true);
  n.right = this.transform(n.right, null, true);
  return n;
};

},
function(){
transform['BlockStatement'] = function(n, pushTarget, isVal) {
  if (this.y(n))
    return this.transformBlockStatementWithYield(n, pushTarget, isVal);

  var ps = null;
  if (n.scope) {
    ps = this.setScope(n.scope);
    this.currentScope.synthesizeNamesInto(this.currentScope.scs);
  }

  var list = n.body, i = 0;
  while (i < list.length) {
    list[i] = this.tr(list[i], pushTarget, isVal);
    i++;
  }
  ps && this.setScope(ps);

  return n;
};

},
function(){
transform['CallExpression'] = function(n, pushTarget, isVal) {
  if (this.y(n))
    return this.transformCallExpressionWithYield(n, pushhTarget, isVal);

  n.callee = this.transform(n.callee, null, true);

  var list = n.arguments, i = 0;
  while (i < list.length) {
    list[i] = this.transform(list[i], null, true);
    i++;
  }

  return n;
};

},
function(){
transform['ClassExpression'] =
transform['ClassDeclaration'] = function(n, pushTarget, isVal) {
  if (this.y(n))
    return transformClassWithYield(n, pushTarget, isVal);

  return n;
};

},
function(){
transform['ConditionalExpression'] = function(n, list, isVal) {
  if (this.y(n))
    return this.transformConditionalExpressionWithYield(n, list, isVal);

  n.test = this.tr(n.test, null, true);
  n.consequent = this.tr(n.consequent, null, true);
  n.alternate = this.tr(n.alternate, null, true);
  return n;
};

this.transformConditionalExpressionWithYield = function(n, list, isVal) {
  n.test = this.transform(n.test, list, true);
  var ifBody = [], elseBody = [];
      t = null;
  n.consequent = this.tr(n.consequent, ifBody, isVal);
  if (isVal) {
    t = this.save(n.consequent, ifBody);
    this.rl(t);
  }
  n.alternate = this.tr(n.alternate, elseBody, isVal);
  if (isVal) {
    t = this.save(n.alternate, elseBody);
    this.rl(t);
  }
  push_checked(synth_if(n.test, ifBody, elseBody), list);
  return isVal ? t : NOEXPR;
};


},
function(){

},
function(){
transform['VariableDeclaration'] = function(n, pushTarget, isVal) {
  if (this.y(n))
    return this.transformDeclarationWithYield(n, pushTarget, isVal);

  ASSERT.call(this, pushTarget === null, 'pushTarget is not allowed to be non-null');
  pushTarget = [];

  var list = n.declarations, i = 0;
  while (i < list.length) {
    var elem = list[i++], assig = null;
    if (n.kind === 'var') {
      if (!elem.init) continue;
      assig = this.synth_SubAssig(elem.id, elem.init);
    }
    else
      assig = this.synth_DeclAssig(elem.id, elem.init);

    var result = this.transform(assig, pushTarget, false);
    result && pushTarget.push(result);
  }

  return pushTarget.length === 1 ?
    pushTarget[0] : this.synth_Sequence(pushTarget);
};

this.transformDeclName = function(id) {
  var decl = this.currentScope.findDecl_m(_m(id.name));
  return this.synth_ResolvedName(id.name, decl, false);
};

},
function(){
transform['ExpressionStatement'] = function(n, list, isVal) {
  n.expression = this.tr(n.expression, list, false);
  return n;
};



},
function(){
transform['FunctionExpression'] =
transform['FunctionDeclaration'] = function(n, pushTarget, isVal) {
  if (functionHasNonSimpleParams(n))
    n.argumentPrologue = this.synth_ArgAssig(n.params);
  if (n.generator)
    return this.transformGenerator(n, null, isVal);

  var ps = this.setScope(n.scope);
  var ts = this.setTempStack([]);

  this.accessJZ();

  if (this.currentScope.isExpr() && this.currentScope.funcHead.scopeName) {
    var scopeName = this.currentScope.funcHead.scopeName;
    var synthName = Scope.newSynthName(scopeName.name, null, scopeName.ref.lors, scopeName);
    scopeName.setSynthName(synthName);
  }

  this.currentScope.startupSynthesis();

  if (n.argumentPrologue !== null) {
    var hs = this.setScope(this.currentScope.funcHead);
    n.argumentPrologue = this.transform(n.argumentPrologue, null, false);
    this.setScope(hs);
  }

  n.body = this.transform(n.body, null, isVal);
  this.currentScope.endSynthesis();

  this.setScope(ps);
  this.setTempStack(ts);

  if (n.type === 'FunctionDeclaration') {
    n = this.asResolvedFn(n);
    ps.addFunc(n.fn.id.name, n);
  }

  return n;
};

this.asResolvedFn = function(fn) {
  var fnName = fn.id.name;
  return this.synth_ResolvedFn(fn, this.currentScope.findDecl(fnName));
};

},
function(){
transform['Identifier'] = function(n, pushTarget, flags) {
  var decl = this.currentScope.findRef_m(_m(n.name)).getDecl();
  var shouldTest = this.currentScope.shouldTest(decl);
  if (shouldTest) {
    decl.useTZ();
    this.accessTZ(decl.ref.scope.scs);
  }

  return this.synth_ResolvedName(n.name, decl, shouldTest); 
} 

},
function(){
transform['IfStatement'] = function(n, pushTarget, isVal) {
  if (this.y(n))
    return this.transformIfStatementWithYield(n, pushTarget, isVal);
  
  n.test = this.tr(n.test, null, true);
  n.consequent = this.tr(n.consequent, null, false);
  if (n.alternate)
    n.alternate = this.tr(n.alternate, null, false);
  return n;
};

},
function(){
transform['LogicalExpression'] = function(n, list, isVal) {
  n.left = this.tr(n.left, list, true);
  if (this.y(n.right))
    return this.transformLogicalExpressionWithYield(n, list, isVal)
  n.right = this.tr(n.right, list, isVal);
  return n;
};

this.transformLogicalExpressionWithYield = function(n, list, isVal) {
  var ifBody = [],
      t = null;
  if (isVal) {
    t = this.allocTemp();
    n.left = synth_assig(t, n.left);
    if (n.operator === '||')
      n.left = synth_not(n.left); 
    this.rl(t);
  }
  var tr = this.tr(n.right, ifBody, isVal);
  if (isVal) {
    t = this.save(tr, ifBody);
    this.rl(t);
  }
  push_checked(synth_if(n.left, ifBody), list);
  return isVal ? t : NOEXPR;
};



},
function(){
transform['MemberExpression'] = function(n, pushTarget, isVal) {
  if (this.y(n))
    return this.transformMemberExpressionWithYield(n, pushTarget, isVal);

  n.object = this.transform(n.object, null, true);
  if (n.computed)
    n.property = this.transform(n.property, null, true);

  return n;
};

},
function(){
transform['NewExpression'] = function(n, pushTarget, isVal) {
  if (this.y(n))
    return this.transformNewExpressionWithYield(n, pushTarget, isVal);

  n.callee = this.transform(n.callee, pushTarget, true);

  var list = n.arguments, i = 0;
  while (i < list.length) {
    list[i] = this.tr(list[i], null, true);
    i++;
  }

  return n;
};

},
function(){
transform['Program'] = function(n, list, isVal) {
  var b = n.body, i = 0;
  this.scriptScope = n.scope;
  this.globalScope = this.scriptScope.parent;

  var ps = this.setScope(this.scriptScope);
  var ts = this.setTempStack([]);

  this.accessJZ();
  this.currentScope.synthGlobals();
  this.currentScope.startupSynthesis();

  while (i < b.length) {
    b[i] = this.transform(b[i], null, false);
    i++;
  }
  this.currentScope.endSynthesis();

  this.setScope(ps);
  this.setTempStack(ts);

  return n;
};

},
function(){
transform['SequenceExpression'] = function(n, pushTarget, isVal) {
  if (this.y(n))
    return this.transformSequenceExpressionWithYield(n, pushTarget, isVal);

  var list = n.expressions, i = 0;
  while (i < list.length) {
    list[i] = this.tr(list[i], null, true);
    i++;
  }

  return n;
};

},
function(){
transform['SpreadElement'] = function(n, pushTarget, isVal) {
  n.argument = this.transform(n.argument, pushTarget, isVal);
  return n;
};

},
function(){
transform['ThisExpression'] = function(n, pushTarget, isVal) {
  var thisRef = this.currentScope.findRef_m(RS_THIS), decl = thisRef.getDecl();
  return this.synth_ResolvedThis(decl, decl.ref.scope === this.currentScope);
};

},
function(){
transform['UnaryExpression'] = function(n, pushTarget, isVal) {
  n.argument = this.transform(n.argument, pushTarget, isVal);
  return n;
};

},
function(){
transform['WhileStatement'] = function(n, pushTarget, isVal) {
  if (this.y(n))
    return this.transformWhileStatementWithYield(n, pushTarget, isVal);

  n.test = this.transform(n.test, null, false);
  n.body = this.transform(n.body, null, false);
  return n;
};

},
function(){
transform['YieldExpression'] = function(n, list, isVal) {
  if (n.argument)
    n.argument = this.tr(n.argument, list, true);
  push_checked(n, list);
  return isVal ? sentVal() : NOEXPR;
};


}]  ],
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null]);
this.parse = function(src, isModule ) {
  var newp = new Parser(src, isModule);
  return newp.parseProgram();
};

this.Parser = Parser;  
this.ErrorString = ErrorString;
this.Template = Template;
this.Emitter = Emitter;
this.Transformer = Transformer;
this.Scope = Scope;
this.Hitmap = Hitmap;
this.GlobalScope = GlobalScope;
/*
this.ST_GLOBAL  = ST_GLOBAL ;
this.ST_MODULE  = ST_MODULE ;
this.ST_SCRIPT  = ST_SCRIPT ;
this.ST_DECL  = ST_DECL ;
this.ST_CLS  = ST_CLS ;
this.ST_FN  = ST_FN ;
this.ST_CLSMEM  = ST_CLSMEM ;
this.ST_SETTER  = ST_SETTER ;
this.ST_GETTER  = ST_GETTER ;
this.ST_STATICMEM  = ST_STATICMEM ;
this.ST_CTOR  = ST_CTOR ;
this.ST_OBJMEM  = ST_OBJMEM ;
this.ST_ARROW  = ST_ARROW ;
this.ST_BLOCK  = ST_BLOCK ;
this.ST_CATCH  = ST_CATCH ;
this.ST_ASYNC  = ST_ASYNC ;
this.ST_BARE  = ST_BARE ;
this.ST_BODY  = ST_BODY ;
this.ST_METH  = ST_METH ;
this.ST_EXPR  = ST_EXPR ;
this.ST_GEN  = ST_GEN ;
this.ST_HEAD  = ST_HEAD ;
this.ST_PAREN  = ST_PAREN ;

this.ST_ACCESSOR  = ST_ACCESSOR ;
this.ST_SPECIAL  = ST_SPECIAL ;
this.ST_MEM_FN  = ST_MEM_FN ;
this.ST_TOP  = ST_TOP ;
this.ST_LEXICAL  = ST_LEXICAL ;
this.ST_HOISTABLE  = ST_HOISTABLE ;
this.ST_ANY_FN  = ST_ANY_FN ;
this.ST_CONCRETE  = ST_CONCRETE ;
this.ST_NONE = 0;

this.SM_LOOP  = SM_LOOP ;
this.SM_UNIQUE  = SM_UNIQUE ;
this.SM_STRICT  = SM_STRICT ;
this.SM_INARGS  = SM_INARGS ;
this.SM_INBLOCK  = SM_INBLOCK ;
this.SM_INSIDE_IF  = SM_INSIDE_IF ;
this.SM_CLS_WITH_SUPER  = SM_CLS_WITH_SUPER ;
this.SM_FOR_INIT  = SM_FOR_INIT ;
this.SM_YIELD_KW  = SM_YIELD_KW ;
this.SM_AWAIT_KW  = SM_AWAIT_KW ;
this.SM_NONE = SM_NONE;

this.SA_THROW  = SA_THROW ;
this.SA_AWAIT  = SA_AWAIT ;
this.SA_BREAK  = SA_BREAK ;
this.SA_RETURN  = SA_RETURN ;
this.SA_YIELD  = SA_YIELD ;
this.SA_CONTINUE  = SA_CONTINUE ;
this.SA_CALLSUP  = SA_CALLSUP ;
this.SA_MEMSUP  = SA_MEMSUP ;
this.SA_NONE = 0;

this.DM_CLS  = DM_CLS ;
this.DM_FUNCTION  = DM_FUNCTION ;
this.DM_LET  = DM_LET ;
this.DM_TEMP  = DM_TEMP ;
this.DM_VAR  = DM_VAR ;
this.DM_CONST  = DM_CONST ;
this.DM_SCOPENAME  = DM_SCOPENAME ;
this.DM_CATCHARG  = DM_CATCHARG ;
this.DM_FNARG  = DM_FNARG ;
this.DM_ARGUMENTS  = DM_ARGUMENTS ;
this.DM_NEW_TARGET  = DM_NEW_TARGET ;
this.DM_LTHIS  = DM_LTHIS ;
this.DM_MEMSUP  = DM_MEMSUP ;
this.DM_CALLSUP  = DM_CALLSUP ;
this.DM_GLOBAL  = DM_GLOBAL ;
this.DM_LIQUID  = DM_LIQUID ;
this.DM_NONE = 0;

this.RS_ARGUMENTS  = RS_ARGUMENTS ;
this.RS_SMEM  = RS_SMEM ;
this.RS_SCALL  = RS_SCALL ;
this.RS_NTARGET  = RS_NTARGET ;
this.RS_THIS = RS_THIS;
*/
;}).call (function(){try{return module.exports;}catch(e){return this;}}.call(this))