(function(){
"use strict";
;
function CatchBodyScope(sParent) {
  LexicalScope.call(this, sParent, ST_CATCH|ST_BODY);
  
  this.paramList = new SortedObj();
  this.hasSimpleList = true;
  this.catchVarName = "";
}

;
function CatchHeadScope(sParent) {
  Scope.call(this, sParent, ST_CATCH|ST_HEAD);

  this.paramsAreSimple = false;
  this.synthParamName = null;
}

;
function ClassScope(sParent, sType) {
  Scope.call(this, sParent, sType|ST_CLS);
  
  this.synthCLSPName = "";
  this.synthSuperName = "";
  this.synthCLSName = "";
  this.scopeName = "";

  this.special = { scall: null, smem: null };
}
;
function Decl() {
  this.mode = DM_NONE;
  this.ref = null;
  this.name = "";
  this.site = null;
  this.synthName = "";
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
function FuncBodyScope(sParent, sType) {
  Scope.call(this, sParent, sType|ST_BODY);

  this.prologue = null;
  this.funcHead = null;
  this.special = { newTarget: null, lexicalThis: null };
}
;
function FuncHeadScope(sParent, st) {
  Scope.call(this, sParent, st|ST_HEAD);
  this.paramList = [];
  this.firstNonSimple = null;
  this.scopeName = "";
  this.firstDup = null;
  this.firstEvalOrArguments = null;
  this.mode |= SM_INARGS;
  this.paramMap = {};
}

;
function GlobalScope() {
  Scope.call(this, null, ST_GLOBAL);  
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
function LexicalScope(sParent, sType) {
  Scope.call(this, sParent, sType);

  this.synthName = "";
  this.childBindings = null;
  
  var surroundingCatch =
    sParent.isCatchBody() ?
      sParent :
      sParent.isLexical() ?
        sParent.surroundingCatch :
        null;
}

;
function ParenScope(sParent) {
  Scope.call(this, sParent, ST_PAREN);

  this.paramList = [];
  this.firstDup = null;
  this.firstNonSimple = null;
  this.paramMap = {};
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
  this.isVDT = VDT_NONE;

  this.labels = {};

  this.li0 = 0;
  this.col0 = 0;
  this.c0 = 0;

  this.li = 1;
  this.col = 0;
  this.c = 0;
  
  this.canBeStatement = false;
  this.foundStatement = false;
  this.scopeFlags = 0;

  this.isScript = false;
  this.v = 7;

  this.throwReserved = true;

  this.first__proto__ = false;

  this.scope = null;
  this.directive = DIR_NONE;
  
  this.declMode = DECL_NONE;
 
  // TODO:eliminate
  this.pendingExprHead = null;

  // ERROR TYPE           CORE ERROR NODE    OWNER NODE
  this.pt = ERR_NONE_YET; this.pe = null; this.po = null; // paramErr info
  this.at = ERR_NONE_YET; this.ae = null; this.ao = null; // assigErr info
  this.st = ERR_NONE_YET; this.se = null; this.so = null; // simpleErr info

  this.suspys = null;
  this.missingInit = false;

  this.dv = { value: "", raw: "" };

  // "pin" location; for errors that might not have been precisely cause by a syntax node, like:
  // function l() { '\12'; 'use strict' }
  //                 ^
  // 
  // for (a i\u0074 e) break;
  //         ^
  //
  // var e = [a -= 12] = 5
  //            ^
  this.ploc = { c0: -1, li0: -1, col0: -1 }; // paramErr locPin; currently only for the last error above
  this.aloc = { c0: -1, li0: -1, col0: -1 }; // assigErr locPin; currently only for the last error above

  // escErr locPin; like the name suggests, it's not a simpleErr -- none of the simpleErrs needs a pinpoint
  this.esct = ERR_NONE_YET;
  this.eloc = { c0: -1, li0: -1, col0: -1 };

  this.parenAsync = null; // so that things like (async)(a,b)=>12 will not get to parse.

  this.errorListener = this; // any object with an `onErr(errType "string", errParams {*})` will do

  this.onToken_ = null;
  this.onComment_ = null;
//this.core = MAIN_CORE;
  this.misc = {
    alloHashBang: false,
    allowImportExportEverywhere: false,
    allowReturnOutsideFunction: false,
    directSourceFile: "",
    sourceFile: ""
  };
  this.program = null;

  this.parenScope = null;
  this.setOptions(o);
};

;
function Ref(scope) {
  this.lors = [];
  this.indirect = new RefCount();
  this.scope = scope;
  this.direct = new RefCount();
  this.resolved = false;
}
;
function RefCount() {
  this.fw = 0;
  this.ex = 0;
}
;
function Scope(sParent, sType) {
  this.parent = sParent;
  this.type = sType;
  this.scs = this.isConcrete() ?
    this :
    this.parent.scs;
  
  this.defs = new SortedObj();
  this.refs = new SortedObj();

  this.allowed = this.calculateAllowedActions();
  this.mode = this.calculateScopeMode();
  if (this.isCtorComp() && !this.parent.hasHeritage())
    this.allowed &= ~SA_CALLSUP;

  this.labelTracker = new LabelTracker();
  this.allNames = this.parent ? 
    this.parent.allNames :
    new SortedObj();

  this.resolveCache = new SortedObj();

  this.iRef = this.parent ? this.parent.iRef : {v: 0};

  this.headI = this.iRef.v++;
  this.tailI = -1;

  this.ch = [];
  if (this.parent)
    this.parent.ch.push(this);

  this.parser = this.parent ? this.parent.parser : null;
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
  this.inGen = false; // y is a rather slow function, and its usage must be strictly limited to generators
  this.currentScope = null;
}

;
LexicalScope.prototype = createObj(Scope.prototype);
CatchBodyScope.prototype = createObj(LexicalScope.prototype);
CatchHeadScope.prototype = createObj(LexicalScope.prototype);
GlobalScope.prototype = createObj(Scope.prototype);
FuncHeadScope.prototype = createObj(Scope.prototype);
FuncBodyScope.prototype = createObj(Scope.prototype);
ClassScope.prototype = createObj(Scope.prototype);
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

var INTBITLEN = (function() { var i = 0;
  while ( 0 < (1 << (i++)))
     if (i >= 512) return 8;

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

// TODO: order matters in the first few declarations below, mostly due to a 
// slight performance gain in parseFunc, where MEM_CONSTRUCTOR and MEM_SUPER in `flags` are
// getting added to the current scope flags.
// the ordering is also to make the relevant value sets (i.e., SCOPE_FLAG_* and MEM_*)
// span less bit lengths; this order sensitivity is something that must change in a very
// near future.
var MEM_PROTOTYPE = 1,
    MEM_PROTO = MEM_PROTOTYPE << 1,
    MEM_HAS_CONSTRUCTOR = MEM_PROTO << 1,
    MEM_NONE;

var ARGLEN_GET = 0,
    ARGLEN_SET = 1,
    ARGLEN_ANY = -1;

var DECL_NONE = 0;
var DECL_NOT_FOUND = 
  null;

var VDT_VOID = 1;
var VDT_TYPEOF = 2;
var VDT_NONE = 0;
var VDT_DELETE = 4;
var VDT_AWAIT = 8;

var DIR_MODULE = 1,
    DIR_SCRIPT = DIR_MODULE << 1,
    DIR_NONE = 0,
    DIR_TOP = DIR_MODULE|DIR_SCRIPT,
    DIR_FUNC = DIR_SCRIPT << 2,
    DIR_LAST = DIR_FUNC << 1,
    DIR_MAYBE = DIR_LAST << 1,
    DIR_HANDLED_BY_NEWLINE = DIR_MAYBE << 1,
    DIR_HAS_OCTAL_ERROR = DIR_HANDLED_BY_NEWLINE << 1;

var EC_NONE = 0,
    EC_NEW_HEAD = 1,
    EC_START_STMT = 2;

var PREC_NONE = PREC_WITH_NO_OP;

function MAIN_CORE(n) {
  return n.expression;
}

function KEEPER_CORE(n) {
  n.type = 'ParenthesizedExpression';
  return n;
}
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
function num(c) {
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
var EMIT_CONTEXT_NEW = 1,
    EMIT_CONTEXT_STATEMENT = 2,
    EMIT_CONTEXT_NONE = 0;

var IS_REF = 1,
    IS_VAL = 2,
    NOT_VAL = 0;

var NOEXPRESSION = { type: 'NoExpression' };
var NOEXPR = NOEXPRESSION;

var SIMPLE_PARTITION = 0;
var CONTAINER_PARTITION = 1;

var EMIT_LEFT = 1,
    EMIT_STMT_HEAD = 2,
    EMIT_NEW_HEAD = 8,
    EMIT_VAL = 16;

var ACCESS_FORWARD = 1, ACCESS_EXISTING = 2;

var IF_BLOCK = 1,
    WHILE_BLOCK = 2,
    SIMPLE_BLOCK = 0,
    DO_BLOCK = 4;

var ESCAPE_THROW = -1,
    ESCAPE_RETURN = -2,
    ESCAPE_EXIT_FINALLY = -8;
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
;
// ! ~ - + typeof void delete    % ** * /    - +    << >>
// > <= < >= in instanceof   === !==    &    ^   |   ?:    =       ...


var binPrec = {};

var PREC_WITH_NO_OP = 0;
var PREC_SIMP_ASSIG = PREC_WITH_NO_OP + 1  ;
var PREC_OP_ASSIG = PREC_SIMP_ASSIG + 40 ;
var PREC_COND = PREC_OP_ASSIG + 1;
var PREC_OO = -12 ;

var PREC_BOOL_OR = binPrec['||'] = PREC_COND + 2;
var PREC_BOOL_AND  = binPrec['&&'] = PREC_BOOL_OR + 2 ;
var PREC_BIT_OR = binPrec['|'] = PREC_BOOL_AND + 2 ;
var PREC_XOR = binPrec['^'] =  PREC_BIT_OR + 2;
var PREC_BIT_AND = binPrec['&'] = PREC_XOR + 2;
var PREC_EQUAL = binPrec['==='] =
                 binPrec['!=='] =
                 binPrec['=='] =
                 binPrec['!='] = PREC_BIT_AND + 2;
var PREC_COMP = binPrec['>'] = 
                binPrec['<='] =
                binPrec['<'] =
                binPrec['>='] =
                binPrec['instanceof'] =
                binPrec['in'] = PREC_EQUAL + 2;
var PREC_SH = binPrec['>>'] =
              binPrec['<<'] = PREC_COMP + 2;
var PREC_ADD_MIN = binPrec['+'] =
                   binPrec['-'] = PREC_SH + 2;
var PREC_MUL = binPrec['%'] =
               binPrec['*'] =
               binPrec['/'] = PREC_ADD_MIN + 2;
var PREC_EX = binPrec['**'] = PREC_MUL + 2;
var PREC_U = PREC_EX + 1;

function isAssignment(prec) { return prec === PREC_SIMP_ASSIG || prec === PREC_OP_ASSIG ;  }
function isRassoc(prec) { return prec === PREC_U ; }
function isBin(prec) { return prec !== PREC_BOOL_OR && prec !== PREC_BOOL_AND ;  }
function isMMorAA(prec) { return prec < 0 ;  }
function isQuestion(prec) { return prec === PREC_COND  ; }

function bp(o) {
  ASSERT.call(this, HAS.call(binPrec, o), 'Unknown op');
  return binPrec[o];
}

function isRightAssoc(o) {
  return bp(o) === PREC_U;
}

function isLeftAssoc(o) {
  return !(bp(o) & 1);
}
;
function isArguments(mname) {
  return mname === _m('arguments');
}

function isCalledSuper(mname) {
  return mname === _m('special:supermem');
}

function isMemSuper(mname) {
  return mname === _m('special:supercall');
}

function isNewTarget(mname) {
  return mname === _m('new.target');
}

function isLexicalThis(mname) {
  return mname === _m('special:this');
}
;
var ST_GLOBAL = 1,
    ST_MODULE = ST_GLOBAL << 1,
    ST_SCRIPT = ST_MODULE << 1,
    ST_DECL = ST_SCRIPT << 1,
    ST_CLS = ST_DECL << 1,
    ST_FN = ST_CLS << 1,
    ST_CLSMEM = ST_FN << 1,
    ST_SETTER = ST_CLSMEM << 1,
    ST_GETTER = ST_SETTER << 1,
    ST_STATICMEM = ST_GETTER << 1,
    ST_CTOR = ST_STATICMEM << 1,
    ST_OBJMEM = ST_CTOR << 1,
    ST_ARROW = ST_OBJMEM << 1,
    ST_BLOCK = ST_ARROW << 1,
    ST_CATCH = ST_BLOCK << 1,
    ST_ASYNC = ST_CATCH << 1,
    ST_BARE = ST_ASYNC << 1,
    ST_BODY = ST_BARE << 1,
    ST_METH = ST_BODY << 1,
    ST_EXPR = ST_METH << 1,
    ST_GEN = ST_EXPR << 1,
    ST_HEAD = ST_GEN << 1,
    ST_PAREN = ST_HEAD << 1,

    ST_ACCESSOR = ST_GETTER|ST_SETTER,
    ST_SPECIAL = ST_ACCESSOR|ST_ASYNC|ST_GEN,
    ST_MEM_FN = ST_CTOR|ST_METH|ST_SPECIAL,
    ST_TOP = ST_GLOBAL|ST_MODULE|ST_SCRIPT,
    ST_LEXICAL = ST_BLOCK|ST_CATCH,
    ST_HOISTABLE = ST_DECL,
    ST_ANY_FN = ST_MEM_FN|ST_FN|ST_CTOR|ST_ARROW,
    ST_CONCRETE = ST_TOP|ST_ANY_FN,
    ST_NONE = 0;

var SM_LOOP = 1,
    SM_UNIQUE = SM_LOOP << 1,
    SM_STRICT = SM_UNIQUE << 1,
    SM_INARGS = SM_STRICT << 1,
    SM_INBLOCK = SM_INARGS << 1,
    SM_INSIDE_IF = SM_INBLOCK << 1,
    SM_CLS_WITH_SUPER = SM_INSIDE_IF << 1,
    SM_FOR_INIT = SM_CLS_WITH_SUPER << 1,
    SM_YIELD_KW = SM_FOR_INIT << 1,
    SM_AWAIT_KW = SM_YIELD_KW << 1,
    SM_NONE = 0;

var SA_THROW = 1,
    SA_AWAIT = SA_THROW << 1,
    SA_BREAK = SA_AWAIT << 1,
    SA_RETURN = SA_BREAK << 1,
    SA_YIELD = SA_RETURN << 1,
    SA_CONTINUE = SA_YIELD << 1,
    SA_CALLSUP = SA_CONTINUE << 1,
    SA_MEMSUP = SA_CALLSUP << 1,
    SA_NONE = 0;

var DM_CLS = 1,
    DM_FUNCTION = DM_CLS << 1,
    DM_LET = DM_FUNCTION << 1,
    DM_TEMP = DM_LET << 1,
    DM_VAR = DM_TEMP << 1,
    DM_CONST = DM_VAR << 1,
    DM_SCOPENAME = DM_CONST << 1,
    DM_CATCHARG = DM_SCOPENAME << 1,
    DM_FNARG = DM_CATCHARG << 1,
    DM_NONE = 0;

var RS_ARGUMENTS = _m('arguments'),
    RS_SMEM = _m('special:supermem'),
    RS_SCALL = _m('special:supercall'),
    RS_NTARGET = _m('new.target'),
    RS_LTHIS = _m('special:this');
;
function _m(name) { return name+'%'; }
function _u(name) {
  ASSERT.call(this, name.charCodeAt(name.length-1) === CH_MODULO,
    'only mangled names are allowed to get unmangled');
  return name.substring(0, name.length-1);
}
;

function synth_id_node(name) {
   return { type: 'Identifier', synth: !false, name: name };
}

function synth_expr_node(str) {
   return { type: 'SynthesizedExpr', contents: str, y: 0 };
}

function synth_expr_set_node(arr, isStatement ) {
   if (isStatement)
     return { type: 'SynthesizedExprSet', expressions: arr, y: 0 };

   return { type: 'SequenceExpression', expressions: arr, y: 0 };
}

function assig_node(left, right) {
   if (left.type === 'Identifier' && right.type === 'Identifier')
     if (left.synth && left.name === right.name )
       return left;
  
   return { type: 'AssignmentExpression',  operator: '=', right: right, left: left, y: 0 };
}

function cond_node(e, c, a) {
   return { type: 'ConditionalExpression', 
            test: e,
            consequent: c,
            alternate: a,
            y: 0 };
}

function id_is_synth(n) {
   this.assert(id.type === 'Identifier');
   return n.name.charCodeAt() === CHAR_MODULO;
}

function synth_not_node(n) {
  return { type: 'UnaryExpression', operator: '!', argument: n, y: 0 };

}

function synth_seq_or_block(b, yc, totalY) {
   return { type: 'BlockStatement', body: b, y: yc};
}

var VOID0 = synth_expr_node('(void 0)');
function synth_if_node(cond, body, alternate, yBody, yElse) {
  yBody = yBody || 0;
  yElse = yElse || 0;

  var yc = yBody + yElse;
  if (body.length > 1 || body[0].type === 'IfStatement' )
    body = synth_seq_or_block(body, yBody, yc);
  else
    body = body[0];

  if(alternate)
    alternate = alternate.length > 1 ? synth_seq_or_block(body, yElse, yc) : alternate[0];
  else
    alternate = null;

  return { type: 'IfStatement',
           alternate: alternate ,
           consequent: body, 
           test: cond, y: yBody + yElse };
}

function append_assig(b, left, right) {
  var assig = null;
  if ( right.type !== 'Identifier' || left !== right.name)
    assig = assig_node(synth_id_node(left), right);

  if ( assig ) b.push(assig);
}
   
function append_non_synth(b, nexpr) {
  if (nexpr.type !== 'Identifier' || !nexpr.synth )
    b. push(nexpr);

}

function synth_mem_node(obj, prop, c) {
  return { type: 'MemberExpression',
           computed: c,
           object: obj,
           property: (prop),  
           y: 0 };

}

function synth_call_node(callee, argList) {
   return { type: 'CallExpression', arguments: argList, callee: callee, synth: !false, y: 0 };

}

var FUNC_PROTO_CALL = synth_id_node('call');

function call_call(thisObj, callee, argList) {
   return synth_call_node(
      synth_mem_node(synth_id_node(callee), FUNC_PROTO_CALL, false),
      [synth_id_node(thisObj)].concat(argList)
   );
}
 
function synth_literal_node(value) {
   return { type: 'Literal', value: value };
}

function synth_binexpr(left, o, right, yc) {
   var t = "";
   if ( o === '||' || o === '&&' ) t = 'LogicalExpression'; 
   else if ( o.charAt(o.length-1) === '=' ) switch (o) {
      case '==':
      case '>=': 
      case '<=':
      case '!=':
      case '!==':
      case '===':
         t = 'BinaryExpression';
         break;

      default:
        t = 'AssignmentExpression';
        break;
   }
   else t = 'BinaryExpression';  
    
   return {
     type: t,
     left: left,
     y: yc, 
     right: right,
     operator: o
   };
}

function synth_exprstmt(expr) {
  return { type: 'ExpressionStatement', expression: expr };
}

;
function synth_id(name) { 
  return { type: 'Identifier', name: name }; 
}

function synth_assig(left, right, o) {
  // TODO: (isTemp(left) && left.name === right.name) && ASSERT.call(this, false, 'temp has the same name as var: ' + left.name);
  return (isTemp(left) && left.name === right.name) ? NOEXPR :
    { type: 'AssignmentExpression', operator: o || '=', left: left, right: right, y: -1 };
}

function synth_lit_str(value) {
  ASSERT.call(this, typeof value === typeof "", 'str value not of type string');
  return { type: 'Literal', value: value, raw: '"'+value+'"' };
}

function synth_do_while(cond, body) {
  return { type: 'DoWhileStatement', test: cond, body: body, y: -1 };
}

function synth_mem(obj, prop, c) {
  return { type: 'MemberExpression', computed: c, y: -1, property: prop, object: obj };
}

function synth_call(callee, args) {
  return { type: 'CallExpression', y: -1, callee: callee, arguments: args || [] };
}

function synth_stmt(stmts) {
  return stmts.lenght === 1 ? stmts[0] : synth_block_stmt(stmts);
}
 
function synth_block_stmt(body) {
  return { type: 'BlockStatement', body: body, y: -1 };
}

// TODO: synth_if and synth_cond should become one single function that returns an expression when both consequent and alternate are expressions, and a statement otherwise
function synth_if(cond, c, a) {
  return { type: 'IfStatement', consequent: synth_stmt(c), y: -1, test: cond, alternate: a && a.length ? synth_stmt(a) : null };
}
 
function synth_cond(cond, c, a) {
  return { type: 'ConditionalExpression', consequent: c, y: -1, test: cond, alternate: a };
}

// TODO: maybe generalize synth_call_arrIter_get and synth_call_objIter_get to some 'LeaveUntransformed' type
function synth_call_arrIter_get(iter) {
  var arrIter_get = synth_call(
    synth_mem(iter, synth_id('get')), []);
  arrIter_get.type = 'ArrIterGet';
  return arrIter_get;
}

function synth_call_objIter_get(iter, k) {
  var objIter_get = synth_call(
    synth_mem(iter, synth_id('get')), [k]);
  objIter_get.type = 'ObjIterGet';
  return objIter_get;
}

function synth_assig_explicit(left, right, o) {
  var assig = synth_assig(left, right, o);
  assig.type = 'SyntheticAssignment';
  return assig;
}

function synth_seq(list, isVal) {

  ASSERT.call(this, list.length > 0, 'sequence expressions must not have 0 items');
  return { type: isVal ? 'SynthSequenceExpression' : 'SequenceStatement', expressions: list, y: -1 };
}

function synth_not(expr) {
  return { type: 'UnaryExpression', operator: '!', y: -1, argument: expr };
}

function synth_jz_arguments_to_array() {
  return { type: 'SpecialIdentifier', kind: 'argsToArray' };
}

;
function sentVal() {
  return specialId('sentVal'); 
}
function isSentVal(id) {
  return isspecial(id, 'sentVal');
}

function arrIter() {
  return specialId('arrIter');
}
function wrapArrIter(expr) {
  return { type: 'CallExpression', callee: arrIter(), arguments: [expr] };
}
function isArrIter(id) {
  return isspecial(id, 'arrIter');
}

function objIter() {
  return specialId('objIter');
}
function wrapObjIter(expr) {
  return { type: 'CallExpression', callee: objIter(), arguments: [expr] };
}
function isObjIter(id) {
  return isspecial(id, 'objIter');
}

function unornull() {
  return specialId('unornull');
}
function isUnornull(id) {
  return isspecial(id, 'unornull');
}
function wrapInUnornull(expr) {
  var n = synth_call(unornull(), [expr]);
  n.type = 'Unornull';
  return n;
}

function iterVal(id) {
  return synth_mem(id, synth_id('val'), false);
}

function newTemp(t) {
  return { type: 'SpecialIdentifier', kind: 'tempVar', name: t };
}
function isTemp(id) {
  return isspecial(id, 'tempVar');
}

function specialId(kind) {
  return { type: 'SpecialIdentifier', kind: kind };
}
function isspecial(n, kind) {
  return n.type === 'SpecialIdentifier' && n.kind === kind;
}

function getExprKey(kv) {
  return kv.computed ? kv.key : synth_lit_str(kv.key.name);
}

function push_checked(n, list) {
  if (n !== NOEXPR) list.push(n);
}

function push_if_assig(n, list) {
  if (n && 
    ( n.type === 'AssignmentExpression' || n.type === 'SyntheticAssignment' ) )
    list.push(n);
}

function functionHasNonSimpleParams(fn) {
  var list = fn.params, i = 0;
  while (i < list.length)
    if (list[i++].type !== 'Identifier')
      return true;
  
  return false;
}
;
var transform = {};
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

function fromcode(codePoint )  {
  if ( codePoint <= 0xFFFF)
    return String.fromCharCode(codePoint) ;

  return String.fromCharCode(((codePoint-0x10000 )>>10)+0x0D800,
                             ((codePoint-0x10000 )&(1024-1))+0x0DC00);

}

function core(n) { return n.type === PAREN ? n.expr : n; };

function toNum (n) {
  return (n >= CH_0 && n <= CH_9) ? n - CH_0 :
         (n <= CH_f && n >= CH_a) ? 10 + n - CH_a :
         (n >= CH_A && n <= CH_F) ? 10 + n - CH_A : -1;
}

function createObj(baseObj) {
  function E() {} E.prototype = baseObj;
  return new E();
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
[CatchBodyScope.prototype, [function(){
this.findCatchVar_m = function(mname) {
  var varDecl = this.findDecl_m(mname);
  if (varDecl && varDecl.isCatchVar())
    return varDecl;

  return null;
};

},
function(){
this.receiveRef_m = function(mname, ref) {
  var decl = this.findDecl_m(mname) ||
    this.catchArgs.findDecl_m(mname);
  if (decl)
    decl.absorbRef(ref);
  else
    this.findRef_m(mname, true).absorb(ref);
};

}]  ],
[CatchHeadScope.prototype, [function(){
this.recv = function(mname, ref) {
  return this.defaultRecv(mname, ref);
};

}]  ],
[ClassScope.prototype, [function(){
this.receiveRef_m = function(mname, ref) {
  var decl = null;
  this.findRef_m(mname, true).absorb(ref);
};

}]  ],
[Decl.prototype, [function(){
this.isHoistedInItsScope = function() {
  return this.mode & DM_FUNCTION;
};

this.isVarLike = function() {
  if (this.isFunc())
    return this.ref.scope.isConcrete();
  return this.isVName() ||
         this.isFuncArg();
};

this.isLexical = function() {
  if (this.isFunc())
    return this.ref.scope.isLexical();
  return this.isClass() ||
         this.isLName() ||
         this.isCName();
};

this.isTopmostInItsScope = function() {
  return this.isFuncArg() ||
         this.isCatchArg() ||
         this.isHoistedInItsScope() ||
         this.isVarLike();
};

this.isClass = function() {
  return this.mode & DM_CLS;
};

this.isCatchArg = function() {
  return this.mode & DM_CATCHARG;
};

this.isFunc = function() {
  return this.mode & DM_FUNCTION;
};

this.isFuncArg = function() {
  return this.mode & DM_FNARG;
};

this.isVName = function() {
  return this.mode & DM_VAR;
};

this.isLName = function() {
  return this.mode & DM_LET;
};

this.isCName = function() {
  return this.mode & DM_CONST;
};

this.isName = function() {
  return this.mode &
    (DM_VAR|DM_LET|DM_CONST);
};

this.absorbRef = function(otherRef) {
  ASSERT.call(this, !otherRef.resolved,
    'a resolved reference must not be absorbed by a declref');

  var fromScope = otherRef.scope;
  var cur = this.ref;
  
  if (fromScope.isIndirect()) {
    if (fromScope.isHoisted() &&
        !this.isTopmostInItsScope())
      cur.indirect.fw += ref.total();
    else
      cur.indirect.ex += ref.total()
  } else {
    cur.indirect.ex += ref.indirect.total();
    cur.direct.ex += ref.direct.total();
  }

  return cur;
};

this.m = function(mode) {
  ASSERT.call(this, this.mode === DM_NONE,
    'can not change mode');
  this.mode = mode;
  return this;
};

this.r = function(ref) {
  ASSERT.call(this, this.ref === null,
    'can not change ref');
  this.ref = ref;
  this.i = this.ref.scope.iRef.v++;
  return this;
};

this.n = function(name) {
  ASSERT.call(this, this.name === "",
    'can not change name');
  this.name = name;
  return this;
};

this.s = function(site) {
  ASSERT.call(this, this.site === null,
    'can not change site');
  this.site = site;
  return this;
};

},
function(){
this.str = function() {
  return this.i+':<decl type="'+
         this.typeString()+'">'+this.name+'</decl>';
};

this.typeString = function() {
  var str = "";

  if (this.mode & DM_CLS) str += ":class";
  if (this.mode & DM_FUNCTION) str += ":func";
  if (this.mode & DM_LET) str += ":let";
  if (this.mode & DM_TEMP) str += ":temp";
  if (this.mode & DM_VAR) str += ":var";
  if (this.mode & DM_CONST) str += ":const";
  if (this.mode & DM_SCOPENAME) str += ":scopename";
  if (this.mode & DM_CATCHARG) str += ":catcharg"; 
  if (this.mode & DM_FNARG) str += ":fnarg";  

  return str;
};

this.writeTo = function(emitter) {
  emitter.w(this.str());
};

}]  ],
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
function(n, prec, flags) {
  switch (n.type) {
  case 'ConditionalExpression':
  case 'UnaryExpression':
  case 'BinaryExpression':
  case 'LogicalExpression':
  case 'UpdateExpression':
  case 'ConditionalExpression':
  case 'AssignmentExpression':
  case 'ArrowFunctionExpression':
  case 'SequenceExpression':
  case 'SynthSequenceExpression':
    this.w('(').eA(n, PREC_NONE, EC_NONE).w(')');
    break;
  default: 
    this.emitAny(n, prec, flags);
    break;
  }
};

this.eH = function(n, prec, flags) {
  this.emitHead(n, prec, flags);
  return this;
};

this.emitAny = function(n, prec, startStmt) {
  if (HAS.call(Emitters, n.type))
    return Emitters[n.type].call(this, n, prec, startStmt);
  this.err('unknow.node');
};

this.eA = function(n, prec, startStmt) {
  this.emitAny(n, prec, startStmt); 
  return this; 
};

this.emitNonSeq = function(n, prec, flags) {
  var paren =
    n.type === 'SequenceExpression' ||
    n.type === 'SynthSequenceExpression';
  if (paren) this.w('(');
  this.emitAny(n, prec, flags);
  if (paren) this.w(')');
};

this.eN = function(n, prec, flags) {
  this.emitNonSeq(n, prec, flags);
  return this;
};

this.write = function(rawStr) {
  if (this.lineStarted) {
    this.code += this.getOrCreateIndent(this.indentLevel);
    this.lineStarted = false;
  }
  this.code += rawStr;
};

this.w = function(rawStr) {
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

},
function(){
Emitters['UpdateExpression'] = function(n, prec, flags) {
  var o = n.operator;
  if (n.prefix) {
    if (this.code.charCodeAt(this.code.length-1) === o.charCodeAt(0))
      this.s();
    this.w(o).eH(n.argument);
  } else
    this.eH(n.argument, PREC_NONE, flags).w(o);
};

},
function(){
Emitters['ArrayExpression'] = function(n, prec, flags) {
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
Emitters['SyntheticAssignment'] =
Emitters['AssignmentExpression'] =
this.emitAssig = function(n, prec, flags) {
  this.emitAssigLeft(n.left, flags);
  this.wm(' ',n.operator,' ');
  this.emitAssigRight(n.right);
};

this.emitAssigLeft = function(n, flags) {
  return this.emitHead(n, PREC_NONE, flags);
};

this.emitAssigRight = function(n) {
  this.eN(n, PREC_NONE, EC_NONE);
};

},
function(){
Emitters['BinaryExpression'] =
Emitters['LogicalExpression'] =
this.emitBinary = function(n, prec, flags) {
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
    return this.emitAny(n, PREC_NONE, flags);
    
  return this.emitHead(n, PREC_NONE, flags);
};

this.emitRight = function(n, ownerO, flags) {
  var childO = n.operator, paren = false;

  // previous op has higher prec because it has higher prec
  if (bp(childO) < bp(ownerO))
    paren = true;

  // previous op has higher prec because it is the previous op
  else if (bp(childO) === bp(ownerO))
    paren = isLeftAssoc(ownerO);

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
  if (list.length > 0) {
    this.i();
    var i = 0;
    while (i < list.length) {
      this.l().eA(list[i], PREC_NONE, EC_NONE);
      i++;
    }
    this.u().l();
  }
  this.w('}');
};

},
function(){
Emitters['ObjIterGet'] =
Emitters['Unornull'] =
Emitters['ArrIterGet'] =
Emitters['CallExpression'] = function(n, prec, flags) {
  var ri = spreadIdx(n.arguments, 0); 
  if (ri !== -1)
    return this.emitCallWithSpread(n, flags, ri);
  
  var paren = flags & EC_NEW_HEAD;
  if (paren) {
    prec = PREC_NONE;
    flags = EC_NONE;
    this.w('(');
  }

  this.eH(n.callee, prec, flags);
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
    this.wm('jz','.','meth','(')
        .wm('jz','.','b','(')
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
Emitters['ConditionalExpression'] = function(n, prec, flags) {
  this.emitCondTest(n.test, flags);
  this.wm(' ','?',' ').eN(n.consequent, PREC_NONE, EC_NONE);
  this.wm(' ',':',' ').eN(n.alternate, PREC_NONE, EC_NONE);
};

this.emitCondTest = function(n, prec, flags) {
  var paren = false;
  switch (n.type) {
  case 'AssignmentExpression':
  case 'ConditionalExpression':
    paren = true;
  }

  if (paren) { this.w('('); flags = EC_NONE; }
  this.eN(n, PREC_NONE, flags);
  if (paren) this.w(')');
};

},
function(){
Emitters['DoWhileStatement'] = function(n, prec, flags) {
  this.w('do').emitDependentStmt(n.body);
  if (n.body.type !== 'BlockStatement')
    this.l();
  this.wm('while',' ','(').eA(n.test, PREC_NONE, EC_NONE).w(')');
};

},
function(){
Emitters['ExpressionStatement'] = function(n, prec, flags) {
  this.eA(n.expression, PREC_NONE, EC_START_STMT);
  if (n.expression.type !== 'SequenceStatement')
    this.w(';');
};

},
function(){
Emitters['FunctionExpression'] =
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
  this.wm(')',' ').emitAny(n.body, PREC_NONE, EC_NONE);
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
}

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
  this.eH(n.object, prec, flags);

  if (n.computed)
    this.w('[').eA(n.property, PREC_NONE, EC_NONE).w(']');
  else if (this.isReserved(n.property.name)) {
    this.w('[').emitStringLiteralWithRawValue("'"+n.property.name+"'");
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
  this.wm('new',' ').eH(n.callee, PREC_NONE, EC_NEW_HEAD);
  this.w('(').emitArgList(n.arguments);
  this.w(')');
};

this.emitArgList = function(argList) {
  var i = 0;
  while (i < argList.length) {
    if (i>0) this.w(',',' ');
    this.eN(argList[i], PREC_NONE, EC_NONE);
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
  var list = n.body, i = 0;
  while (i < list.length) {
    var stmt = list[i++];
    i > 0 && this.startLine();
    this.emitAny(stmt, PREC_NONE, EC_START_STMT);
  }
};

},
function(){
Emitters['ReturnStatement'] = function(n, prec, flags) {
  this.w('return');
  if (n.argument)
    this.noWrap().s().emitAny(n.argument);
  this.w(';');
};

},
function(){
Emitters['SynthSequenceExpression'] =
Emitters['SequenceExpression'] = function(n, prec, flags) {
  var list = n.expressions, i = 0;
  this.eN(list[i], prec, flags);
  i++;
  while (i < list.length) {
    this.wm(',',' ').eN(list[i], PREC_NONE, EC_NONE);
    i++;
  }
};

},
function(){
Emitters['SpecialIdentifier'] = function(n, prec, flags) {
  switch (n.kind) {
  case 'tempVar':
    return this.writeIdentifierName(n.name);
  case 'unornull':
    this.wm('jz','.','uon');
    return;
  default:
    this.writeIdentifierName(n.kind);
    return;
  }
};

},
function(){
Emitters['SwitchStatement'] = function(n, prec, flags) {
  this.wm('switch',' ','(')
      .eA(n.discriminant, PREC_NONE, EC_NONE)
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
        .eA(c.test, PREC_NONE, EC_NONE)
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
Emitters['SequenceStatement'] = function(n, prec, flags) {
  var list = n.expressions, i = 0;
  while (i < list.length) {
    if (i > 0) this.l();
    this.emitAsStmt(list[i++]);
  }
};

this.emitAsStmt = function(seqElem) {
  switch (seqElem.type) {
  case 'AssignmentExpression':
  case 'SyntheticAssignment':
  seqElem = synth_exprstmt(seqElem);
  }

  this.emitAny(seqElem, PREC_NONE, EC_NONE);
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
    this.emitAny(n, PREC_NONE, EC_NONE);
  else
    this.eH(n, PREC_NONE, EC_NONE);
};

},
function(){
Emitters['WhileStatement'] = function(n, prec, flags) {
  this.wm('while',' ','(').eA(n.test, PREC_NONE, EC_NONE)
      .w(')').emitDependentStmt(n.body, false);
};

},
function(){
this.isReserved = function(idString) { return false; };

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
[FuncBodyScope.prototype, [function(){


},
function(){
this.receiveRef_m = function(mname, ref) {
  var decl = 
    isArguments(mname) ? this.getArguments() :
    isCalledSuper(mname) ? this.getCalledSuper() :
    isMemSuper(mname) ? this.getMemSuper() :
    isNewTarget(mname) ? this.getNewTarget() :
    isLexicalThis(mname) ? this.getLexicalThis() :
    this.funcHead.findDecl_m(mname);

  if (decl)
    decl.absorbRef(ref);
  else
    this.findRef_m(mname, true).absorb(ref);
};

},
function(){
this.getArguments = function() {
  if (this.isArrowComp())
    return null;
  if (!this.special.arguments) {
    var decl = new Decl(),
        ref = this.findRef_m(RS_ARGUMENTS, true);
    this.special.arguments =
      decl.r(ref).n(_u(RS_ARGUMENTS));
  }

  return this.special.arguments;
};

this.getMemSuper = function() {
  if (this.isArrowComp())
    return null;

  // TODO: object must have a scope that intercepts
  // the references to supermem
  if (this.isObjMem())
    return objectSuper();

  ASSERT.call(
    this,
    this.isClassMem(),
    'only methmems can have supmem');

  if (!this.parent.special.calledSuper) {
    var decl = new Decl(),
        ref = this.findRef_m(RS_SMEM, true);
    this.parent.special.smem =
      decl.r(ref).n(_u(RS_SMEM));
  }

  return this.parent.special.smem;
};

this.getCalledSuper = function() {
  if (this.isArrowComp())
    return null;

  ASSERT.call(
    this,
    this.isCtor(),
    'only a constructor is allowed to call super');

  ASSERT.call(
    this,
    this.parent.isClass(),
    'a ctor can only have a parent of type class');

  if (!this.parent.special.scall) {
    var decl = new Decl(),
        ref = this.findRef_m(RS_SCALL, true);
    this.parent.special.scall = 
      decl.r(ref).n(_u(RS_MEM));
  }

  return this.parent.special.scall;
};

this.getNewTarget = function() {
  if (this.isArrowComp())
    return null;

  if (!this.special.newTarget) {
    var decl = new Decl(),
        ref = this.findRef_m(RS_NTARGET, true);
    this.special.newTarget =
      decl.r(ref).n(_u(RS_NTARGET));
  }

  return this.special.newTarget;
};

this.getLexicalThis = function() {
  if (this.isArrowComp())
    return null;

  if (!this.special.lexicalThis) {
    var decl = new Decl(),
        ref = this.findRef_m(RS_LTHIS, true);
    this.special.lexicalThis =
      decl.r(ref).n(_u(RS_LTHIS));
  }

  return this.special.lexicalThis;
};

}]  ],
[FuncHeadScope.prototype, [function(){
this.verifyForStrictness = function() {
  if (this.firstDup)
    this.parser.err('argsdup');
  if (this.firstNonSimple)
    this.parser.err('non.simple');

  var list = this.paramList, i = 0;
  while (i < list.length) {
    var elem = list[i];
    if (arguments_or_eval(elem.name))
      this.err('binding.eval.or.arguments.name');
    this.parser.validateID(elem.name);
    i++ ;
  }
};

this.exitUniqueArgs = function() {
  ASSERT.call(this, this.insideUniqueArgs(),
    'can not unset unique when it has not been set');

  this.mode &= ~SM_UNIQUE;
};

this.enterUniqueArgs = function() {
  if (this.firstDup)
    this.parser.err('argsdup');
  if (this.insideUniqueArgs())
    return;

  this.mode |= SM_UNIQUE;
};

this.absorb = function(parenScope) {
  ASSERT.call(this, this.isArrowComp() && this.isHead(),
    'the only scope allowed to take in a paren is an arrow-head');
  ASSERT.call(this, parenScope.isParen(),
    'the only scope that can be absorbed into an arrow-head is a paren');

  parenScope.parent = this;

  this.firstNonSimple = parenScope.firstNonSimple;
  this.firstDup = parenScope.firstDup;
  this.refs = parenScope.refs;
  if (this.firstDup)
    this.parser.err('argsdup');

  this.paramMap = parenScope.paramMap;
  this.paramList = parenScope.paramList;

  this.headI = parenScope.headI;
  this.tailI = parenScope.tailI;

  var list = this.paramList, i = 0;
  while (i < list.length)
    list[i++].ref.direct.fw--; // one ref is a decls
};

this.writeTo = function(emitter) {
  var list = this.paramList, i = 0;
  emitter.w(this.headI+':<arglist type="'+this.typeString()+'">');
  if (list.length !== 0) {
    emitter.i();
    while (i < list.length) {
      emitter.l();
      list[i++].writeTo(emitter);
    }
    emitter.u().l();
  }
  emitter.w(this.tailI+':</arglist>');
};

},
function(){
this.receiveRef_m = function(mname, ref) {
  return this.defaultReceive_m(mname, ref);
};

}]  ],
[GlobalScope.prototype, [function(){
this.defineGlobal_m = function(mname, ref) {
  var newDecl = null, globalRef = this.findRef_m(mname, true);
  newDecl = new Decl().r(globalRef).n(_u(mname));
  globalRef.absorb(ref);
  globalRef.resolve();
};
  
this.receiveRef_m = function(mname, ref) {
  this.defineGlobal_m(mname, ref);
};

},
function(){
this.moduleScope = function() {
  return new Scope(this, ST_MODULE);
};

this.scriptScope = function() {
  return new Scope(this, ST_SCRIPT);
};

}]  ],
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
[LexicalScope.prototype, [function(){
this.receiveRef_m = function(mname, ref) {
  this.defaultReceive_m(mname, ref);
};

},
function(){


}]  ],
[ParenScope.prototype, [function(){
this.dissolve = function() {
  var list = this.paramList,
      i = 0,
      ref = null,
      elem = null;

  var refs = this.refs, parent = this.parent;
  list = refs.keys, i = 0;
  while (i < list.length) {
    var mname = list[i];
    elem = refs.get(mname),
    ref = parent.findRef_m(mname, true);

    if (ref.resolved)
      ref.resolved = false;

    ref.direct.fw += elem.direct.fw; 
    ref.direct.ex += elem.direct.ex;

    ref.indirect.fw += elem.indirect.fw;
    ref.indirect.ex += elem.indirect.ex;

    i++;
  }
};

this.addPossibleArgument = function(argNode) {
  var head = null;

  if (argNode.type === 'Property')
    argNode = argNode.value;

  if (argNode.type === 'Identifier')
    head = argNode;
//else if (
//  argNode.type === 'AssignmentExpression' &&
//  argNode.left.type === 'Identifier')
//  head = argNode.left;
  else if (
    argNode.type === 'SpreadElement' &&
    argNode.argument.type === 'Identifier')
    head = argNode.argument;

  if (!head)
    return;

  var name = head.name;
  var mname = _m(name);

  var existing = HAS.call(this.paramMap, mname) ?
    this.paramMap[mname] : null;

  var newDecl = new Decl().m(DM_FNARG).n(name);

  if (existing) {
    if (!this.firstDup)
      this.firstDup = newDecl;
  }
  else {
    var ref = this.findRef_m(mname, true);
    switch (name) {
    case 'arguments':
    case 'eval':
      if (!this.firstNonSimple)
        this.firstNonSimple = newDecl;
    }
    newDecl.r(ref);
    ref.resolve();
    this.paramMap[mname] = newDecl;
  }

  this.paramList.push(newDecl);
};

this.finish = function() {};

},
function(){
this.receiveRef_m = function(mname, ref) {
  this.defaultReceive_m(mname, ref);
};

}]  ],
[Parser.prototype, [function(){
this .ensureSimpAssig_soft = function(head) {
  switch(head.type) {
  case 'Identifier':
    if ( this.scope.insideStrict() && arguments_or_eval(head.name) )
      this.err('assig.to.arguments.or.eval');

  case 'MemberExpression':
    return true ;

  default:
    return false ;

  }
};

this.ensureSpreadToRestArgument_soft = function(head) {
  return head.type !== 'AssignmentExpression';
};



},
function(){
this.onComment = function(isBlock,c0,loc0,c,loc) {
  var start_comment = -1, end_comment = -1;
  var start_val = -1, end_val = -1;
  if (isBlock) {
    start_comment = c0 - 2; end_comment = c;
    start_val = c0; end_val = c - 2;
    loc0.column -= 2;
  }
  else {
    var stepBack = -1;
    switch (this.src.charCodeAt(c0-1)) {
    case CH_DIV: // i.e, // comment
      stepBack = 2;
      break;
    case CH_GREATER_THAN: // i.e, --> comment
      stepBack = 1 + 2;
      break;
    case CH_MIN: // i.e, <!-- comment
      stepBack = 2 + 2;
      break;
    }

    start_comment = c0 - stepBack;
    end_comment = c;
    start_val = c0;
    end_val = c;
    loc0.column -= stepBack;
  
  }

  var comment = this.onComment_,
      value = this.src.substring(start_val,end_val);

  if (typeof comment === FUNCTION_TYPE) {
    comment(isBlock,value,c0,c,loc0,loc);
  }
  else {
    comment.push({
      type: isBlock ? 'Block' : 'Line',
      value: value,
      start: start_comment,
      end: end_comment,
      loc: { start: loc0, end: loc }
    });
  }
};

this.onToken = function(token) {
  if (token === null) {
    var ttype = "", tval = "";
    switch (this.lttype) {
    case 'op':
    case '--':
    case '-':
    case '/':
      ttype = 'Punctuator';
      tval = this.ltraw;
      break;

    case 'yield':
    case 'Keyword':
      ttype = 'Keyword';
      tval = this.ltval;
      break;

    case 'u':
      ttype = 'Punctuator';
      tval = this.ltraw;
      break;

    case 'Literal':
      ttype = typeof this.ltval === NUMBER_TYPE ?
        'Numeric' : 'String';
      tval = this.ltraw;
      break;

    case 'Identifier':
      ttype = 'Identifier';
      tval = this.ltraw;
      switch (tval) {
      case 'static':
        if (!this.scope.insideStrict()) 
          break;
      case 'in':
      case 'instanceof':
        ttype = 'Keyword';
      }
      break;

    case 'Boolean':
    case 'Null':
      ttype = this.lttype;
      tval = this.ltval;
      break;

    default:
      ttype = 'Punctuator';
      tval = this.lttype;
      break;
    }

    token = { type: ttype, value: tval, start: this.c0, end: this.c,
      loc: {
        start: { line: this.li0, column: this.col0 },
        end: { line: this.li, column: this.col } } };
  }
  else {
    if (token.type === 'Identifier' &&
       token.value === 'static')
      token.type = 'Keyword';
  }

  var onToken_ = this.onToken_;
  if (typeof onToken_ === FUNCTION_TYPE) {
    onToken_(token);
  }
  else
    onToken_.push(token);

};

this.onToken_kw = function(c0,loc0,val) {
  // TODO: val must=== raw
  this.onToken({
    type: 'Keyword',
    value: val,
    start: c0,
    end: c0+val.length,
    loc: {
      start: loc0,
      end: { line: loc0.line, column: loc0.column + val.length }
    }
  });
};

},
function(){
this.asArrowFuncArgList = function(argList) {
  var i = 0, list = argList;
  while (i < list.length)
    this.asArrowFuncArg(list[i++]);
};

this.asArrowFuncArg = function(arg) {
  var i = 0, list = null;
  if (arg === this.po)
    this.throwTricky('p', this.pt);

  switch  ( arg.type ) {
  case 'Identifier':
    if (this.scope.canAwait() &&
       arg.name === 'await')
      this.err('arrow.param.is.await.in.an.async',{tn:arg});
     
    // TODO: this can also get checked in the scope manager rather than below
    if (this.scope.insideStrict() && arguments_or_eval(arg.name))
      this.err('binding.to.arguments.or.eval',{tn:arg});

//  this.scope.declare(arg.name, DM_FNARG);
    return;

  case 'ArrayExpression':
    list = arg.elements;
    while (i < list.length) {
      if (list[i])
        this.asArrowFuncArg(list[i]);
      i++;
    }
    arg.type = 'ArrayPattern';
    return;

  case 'AssignmentExpression':
//  if (arg.operator !== '=')
//    this.err('complex.assig.not.arg');

    this.asArrowFuncArg(arg.left);
    delete arg.operator ;
    arg.type = 'AssignmentPattern';

    return;

  case 'ObjectExpression':
    list = arg.properties;
    while (i < list.length)
      this.asArrowFuncArg(list[i++].value );

    arg.type = 'ObjectPattern';
    return;

  case 'AssignmentPattern':
    this.asArrowFuncArg(arg.left) ;
    return;

  case 'ArrayPattern' :
    list = arg.elements;
    while ( i < list.length ) {
      if (list[i])
        this.asArrowFuncArg(list[i]);
      i++ ;
    }
    return;

  case 'SpreadElement':
    if (this.v < 7 && arg.argument.type !== 'Identifier')
      this.err('rest.binding.arg.not.id', {tn:arg});
    this.asArrowFuncArg(arg.argument);
    arg.type = 'RestElement';
    return;

  case 'RestElement':
    if (this.v < 7 && arg.argument.type !== 'Identifier')
      this.err('rest.binding.arg.not.id',{tn:arg});
    this.asArrowFuncArg(arg.argument);
    return;

  case 'ObjectPattern':
    list = arg.properties;
    while (i < list.length)
      this.asArrowFuncArg(list[i++].value);
    return;

  default:
    this.err('not.bindable');

  }
};


},
function(){
this.toAssig = function(head, context) {
  if (head === this.ao)
    this.throwTricky('a', this.at, this.ae)

  var i = 0, list = null;
  switch (head.type) {
  case 'Identifier':
    if (this.scope.insideStrict() && arguments_or_eval(head.name)) {
      if (this.st === ERR_ARGUMENTS_OR_EVAL_DEFAULT)
        this.st = ERR_NONE_YET;
      if (this.st === ERR_NONE_YET) {
        this.st = ERR_ARGUMENTS_OR_EVAL_ASSIGNED;
        this.se = head;
      }
//    if (context & CTX_NO_SIMPLE_ERR)
//      this.currentExprIsSimple();
    }
    return;

  case 'MemberExpression':
    return;

  case 'ObjectExpression':
    if (this.v <= 5) this.err('ver.pat.obj',{tn:head});
    i = 0; list = head.properties;
    while (i < list.length)
      this.toAssig(list[i++], context);
    head.type = 'ObjectPattern';
    return;

  case 'ArrayExpression':
    if (this.v <= 5) this.err('ver.pat.arr',{tn:head});
    i = 0; list = head.elements;
    while (i < list.length) {
      list[i] && this.toAssig(list[i], context);
      i++ ;
    }
    head.type = 'ArrayPattern';
    return;

  case 'AssignmentExpression':
    // TODO: operator is the one that must be pinned,
    // but head is pinned currently
    if (head.operator !== '=')
      this.err('complex.assig.not.pattern');

    // TODO: the left is not re-checked for errors
    // because it is already an assignable pattern;
    // this requires keeping track of the latest
    // ea error, in order to re-record it if it is
    // also the first error in the current pattern
    if (this.st === ERR_ARGUMENTS_OR_EVAL_DEFAULT &&
       head === this.so) {
      this.st = ERR_NONE_YET;
      this.toAssig(this.se);
    }

    head.type = 'AssignmentPattern';
    delete head.operator;
    return;

  case 'SpreadElement':
    if (head.argument.type === 'AssignmentExpression')
      this.err('rest.arg.not.valid',{tn:head});
    this.toAssig(head.argument, context);
    head.type = 'RestElement';
    return;

  case 'Property':
    this.toAssig(head.value, context);
    return;

  default:
    this.err('not.assignable',{tn:core(head)});
 
  }
};



},
function(){
this.onErr = function(errorType, errParams) {
   var message = "";
   if (!HAS.call(ErrorBuilders, errorType))
     message = "Error: " + errorType + "\n" +
       this.src.substr(this.c-120,120) +
       ">>>>" + this.src.charAt(this.c+1) + "<<<<" +
       this.src.substr(this.c, 120);

   else {
     var errorBuilder = ErrorBuilders[errorType];  
     var errorInfo = this.buildErrorInfo(errorBuilder, errParams);

     var offset = errorInfo.c0,
         line = errorInfo.li0,
         column = errorInfo.col0,
         errMessage = errorInfo.messageTemplate.applyTo(errParams);

     message += "Error: "+line+":"+column+" (src@"+offset+"): "+errMessage;

     // TODO: add a way to print a 'pin-range', i.e., the particular chunk of the
     // source code that is causing the error
   }

   throw new Error(message);
};
  
// TODO: find a way to squash it with normalize
this.buildErrorInfo = function(builder, params) {
  if (builder.preprocessor !== null)
    builder.preprocessor.call(params);

  var errInfo = {
    messageTemplate: builder.messageTemplate,
    c: -1, li: -1, col: -1,
    c0: -1, li0: -1, col0: -1,
    parser: params['parser'],
    extra: params.extra
  };

  var cur0 = params.cur0, cur = params.cur;

  if (HAS.call(builder, 'tn')) {
    var tn = builder.tn.applyTo(params);
    if (HAS.call(tn,'start')) cur0.c = tn.start;
    if (HAS.call(tn,'end')) cur.c = tn.end;
    if (HAS.call(tn,'loc')) {
      if (HAS.call(tn.loc, 'start')) {
        cur0.loc.li = tn.loc.start.line;
        cur0.loc.col = tn.loc.start.column;
      }
      if (HAS.call(tn.loc, 'end')) {
        cur.loc.li = tn.loc.end.line;
        cur.loc.col = tn.loc.end.column;
      }
    }
  }

  if (HAS.call(builder, 'cur0'))
    cur0 = builder.cur0.applyTo(params);

  if (HAS.call(builder, 'cur'))
    cur = builder.cur.applyTo(params);

  if (HAS.call(builder, 'loc0'))
    cur0.loc = builder.loc0.applyTo(params);

  if (HAS.call(builder, 'loc'))
    cur.loc = builder.loc.applyTo(params);

  if (HAS.call(builder, 'li0'))
    cur0.loc.li = builder.li0.applyTo(params);

  if (HAS.call(builder, 'li'))
    cur.loc.li = builder.li.applyTo(params);

  if (HAS.call(builder, 'col0'))
    cur0.loc.col = builder.col0.applyTo(params);

  if (HAS.call(builder, 'col'))
    cur.loc.col = builder.col.applyTo(params);

  if (HAS.call(builder, 'c0'))
    cur0.c = builder.c0.applyTo(params);

  if (HAS.call(builder, 'c'))
    cur.c = builder.c.applyTo(params);

  errInfo.c0 = cur0.c; errInfo.li0 = cur0.loc.li; errInfo.col0 = cur0.loc.col;
  errInfo.c = cur.c; errInfo.li = cur.loc.li; errInfo.col = cur.loc.col;

  return errInfo;
};

var ErrorBuilders = {};
function a(errorType, builderOutline) {
  if (HAS.call(ErrorBuilders, errorType))
    throw new Error('Error type has already got a builder: <'+errorType+'>');
  var builder = {preprocessor:null};
  for (var name in builderOutline) {
    if (name === 'm')
      builder.messageTemplate = ErrorString.from(builderOutline[name]);
    else if (name === 'p')
      builder.preprocessor = builderOutline.p; 
    else
      builder[name] = Template.from(builderOutline[name]);
  }

  ErrorBuilders[errorType] = builder;

  return builder;
}

function set(newErrorType, existingErrorType) {
  if (HAS.call(ErrorBuilders, newErrorType))
    throw new Error('cannot override the existing <'+
      newErrorType+'> with <'+existingErrorType);
  if (!HAS.call(ErrorBuilders, existingErrorType))
    throw new Error('error is not defined: <'+existingErrorType+'>');
  
  var builder = ErrorBuilders[existingErrorType];
  ErrorBuilders[newErrorType] = builder;

  return builder;
}

// TODO: the argument that is coming last is a sample error code; builders must have this value as a property.
// also a list of options may come after each of these "samples" signifying which options they should be parsed with

a('arg.non.tail', {c0:'c0', li0:'li0',col0:'col0', m: 'unexpected comma -- tail arguments not allowed in versions before 7'}, 'a(b,)');

a('arg.non.tail.in.func', {c0:'c0',li0:'li0',col0:'col0', m: 'unexpected comma -- tail parameters not allowed in versions before 7'}, 'function a(b,) {}', '(a,)=>b');

a('array.unfinished', {c0:'parser.c0', li0: 'parser.li0', col0: 'parser.col0', m: 'a \']\' was expected -- got {parser.lttype}'}, '[a 12');

a('arrow.has.a.paren.async', {tn: 'parser.parenAsync', m: '\'async\' can not have parentheses around it (the \'=>\' at {parser.li0}:{parser.col0} (offset {parser.c0}) requires this to hold'}, '(async)(a,b)=>12');

a('arrow.newline.before.paren.async', {tn:'parser.pe', m: '\'async\' of an async can not have a newline after it'}, 'async\n(a)=>12');

a('arrow.arg.is.await.in.an.async', {tn:'tn', m: 'await is not allowed as an async arrow\'s parameter'}, 'async(a=await)=>12');

a('arrow.missing.after.empty.list', {c0:'parser.se.end', li0:'parser.se.loc.end.line', col0: 'parser.se.loc.end.column', m:'unexpected \')\''}, '()');

a('assig.not.first', {c0:'parser.c0', li0:'parser.li0', col0:'parser.col0', m: 'Unexpected \'=\''}, 'a-b=12');

a('assig.not.simple', {tn:'tn', m: 'an identifier or a member expression was expected; instead got a {tn.type}'}, '([a])--');

a('assig.to.arguments.or.eval', {tn:'parser.se', m:'can not assign to {parser.se.name} while in strict mode'}, '"use strict"; [arguments] = 12');

a('async.gen.not.yet.supported', {c0:'parser.c0', li0:'parser.li0',col0:'parser.col0', m:'unexpected \'*\' -- async generators not yet supported'}, 'async function *l() {}');

a('async.newline', {c0:'parser.c0',li0:'parser.li0',col0:'parser.col0',m:'unexpected newline after async -- async modifier in an object can not have a newline after it'}, '({async l(){}})');

a('await.args', {c0:'parser.c0',li0:'parser.li0',col0:'parser.col0',m:'an async function may not contain \'await\' anywhere in its parameter list'}, 'async function l(e=[await]) {}', 'async function l(await) {}');

// TODO: await.label

a('await.in.strict', {c0:'parser.c0',li0:'parserl.li0',col0:'parser.col0',m: 'await is a reserved word when in a module, no matter it is in an async function or not'}, 'await = 12');

a('rest.binding.arg.not.id', {tn:'tn.argument',m:'binding rests can only have an argument of type \'Identifier\'(which {tn.argument.type} isn\'t) in versions before 7; current version is {parser.v}.'}, 'function a(...[b]){}');

a('binding.to.arguments.or.eval',{tn:'tn',m:'invalid binding name in strict mode: {tn.name}'}, '"use strict"; (arguments)=>12');

a('<unfinished>', {'tn':'tn', m:'unexpected {parser.lttype} -- a {extra.delim} was expected to end the {tn.type} at {tn.loc.start.line}:{tn.loc.start.column} (offset {tn.start})'});

set('block.dependent.is.unfinished', '<unfinished>', 'try { 12');

a('block.dependent.no.opening.curly', {c0:'parser.c0', li0:'parser.li', col0: 'parser.col0', m:'unexpected {parser.lttype} after {extra.name} -- expected {}'}, 'try 12');

set('block.unfinished', '<unfinished>');

a('break.no.such.label',{tn:'tn',m:'no such label: {tn.name}'}, 'while (false) break L;');

a('break.not.in.breakable', {c0:'c0',li0:'li0',col0:'col0',m:'breaks without any targets can only appear inside an iteration statement or a switch'}, 'break;');

set('call.args.is.unfinished', '<unfinished>');

a('catch.has.no.end.paren',{c0:'c0',li0:'li0',col0:'col0',m:'unexpected {parser.lttype} -- a ) was expected'}, 'try {} catch (a) { 12');

a('catch.has.no.opening.paren',{c0:'c0',li0:'li0',col0:'col0',m:'unexpected {parser.lttype} -- a ( was expected'}, 'try {} catch 12');

a('catch.has.an.asiig.param',{c0:'c0',li0:'li0',col0:'col0',m:'the parameter for a catch clause can not be an assignment pattern'},'try{} catch(a=12){}');

a('catch.has.no.param',{c0:'c0',li0:'li0',col0:'col0',m:'a catch clause must have a parameter'}, 'try{} catch(){}');

a('class.constructor.is.a.dup', {tn:'tn',m:'this class has already got a constructor'}, 'class A{constructor(){} constructor(){}}');

// TODO: what about this: class A { static get constructor() {} }
a('class.constructor.is.special.mem',{tn:'tn',m:'a class member named constructor (or \'constructor\') can not be a getter, generator, setter, or async. (it can be a static member, though.)'}, 'class A{get constructor(){}}');

a('class.decl.has.no.name',{c0:'c0',li0:'li0',col0:'col0',m:'this context requires that the class declaration has a name'}, 'class {}');

a('class.decl.not.in.block',{c0:'c0',li0:'li0',col0:'col0',m:'this scope can not contain a class declaration -- block scope (i.e, those wrapped between {} and }), module scope, and script scope are the only ones that can.'}, 'if (false) class{}');

a('class.label.not.allowed',{c0:'parser.c0',li0:'parser.li0',col0:'parser.col0',m:'can not label a class'}, 'L: class A{}');

a('class.no.curly',{c0:'c0',li0:'li0',col0:'col0',m:'a {} was expected -- got {parser.lttype} instead'},'class L 12');

a('class.prototype.is.static.mem',{tn:'tn',m:'class can not have a static member named prototype'},'class A{static prototype() {}}');

a('class.super.call',{tn:'tn',m:'can not call super in this context'},'class A{constructor(){var a = super()}');

a('class.super.lone',{tn:'tn',m:'unexpected {parser.lttype} after \'super\' -- a "(" or "." or "[" was expected'}, 'class A extends B { constructor() { (super * 12); }}');

a('class.super.mem',{tn:'tn',m:'member access from super not allowed in this context -- super member access must only occur inside an object method or inside a non-static class member'}, 'class A { static b() { (super.l()); }');

set('class.unfinished', '<unfinished>');

a('comment.multi.unfinished', {c0:'parser.c',li0:'parser.li',col0:'parser.col',m:'reached eof before finding a matching */ for the multiline comment at {extra.li0}:{extra.col0} (offset {extra.c0})'},'/* 12');

// TODO: tell what was got
a('complex.assig.not.pattern',{c0:'c0',li0:'li0',col0:'col0',m:'a \'=\' was expected'},'(a-=12)=>12');

a('cond.colon',{c0:'parser.c0',li0:'parser.li0',col0:'parser.col0',m:'a \':\' was expected; got {parser.lttype}'}, 'a ? b 5');

a('const.has.no.init',{c0:'c0',li0:'li0',col0:'col0',m:'a \'=\' was expected, got {parser.lttype} -- the declarator at {extra.e.loc.start.line}:{extra.e.loc.start.column} (offset {extra.e.start}) is a const  declarator and needs an initialiser.'},'const a' );

a('const.not.in.v5',{c0:'parser.c0',li0:'parser.li0',col0:'parser.col0',m:'in versions before ES2015 (current version is {parser.v}), const is a reserved word and can\'t be an actual identifier reference.'}, 'a * const');

a('continue.no.such.label',{tn:'tn', m:'no such label: {tn.name}'},'while (false) continue L;');

a('continue.not.a.loop.label',{tn:'tn',m:'label {tn.name} is not referring to a loop -- a continue\'s label, if any, must refer to a loop.'},'while (false)L:if(false)continue L;');

a('continue.not.in.loop',{c0:'parser.c0',li0:'parser.li0',col0:'parser.col0',m:'continue is not allowed in this context -- it has to appear in loops only'},'is (false) continue;');

a('decl.label', {c0:'c0',li0:'li0',col0:'col0',m:'{parser.ltval} declarations can not have labels'}, 'L: const a = 12;');

a('delete.arg.not.a.mem',{tn:'tn',m:'when in strict mode code, the delete operator must take a member expression as argument; currently, its argument is a {tn.type}'},  '"use strict"; a * (delete l)');

a('<closing>', {c0:'parser.c0',li0:'parser.li0',col0:'parser.col0',m:'a ) was expected; got {parser.lttype}'});

set('do.has.no.closing.paren', '<closing>');

a('<opening>', {c0:'parser.c0',li0:'parser.li0',col0:'parser.col0',m:'a ( was expected; got {parser.lttype}'});

set('do.has.no.opening.paren', '<opening>');

a('do.has.no.while',{c0:'parser.c0',li0:'parser.li0',col0:'parser.col0',m:'while expected; got {parser.lttype}'}, 'do {};');

a('esc.8.or.9',{c0:'parser.c',li0:'parser.li',col0:'parser.col0',m:'escapes \\8 or \\9 are not syntactically valid escapes'},'"\\8"');

a('exists.in.current',{tn:'tn',m:'\'{tn.name}\' has been actually declared at {extra.loc.start.line}:{extra.loc.start.column} (offset {extra.start})'},'let a;{var a;}');

a('export.all.no.from', {c0:'parser.c0',li0:'parser.li0',col0:'parser.col0',m:'\'from\' expected; got {parser.ltval}'}, 'export * not \'12\'');

a('export.all.not.*', {c0:'parser.c0',li0:'parser.li0',col0:'parser.col0',m:'unexpected {parser.ltraw}; a * was expected'}, 'export - from \'12\'');

a('export.all.source.not.str',{c0:'parser.c0',li0:'parser.li0',col0:'parser.col0',m:'a string literal was expected'}, 'export * from 12');

a('export.async.but.no.function',{c0:'parser.c0',li0:'parser.li0',col0:'parser.col0',m:'function expected to immediately follow async; got {parser.lttype}'},'export async\n12');

a('export.default.const.let',{c0:'parser.c0',li0:'parser.li0',col0:'parser.col0',m:'const and let declarations can\'t be default exports'},'export default let r = 12;');

a('export.named.has.reserved',{tn:'tn',m:'local {tn.name} is actually a reserved word'},'export {a, if as l};');

a('export.named.list.not.finished',{c0:'parser.c0',li0:'parser.li0',col0:'parser.col0',m:'unfinished specifier list -- expected }, got {parser.lttype}'},'export {a 12 from \'l\'');

a('export.named.no.exports',{c0:'parser.c0',li0:'parser.li0',col0:'parser.col0',m:'unexpected {parser.lttype} -- it is not something that can appear at the beginning of an actual declaration'},'export 12');

set('export.named.not.id.from','export.all.no.from');

set('export.named.source.not.str','export.all.source.not.str');

a('export.newline.before.the.function',{c0:'parser.c0',li0:'parser.li0',col0:'parser.col0',m:'a newline is not allowed before \'function\' in exported async declarations.'},'export async\nfunction l() {}');

a('export.not.in.module', {c0:'parser.c0',li0:'parser.li0',col0:'parser.col0'});

a('export.specifier.after.as.id', {c0:'parser.c0',li0:'parser.li0',col0:'parser.col0',m:'got {parser.lttype}; an identifier was expected'}, 'export {a as 12}');

a('export.specifier.not.as', {m:'\'as\' or } was expected; got {parser.lttype}'},'export {a 12 e}');

a('for.decl.multi',{tn:'tn.declarations.1',m:'head of a {extra.2} can only have one declarator'},'for (var a, b in e) break;');

a('for.decl.no.init',{m:'initialiser "=" was expected; got {parser.lttype}'},'for (var [a];;) break;');

a('for.in.has.decl.init',{tn:'tn.declarations.0.init',m:'{tn.kind} declarations and non-Identifier declarators can not have initialisers; also it is not allowed altogether in versions before 7; current version is {parser.v}'},'for (var a = 12 in e) break;');

a('for.in.has.init.assig',{tn:'tn',m:'assignment expressions can not be a {extra.2}\'s head'},'for (a=12 in e) break;');

a('for.iter.no.end.paren',{m:'a ) was expected; got {parser.lttype}'},'for (a in b 5');

a('for.iter.not.of.in',{m:'an \'in\' or \'of\' expected; got {parser.ltval}'},'for (a to e) break;');

a('for.of.var.overrides.catch',{tn:'tn',m:'{tn.name} overrides the surrounding catch block\'s variable of the same name'},'try {} catch (a) { for (var a of l) break;}');

set('for.simple.no.end.paren', 'for.iter.no.end.paren');

a('for.simple.no.init.semi',{m:'a ; was expected; got {parser.lttype}'}, 'for (a 12 b; 12) break;');

set('for.simple.no.test.semi', 'for.simple.no.init.semi');

set('for.with.no.opening.paren', '<opening>');

// TODO: precision
a('func.args.has.dup',{tn:'tn',m:'{tn.name}: duplicate params are not allowed'}, 'function l([a,a]) {}');

set('func.args.no.end.paren', '<closing>');

set('func.args.no.opening.paren', '<opening>');

a('func.args.not.enough', {m:'unexpected {parser.lttype}'}, '({ get a(l) {} })', '({set a() {}})');

a('func.body.is.unfinished', {m:'a } was expected to end the current function\'s body; got {parser.lttype}'}, 'function l() { 12');

a('func.decl.not.allowed', {m:'the current scope does not allow a function to be declared in it'}, 'while (false) function l() {}');

a('func.label.not.allowed', {m:'can not label this declaration'}, 'L:function* l() {}');

a('func.strict.non.simple.param', {tn:'parser.firstNonSimpArg', m:'a function containing a Use Strict directive can not have any non-simple paramer -- all must be Identifiers'});

a('hex.esc.byte.not.hex', {c0:'parser.c',li0:'parser.li',col0:'parser.col',m:'a hex byte was expected'}, '"\\xab\\xel"');

a('id.esc.must.be.idbody',{cur0:'cur',m:'unicode codepoint with value {extra} is not a valid identifier body codepoint'});

a('id.esc.must.be.id.head',{cur0:'cur',m:'unicode codepoint with value {extra} is not a valid identifier start codepoint'});

a('id.multi.must.be.idhead', {cur0:'cur',m:'the unicode surrogate pair [{extra.0},{extra.1}] don\'t represent an identifier start.'});

a('id.multi.must.be.idbody', {cur0:'cur',m:'the unicode surrogate pair [{extra.0},{extra.1}] don\'t represent an identifier body codepoint'});

a('id.name.has.surrogate.pair',{m:'unicode escapes in identifier names can not be parts of a surrogate pair'});

a('id.u.not.after.slash',{m:'a \'u\' was expected after \\'}, '\\e');

set('if.has.no.closing.paren', '<closing>');

set('if.has.no.opening.paren', '<opening>');

a('import.from',{m:'\'from\' expected'},'import * 12');

a('import.invalid.specifier.after.comma',{m:'unexpected {parser.lttype}'},'import a, 12 from \'l\'');

a('import.namespace.specifier.not.*',{m:'unexpected {parser.ltraw} -- a * was expected'},'import - as \'12\'');

a('import.namespace.specifier.local.not.id', {m:'valid identifier was expected; got {parser.lttype}'},'import {a as 12} from \'12\'');

a('import.namespace.specifier.no.as', {m:'\'as\' expected'}, 'import {a 12 l} from \'12\'');

a('import.not.in.module', {m:'import is not allowed in script mode'});

a('import.source.is.not.str', {m:'string literal was expected'},'import * as a from 12');

a('import.specifier.list.unfinished', {m:'a } was expected; got {parser.lttype}'}, 'import {a as b, e as l 12');

set('import.specifier.local.not.id', 'import.namespace.specifier.local.not.id');

set('import.specifier.no.as', 'import.namespace.specifier.no.as');

a('incdec.post.not.simple.assig',{m:'member expression or identifier expected -- got {tn.type}'},'[a]--');

set('incdec.pre.not.simple.assig', 'incdec.post.not.simple.assig');

a('label.is.a.dup', {m:'{tn.name} has been actually declared at {extra.li0}:{extra:col0} (offset {extra.c0})'}, 'a: a: for (;false;) break;');

// TODO:
// a('let.dcl.not.in.block',{m: 

a('lexical.decl.not.in.block',{m:'a {extra.kind}-binding can not be declared in this scope'}, 'if (false) const a = 12;');

a('lexical.name.is.let', {m:'let/const bindings can not have the name \'let\''}, 'let [[let=let]=let*let] = 12;');

a('mem.gen.has.no.name',{m:'unexpected {parser.lttype}'},'({**() {}} })');

// v < 5
a('mem.id.is.null',{m:'got {parser.ltval} -- a valid member identifier was expected'},'a.this');

a('mem.name.not.id',{m:'unexpected {parser.lttype} -- a valid member identifier was expected'}, 'a.12');

a('mem.unfinished',{m:'unexpected {parser.lttype} -- a ] was expected'}, 'a[e 12');

a('meta.new.has.unknown.prop',{m:'\'target\' is currently the only allowed meta property of new; got {parser.ltval}'},'function l() { new.a }');

a('meta.new.not.in.function',{m:'\'new.target\' must be in the body of a function'}, 'new.target');

// TODO: precision
a('meth.paren',{m:'unexpected {parser.lttype} -- a ( was expected to start method-params'},'({get a 12})');

a('func.decl.has.no.name',{m:'function declaration must have a name in this context'},'function() {}');

a('new.args.is.unfinished',{m:'unexpected {parser.lttype} -- a ) was expected'}, 'new L(12');

a('new.head.is.not.valid',{m:'unexpected {parser.lttype}'}, 'new ?');

a('arrow.newline', {m:'\'=>\' can not have a newline before it'}, 'a \n=>12');

a('nexpr.null.head',{m:'unexpected {parser.lttype} -- something that can start an actual expression was expected'},'a-- * ?');

a('non.tail.rest',{m:'a rest element can not be followed by a comma (a fact that also implies it must be the very last element)'}, '[...a,]=12');

// TODO: this.noSemiAfter(nodeType)
a('no.semi',{m:'a semicolon was expected (or a \'}\' if appropriate), but got a {parser.lttype}'},'a e'); 

a('not.assignable',{m:'{tn.type} is not a valid assignment left hand side'},'a[0]-- = 12');

a('not.bindable',{m:'{tn.type} can not be treated as an actual binding pattern'});

// TODO: for now it would suffice
a('not.stmt',{m:'unexpected {parser.lttype} -- it can\'t be used in an expression'},'a * while (false) { break; }');

a('null.stmt',{m:'unexpected {parser.lttype} -- expected something that would start a statement'}, '{ for (a=0;a>=0 && false;a--) }');

a('num.has.no.mantissa',{m:'a mantissa was expected'},'12e?');

a('num.idhead.tail',{m:'a number literal can not immediately precede an identifier head'},'120l');

a('num.legacy.oct',{m:'legacy octals not allowed in strict mode'},'01');

a('num.with.first.not.valid',{m:'{extra} digit not valid'},'0xG','0b5');

a('num.with.no.digits',{m:'{extra} digits were expected to follow -- none found'},'0x','0b');

a('obj.pattern.no.:',{m:'a : was expected -- got {parser.lttype}'},  '({a 12 e, e: a})');

a('obj.prop.assig.not.allowed',{m:'shorthand assignment not allowed in this context, because the containing object can not be an assignment left-hand side'},'-{a=12} = 12');

a('obj.prop.assig.not.assigop',{m:'a \'=\' was expected'},'({a -= 12 } = 12)');

a('obj.prop.assig.not.id',{m:'a shorthand assignment\'s left hand side must be a plain (non-computed) identifier'},'({[a]=12})');

a('obj.prop.is.null',{m:'unexpected {parser.lttype} -- a [, {}, or an Identifier (anything starting a pattern) was expected'},'var {a:-12} = 12');

a('obj.proto.has.dup',{m:'can not have more than a  single property in the form __proto__: <value> or  \'__proto_\': <value>; currently the is already one at {parser.first__proto__.loc.start.line}:{parser.first__proto__.loc.start.column} (offset {parser.first__proto__.start})'}, '({__proto__:12, a, e, \'__proto__\': 12})');

a('obj.unfinished',{m:'unfinished object literal: a } was expected; got {parser.lttype}'},'({e: a 12)');

a('unexpected.lookahead',{m:'unexpected {parser.lttype}'},'-- -a');
a('param.has.yield.or.super',{p:function(){if(this.tn !== null && this.tn.type === 'Identifier') this.tn = {type:'AwaitExpression',start:this.tn.start,loc:this.tn.loc,end:this.tn.end,argument:null};},m:'{tn.type} isn\'t allowed to appear in this context'},'function* l() { ([a]=[yield])=>12; }');

a('paren.unbindable',{m:'unexpected ) -- bindings should not have parentheses around them, neither should non-simple assignment-patterns'},'([(a)])=>12', '[a,b,e,([l])]=12');

set('pat.array.is.unfinished', 'array.unfinished');

a('pat.obj.is.unfinished',{m:'unexpected {parser.lttype} -- a } was expected'},'var {a=12 l} = 12)');

a('program.unfinished',{m:'unexpected {parser.lttype} -- an EOF was expected'},'a, b, e, l; ?');

a('prop.dyna.is.unfinished',{m:'unexpected {parser.lttype}'},'({[a 12]: e})');

set('prop.dyna.no.expr', 'prop.dyna.is.unfinished');

function regp() {
  this.col0 = this.col + (this.c0-this.c);
  if (this.extra === null)
    this.extra = {};

  this.extra.ch = this.parser.src.charAt(this.c0);
}

// TODO: precision
a('regex.flag.is.dup',{p: regp, m:'regex flag is duplicate'},'/a/guymu');

a('regex.newline',{p:regp, m:'regular expressions can not contain a newline'},'/a\n/');

a('regex.newline.esc',{p:regp, m:'regular expressions can not contain escaped newlines'},'/a\\\n/');

a('regex.unfinished',{cur0:'cur',m:'unfinished regex -- a / was expected'},'/a');

// TODO: precision
a('regex.val.not.in.range',{m:'regex contains an out-of-range value'});

a('reserved.id',{m:'{tn.name} is actually a reserved word in this context'},'"use strict"; var implements = 12;');

a('rest.binding.arg.peek.is.not.id',{m:'unexpected {parser.lttype} -- in versions before 7, a rest\'s argument must be an id'},'var [...[a]] = 12');

a('rest.arg.not.valid',{tn:'tn.argument',m:'a rest\'s argument is not allowed to have a type of {tn.arguments.type}'},'[...a=12]=12');

a('resv.unicode',{cur:'parser.eloc',m:'{parser.ltraw} is actually a reserved word ({parser.ltval}); as such, it can not contain any unicode escapes'},'whil\\u0065 (false) break;');

a('return.not.in.a.function',{m:'return statements are only allowed inside a function'},'return 12');

a('seq.non.tail.expr',{m:'trailing comma was not expected'},'(a,)');

a('shorthand.unassigned',{m:'shorthand assignments are not allowed somewhere other than am assignment\'s left hand side'},'a = [{b=12},]');

a('stmt.null',{m:'unexpected {parser.lttype} because it can not start a statement'},'while (false) ?');

a('strict.err.esc.not.valid',{cur0:'parser.eloc',m:'legacy octals are not allowed in strict mode'},'"\\12"; "use strict"');

a('strict.let.is.id',{m:'let can\'t be used as an id in strict mode'},'"use strict"; a * b * e * l * let');

a('strict.oct.str.esc',{m:'legacy octals not allowed in strict mode'},'"use strict"; "\\12"');

a('strict.oct.str.esc.templ',{m:'legacy octals not allowed inside templates'},'`\\12`');

a('str.newline',{li0: 'parser.li', m:'a string literal may not contain line breaks'},'"a\n"');

a('str.unfinished',{li0: 'parser.li', m:'the string starting at {parser.li0}:{parser.col0} (offset {parser.c0}) not finished'},'"abel');

a('switch.case.has.no.colon',{m:'unexpected {parser.lttype} -- a \':\' was expected'},'switch (a) { case 12 a break; }');

a('switch.has.a.dup.default',{m:'this switch has already got a default'},'swicth (a) { case a: break; case b: break; case e: break; default: break; default: 12; }');

a('switch.has.no.opening.curly',{m:'unexpected {parser.lttype} -- a {} was expected'},'switch (a) 12');

a('switch.has.no.closing.paren',{m:'unexpected {parser.lttype} -- a ) was expected'},'switch (a 12');

a('switch.has.no.opening.paren',{m:'unexpected {parser.lttype} -- a ( was expected'},'switch ?');

a('switch.unfinished',{m:'unexpected {parser.lttype} -- a } was expected'},'switch (a) { case 12: break; ?');

a('templ.expr.is.unfinished',{m:'unexpected {parser.lttype} -- a } was expected at the end of the current interpolated expression'},'`abel${e 12}`');

a('templ.lit.is.unfinished',{m:'the template literal at {extra.loc.start.line}:{extra.loc.start.column} (offset {extra.start}) is unfinished'},'`abel');

a('throw.has.newline',{m:'throw can not have a line-break after it'},'throw \n12');

a('throw.has.no.argument',{m:'unexpected {parser.lttype}'},'throw ?');

a('try.has.no.tain',{m:'unexpected {parser.lttype} -- try must have a \'catch\' or \'finally\' block coming after it'},'try {}\nif (false);');

a('u.curly.is.unfinished',{p: regp, m:'a } was expected'},'\\u{12;');

a('u.curly.not.in.range',{p: regp, m:'unicode codepoints must have a max decimal value of 1114111 (0x10FFFF)'}, '\\u{125400}');

a('u.esc.hex',{p: regp, m:'invalid hex'},'\\u00el');

a('unary.before.an.exponentiation',{m:'left operand for an exponentiation operator is not allowed to be an unparenthesized unary expression'},'-a**e');

a('unexpected.id',{m:'got {parser.ltval} rather than {extra}'},'export * as a from \'12\'');

a('an.id.was.expected',{m:'unexpected {parser.lttype} -- identifier \'{extra}\' was expected'},'export * as a 12 \'l\'');

a('meth.parent',{m:'a ) was expected'},'class A { e: 12 }');

a('obj.meth.no.paren',{m:'a ) was expected'},'({get a: 12})');

a('rest.arg.has.trailing.comma',{m:'trailing comma not expected after rest'},'(...a,)');

a('unexpected.rest',{m:'unexpected rest element'},'(...a)');

a('unfinished.paren',{c0:'tn.end',li0:'tn.loc.end.line',col0:'tn.loc.end.column',m:'the parenthesis at {tn.loc.start.line}:{tn.loc.start.column} (offset {tn.start}) is unfinished'}, '(a,b 12');

a('u.second.esc.not.u',{p:function(){this.col0++;}, cur0:'cur', m:'a \'u\' was expected after the slash', col0:'col'},'\\ee');

a('u.second.not.in.range',{p:function(){this.col0+=(this.c-this.extra);},cur0:'cur',col0:'col',m:'the second surrogate must be in range [0x0dc00, 0x0dfff]'});

a('var.decl.neither.of.in',{m:'unexpected {parser.lttype}'},'var [a] -= 12');

a('var.decl.not.=', {m:'Unexpected {parser.lttype} -- (maybe you mean \'=\'?)'},'var a -= l');

a('var.must.have.init', {m:'a \'=\' was expected -- current declarator needs an initialiser'},'var a, [e]');

a('var.has.no.declarators',{m:'unexpected {parser.lttype}'}, 'var -a = l');

a('var.has.an.empty.declarator',{m:'unexpected {parser.lttype}'}, 'var a, -');

a('while.has.no.closing.paren',{m:'unexpected {parser.lttype} -- a ) was expected'},'while (a 12');

a('while.has.no.opening.paren',{m:'unexpected {parser.lttype} -- a ( was expected'},'while 12) break;');

a('with.has.no.opening.paren',{m:'unexpected {parser.lttype} -- a ( was expected'},'with 12) {}');

a('with.has.no.end.paren',{m:'unexpected {parser.lttype} -- a ) was expected'},'with (a 12 {}');

a('with.strict',{m:'with statements not allowed in strict mode'},'"use strict"; with (l) {}');

a('yield.args',{m:'yield expression not allowed in generator\'s argument list'},'function* l(e=yield 12) {}');

a('yield.as.an.id',{m:'yield is not allowed as an identifier in this context'},'function* l() { var yield = 12 }');

a('yield.has.no.expr.deleg',{m:'unexpected {parser.lttype} -- it can not star an expression'},'function* l() { yield* ?}');


},
function(){
this.currentExprIsParams = function() {
  this.st = this.pt = this.at = this.st = ERR_NONE_YET;
};

this.currentExprIsAssig = function() {
  this.st = this.pt = this.at = ERR_NONE_YET;
};

this.currentExprIsSimple = function() {
  this.pt = this.at = ERR_NONE_YET;
  if (this.st !== ERR_NONE_YET) {
    var st = this.st;
    var se = this.se;
    this.throwTricky('s', st, se);
  }
};

// tricky map
var tm = {};

tm[ERR_PAREN_UNBINDABLE] = 'paren.unbindable';
tm[ERR_SHORTHAND_UNASSIGNED] = 'shorthand.unassigned';
tm[ERR_NON_TAIL_REST] = 'non.tail.rest';
tm[ERR_ARGUMENTS_OR_EVAL_ASSIGNED] = 'assig.to.arguments.or.eval';
tm[ERR_YIELD_OR_SUPER] = 'param.has.yield.or.super';
tm[ERR_UNEXPECTED_REST] = 'unexpected.rest';
tm[ERR_EMPTY_LIST_MISSING_ARROW] = 'arrow.missing.after.empty.list';
tm[ERR_NON_TAIL_EXPR] = 'seq.non.tail.expr';
tm[ERR_INTERMEDIATE_ASYNC] = 'intermediate.async';
tm[ERR_ASYNC_NEWLINE_BEFORE_PAREN] = 'async.newline.before.paren';
tm[ERR_PIN_NOT_AN_EQ] = 'complex.assig.not.pattern';

// TODO: trickyContainer
this.throwTricky = function(source, trickyType) {
  if (!HAS.call(tm, trickyType))
    throw new Error("Unknown error value: "+trickyType);

  var t = null, errParams = {};
  if (trickyType & ERR_PIN) {
    t = source === 'p' ? this.ploc :
        source === 'a' ? this.aloc :
        source === 's' ? this.eloc : null;
    errParams = { c0: t.c0, li0: t.li0, col0: t.col0 };
  }
  else {
    errParams.tn = source === 'p' ? this.pe :
                   source === 'a' ? this.ae :
                   source === 's' ? this.se : null;
  }
  errParams.extra = { source: source };
  this.err(tm[trickyType], errParams);
}; 

this.adjustErrors = function() { 
  if (this.st === ERR_ARGUMENTS_OR_EVAL_ASSIGNED)
    this.st = ERR_ARGUMENTS_OR_EVAL_DEFAULT;
  else
    this.st = ERR_NONE_YET;
};


},
function(){
this.err = function(errorType, errParams) {
  errParams = this.normalize(errParams);
  return this.errorListener.onErr(errorType, errParams);
};

this.normalize = function(err) {
  // normalized err
  var loc0 = { li: this.li0, col: this.col0 },
      loc = { li: this.li, col: this.col };

  var e = {
    cur0: { c: this.c0, loc: loc0 },
    cur: { c: this.c, loc: loc },
    tn: null,
    parser: this,
    extra: null
  };
  
  if (err) {
    if (err.tn) {
      var tn = err.tn;
      e.tn = tn;

      if (HAS.call(tn,'start')) e.cur0.c = tn.start;
      if (HAS.call(tn,'end')) e.cur.c = tn.end;
      if (tn.loc) {
	if (HAS.call(tn.loc, 'start')) {
          e.cur0.loc.li = tn.loc.start.line;
          e.cur0.loc.col =  tn.loc.start.column;
        }
        if (HAS.call(tn.loc, 'start')) {
          e.cur.loc.li = tn.loc.end.line;
          e.cur.loc.col = tn.loc.end.column;
        }
      }
    }
    if (err.loc0) {
      var loc0 = err.loc0;
      e.cur.loc.li = loc0.line;
      e.cur.loc.col = loc0.column;
    }
    if (err.loc) {
      var loc = err.loc;
      e.cur.loc.li = loc.line;
      e.cur.loc.col = loc.column;
    }

    if (HAS.call(err,'c0'))
      e.cur0.c = err.c0;
    
    if (HAS.call(err,'c'))
      e.cur.c = err.c;

    if (HAS.call(err, 'extra')) 
      e.extra = err.extra;
  }

  e.c0 = e.cur0.c; e.li0 = e.cur0.loc.li; e.col0 = e.cur0.loc.col;
  e.c = e.cur.c; e.li = e.cur.loc.li; e.col = e.cur.loc.col;

  e.loc0 = e.cur0.loc;
  e.loc = e.cur.loc;

  return e;
};


},
function(){
function get(obj, name, value) {
  if (obj === null || obj === void 0)
    return value;

  if (!HAS.call(obj, name))
    return value;
  var t = typeof value;
  switch (t) {
    case NUMBER_TYPE:
    case BOOL_TYPE:
    case STRING_TYPE:
      if (typeof obj[name] !== t) 
        return value;
    default:
      return obj[name];
  }
}

this.setOptions = function(o) {
  var list = OPTIONS, e = 0;
  while (e < list.length) {
    var cur = list[e++];
    switch (cur) {
    case 'ecmaVersion':
      this.v = get(o, cur, 7);
      break;

    case 'sourceType':
      var sourceType = get(o, cur, 'script');
      switch (sourceType) {
      case 'script': this.isScript = true; break;
      case 'module': this.isScript = false; break;
      default:
        ASSERT.call(this, false,
          'Unknown option for sourceType: '+sourceType);
      }
      break;

    case 'onToken':
      this.onToken_ = get(o, cur, null);
      break;

    case 'program':
      this.program = get(o, cur, null);
      break;

    case 'onComment':
      this.onComment_ = get(o, cur, null);

    case 'allowReturnOutsideFunction':
      this.misc.allowReturnOutsideFunction =
        get(o, cur, false);
      break;

    case 'allowImportExportEverywhere':
      this.misc.allowImportExportEverywhere =
        get(o, cur, false);
      break;

    case 'sourceFile':
      this.misc.sourceFile = 
        get(o, cur, "");
      break;

    case 'directSourceFile':
      this.misc.directSourceFile =
        get(o, cur, "");
      break;

//  case 'preserveParens':
//    if (get(o, cur, false))
//      this.core = KEEPER_CORE;
//    break;

    case 'allowHashBang':
      this.misc.allowHashBang = get(o, cur, false);

    }
  }
};

},
function(){
this.loc = function() { return { line: this.li, column: this.col }; };
this.locBegin = function() { return  { line: this.li0, column: this.col0 }; };
this.locOn = function(l) { return { line: this.li, column: this.col - l }; };



},
function(){
this.next = function () {
  if (this.onToken_ !== null) {
    switch (this.lttype) {
    case "eof":
    case "":
      break;
    default:
      this.onToken(null);
    }
  }

  if ( this.skipS() ) return;
  if (this.c >= this.src.length) {
      this. lttype =  'eof' ;
      this.ltraw=  '<<EOF>>';
      return ;
  }
  var c = this.c,
      l = this.src,
      e = l.length,
      r = 0,
      peek = -1,
      start =  c;

  this.c0 = c;
  this.col0 = this.col;
  this.li0 = this.li;

  peek  = this.src.charCodeAt(start);
  if ( isIDHead(peek) ) {
    if (this.directive !== DIR_NONE)
      this.directive = DIR_NONE;

    this.esct = ERR_NONE_YET;
    this.readAnIdentifierToken('');
  }
  else if (num(peek))this.readNumberLiteral(peek);
  else {

    switch (peek) {
      case CH_MIN: this.opMin(); break;
      case CH_ADD: this.opAdd() ; break;
      case CH_MULTI_QUOTE:
      case CH_SINGLE_QUOTE:
        return this.readStrLiteral(peek);
      case CH_SINGLEDOT: this.readDot () ; break ;
      case CH_EQUALITY_SIGN:  this.opEq () ;   break ;
      case CH_LESS_THAN: this.opLess() ;   break ;
      case CH_GREATER_THAN: this.opGrea() ;   break ;
      case CH_MUL:
         this.prec = PREC_MUL;
         this.lttype = 'op';
         this.ltraw = '*';
         c++ ;
         if ( l.charCodeAt(c) === peek) {
           if (this.v <= 5)
             this.err('ver.**');

           this.ltraw = '**';
           this.prec = PREC_EX;
           c++ ;
         }
         if (l.charCodeAt(c) === CH_EQUALITY_SIGN) {
           c++;
           this. prec = PREC_OP_ASSIG;
           this.ltraw += '=';
         }
         this.c=c;
         break ;

      case CH_MODULO:
         this.lttype = 'op';
         c++ ;
         if (l.charCodeAt(c) === CH_EQUALITY_SIGN) {
           c++;
           this. prec = PREC_OP_ASSIG;
           this.ltraw = '%=';
         }
         else {
           this. prec = PREC_MUL;
           this.ltraw = '%';
         }
         this.c=c;
         break ;

      case CH_EXCLAMATION:
         c++ ;
         if ( l.charCodeAt(c) === CH_EQUALITY_SIGN ) {
           this. lttype = 'op';
           c++;
           this.prec = PREC_EQUAL;
           if ( l.charCodeAt(c) === CH_EQUALITY_SIGN ) {
             this.ltraw = '!==';
             c++;
           }
           else this.ltraw = '!=' ;
         }
         else {
           this .lttype = 'u' ;
           this.ltraw = '!';
         }
         this.c=c;
         break ;

      case CH_COMPLEMENT:
            c++;
            this.c=c;
            this.ltraw = '~';
            this.lttype = 'u';
            break ;

      case CH_OR:
         c++;
         this.lttype = 'op' ;
         switch ( l.charCodeAt(c) ) {
            case CH_EQUALITY_SIGN:
                 c++;
                 this.prec = PREC_OP_ASSIG ;
                 this.ltraw = '|=';
                 break ;

            case CH_OR:
                 c++;
                 this.prec = PREC_BOOL_OR;
                 this.ltraw = '||'; break ;

            default:
                 this.prec = PREC_BIT_OR;
                 this.ltraw = '|';
                 break ;
         }
         this.c=c;
         break;

      case CH_AND:
          c++ ;
          this.lttype = 'op';
          switch ( l.charCodeAt(c) ) {
            case CH_EQUALITY_SIGN:
               c++;
               this. prec = PREC_OP_ASSIG;
               this.ltraw = '&=';
               break;

            case CH_AND:
               c ++;
               this.prec = PREC_BOOL_AND;
               this.ltraw = '&&';
               break ;

            default:
               this.prec = PREC_BIT_AND;
               this.ltraw = '&';
               break ;
         }
         this.c=c;
         break ;

      case CH_XOR:
        c++;
        this.lttype = 'op';
        if ( l.charCodeAt(c) === CH_EQUALITY_SIGN ) {
          c++;
          this.prec = PREC_OP_ASSIG;
          this.ltraw = '^=';
        }
        else  {
          this.  prec = PREC_XOR;
          this.ltraw = '^';
        }
        this.c=c  ;
        break;

      default:

        var mustBeAnID = 0 ;

        if (CH_BACK_SLASH === peek) {
          this.esct = ERR_PIN_UNICODE_IN_RESV;
          this.eloc.c0 = this.c;
          this.eloc.li0 = this.li;
          this.eloc.col0 = this.col;

          mustBeAnID = 1;
          peek = l.charCodeAt(++ this.c);
          if (peek !== CH_u )
              return this.err('id.u.not.after.slash');
          
          else
             peek = this.peekUSeq();

          if (peek >= 0x0D800 && peek <= 0x0DBFF )
            this.err('id.name.has.surrogate.pair');
        }
        if (peek >= 0x0D800 && peek <= 0x0DBFF ) {
            mustBeAnID = 2 ;
            this.c++;
            r = this.peekTheSecondByte();
        }
        if (mustBeAnID) {
          if (!isIDHead(mustBeAnID === 1 ? peek :
             ((peek - 0x0D800)<<10) + (r-0x0DC00) + (0x010000) ) ) {
            if ( mustBeAnID === 1 ) return this.err('id.esc.must.be.idhead',{extra:peek});
            else return this.err('id.multi.must.be.idhead',{extra:[peek,r]});
          }
 
          this.readAnIdentifierToken( mustBeAnID === 2 ?
              String.fromCharCode( peek, r ) :
              fromcode( peek )
          );
        }
        else 
          this.readMisc();
    }

    if (this.directive !== DIR_NONE)
      this.directive = DIR_NONE;
  }

  this.col += ( this.c - start );
};

this . opEq = function()  {
    var c = this.c;
    var l = this.src;
    this.lttype = 'op';
    c++ ;

    if ( l.charCodeAt(c) === CH_EQUALITY_SIGN ) {
      c++;
      this.prec = PREC_EQUAL ;
      if ( l.charCodeAt(c ) === CH_EQUALITY_SIGN ){
        c++ ;
        this.ltraw = '===';
      }
      else this.ltraw = '==';
    }
    else {
        this.prec = PREC_SIMP_ASSIG;
        if ( l.charCodeAt(c) === CH_GREATER_THAN) {
          c++;
          this. ltraw = '=>';
        }
        else  this.ltraw = '=' ;
    }

    this.c=c;
};

this . opMin = function() {
   var c = this.c;
   var l = this.src;
   c++;

   switch( l.charCodeAt(c) ) {
      case  CH_EQUALITY_SIGN:
         c++;
         this.prec = PREC_OP_ASSIG;
         this. lttype = 'op';
         this.ltraw = '-=';
         break ;

      case  CH_MIN:
         c++;
         this.prec = PREC_OO;
         this. lttype = this.ltraw = '--';
         break ;

      default:
         this.ltraw = this.lttype = '-';
         break ;
   }
   this.c=c;
};

this . opLess = function () {
  var c = this.c;
  var l = this.src;
  this.lttype = 'op';
  c++ ;

  if ( l.charCodeAt(c ) === CH_LESS_THAN ) {
     c++;
     if ( l.charCodeAt(c) === CH_EQUALITY_SIGN ) {
        c++;
        this. prec = PREC_OP_ASSIG ;
        this. ltraw = '<<=' ;
     }
     else {
        this.ltraw = '<<';
        this. prec = PREC_SH ;
     }
  }
  else  {
     this. prec = PREC_COMP ;
     if ( l.charCodeAt(c) === CH_EQUALITY_SIGN ) {
        c++ ;
        this.ltraw = '<=';
     }
     else this.ltraw = '<';
  }

  this.c=c;
};

this . opAdd = function() {
   var c = this.c;
   var l = this.src;
   c++ ;

   switch ( l.charCodeAt(c) ) {
       case CH_EQUALITY_SIGN:
         c ++ ;
         this. prec = PREC_OP_ASSIG;
         this. lttype = 'op';
         this.ltraw = '+=';

         break ;

       case CH_ADD:
         c++ ;
         this. prec = PREC_OO;
         this. lttype = '--';
         this.ltraw = '++';
         break ;

       default: this. ltraw = '+' ; this. lttype = '-';
   }
   this.c=c;
};

this . opGrea = function()   {
  var c = this.c;
  var l = this.src;
  this.lttype = 'op';
  c++ ;

  if ( l.charCodeAt(c) === CH_GREATER_THAN ) {
    c++;
    if ( l.charCodeAt(c) === CH_GREATER_THAN ) {
       c++;
       if ( l.charCodeAt(c) === CH_EQUALITY_SIGN ) {
         c++ ;
         this. prec = PREC_OP_ASSIG;
         this. ltraw = '>>>=';
       }
       else {
         this. ltraw = '>>>';
         this. prec = PREC_SH;
       }
    }
    else if ( l.charCodeAt(c) === CH_EQUALITY_SIGN ) {
       c++ ;
       this. prec = PREC_OP_ASSIG;
       this.ltraw = '>>=';
    }
    else {
       this. prec=  PREC_SH;
       this. ltraw    = '>>';
    }
  }
  else  {
    this. prec = PREC_COMP  ;
    if ( l.charCodeAt(c) === CH_EQUALITY_SIGN ) {
      c++ ;
      this. ltraw = '>=';
    }
    else  this. ltraw = '>';
  }
  this.c=c;
};

this.skipS = function() {
  var noNewLine = true,
      startOffset = this.c,
      c = this.c,
      l = this.src,
      e = l.length,
      start = c;

  while ( c < e ) {
    switch ( l.charCodeAt ( c ) ) {
    case CH_WHITESPACE :
      while ( ++c < e &&  l.charCodeAt(c) === CH_WHITESPACE );
      continue ;
    case CH_CARRIAGE_RETURN : if ( CH_LINE_FEED === l.charCodeAt( c + 1 ) ) c ++;
    case CH_LINE_FEED :
      if ( noNewLine ) noNewLine = false ;
      start = ++ c ;
      this.li ++ ;
      this.col = ( 0)
      continue ;

    case CH_VTAB:
    case CH_TAB:
    case CH_FORM_FEED: c++ ; continue ;  

    case CH_DIV:
      switch ( l.charCodeAt ( c + ( 1) ) ) {
      case CH_DIV:
        c += 2;
        this.col += (c-start) ;
        this.c=c;
        this.readLineComment () ;
        if (noNewLine) noNewLine = false ;
        start = c = this.c ;
        continue ;

      case CH_MUL:
        c += 2;
        this.col += (c-start) ;
        this.c = c ;
        noNewLine = this. readMultiComment () && noNewLine ;
        start = c = this.c ;
        continue ;

      default:
        this.c0 = c;
        this.col0 = this.col + (c-start);
        this.li0 = this.li;
        c++ ;
        this.nl = ! noNewLine ;
        this.col += (c-start) ;
        this.c=c ;
        this.prec  = 0xAD ;
        this.lttype =  '/';
        this.ltraw = '/' ;
        return true;
      }

    case 0x0020:case 0x00A0:case 0x1680:case 0x2000:
    case 0x2001:case 0x2002:case 0x2003:case 0x2004:
    case 0x2005:case 0x2006:case 0x2007:case 0x2008:
    case 0x2009:case 0x200A:case 0x202F:case 0x205F:
    case 0x3000:case 0xFEFF: c ++ ; continue ;

    case 0x2028:
    case 0x2029:
      if ( noNewLine ) noNewLine = false ;
      start = ++c ;
      this.col = 0 ;
      this.li ++ ;
      continue;

    case CH_LESS_THAN:
      if ( this.v > 5 && this.isScript &&
        l.charCodeAt(c+1) === CH_EXCLAMATION &&
        l.charCodeAt(c+2) === CH_MIN &&
        l.charCodeAt(c+1+2) === CH_MIN
      ) {
        this.c = c + 4;
        this.col += (this.c-start) ;
        this.readLineComment();
        c = this.c;
        continue;
      }
      this.col += (c-start ) ;
      this.c=c;
      this.nl = !noNewLine ;
      return ;
 
    case CH_MIN:
      if (this.v > 5 && (!noNewLine || startOffset === 0) &&
           this.isScript &&
           l.charCodeAt(c+1) === CH_MIN && l.charCodeAt(c+2) === CH_GREATER_THAN ) {
        this.c = c + 1 + 2;
        this.col += (this.c-start) ;
        this.readLineComment();
        c = this.c;
        continue;
      }
  
    default :
      this.col += (c-start ) ;
      this.c=c;
      this.nl = !noNewLine ;
      return ;
    }
  }

  this.col += (c-start ) ;
  this.c = c ;
  this.nl = !noNewLine ;
};

this.readDot = function() {
   ++this.c;
   if( this.src.charCodeAt(this.c)===CH_SINGLEDOT) {
     if (this.src.charCodeAt(++ this.c) === CH_SINGLEDOT) { this.lttype = '...' ;   ++this.c; return ; }
     this.err('Unexpectd ') ;
   }
   else if ( num(this.src.charCodeAt(this.c))) {
       this.lttype = 'Literal' ;
       this.c0  = this.c - 1;
       this.li0 = this.li;
       this.col0= this.col ;

       this.frac( -1 ) ;
       return;
   }
   this. ltraw = this.lttype = '.' ;
};

this.readMisc = function () { this.lttype = this.  src.   charAt (   this.c ++  )    ; };

this.expectID = function (n) {
  if (this.lttype === 'Identifier' && this.ltval === n)
    return this.next();
  
  if (this.lttype !== 'Identifier')
    this.err('an.id.was.expected',{extra:n});
 
  this.err('unexpected.id',{extra:n});
};

this.expectType_soft = function (n)  {
  if (this.lttype === n ) {
      this.next();
      return true;
  }

  return false;
};

this.expectID_soft = function (n) {
  if (this.lttype === 'Identifier' && this.ltval === n) {
     this.next();
     return true;
  }

  return false;
};

this.kw = function() {
  if (this.onToken_)
    this.lttype = 'Keyword';
};

},
function(){
this.parseUpdateExpression = function(arg, context) {
  var c = 0, loc = null, u = this.ltraw;
  if (arg === null) {
    c = this.c-2;
    loc = this.locOn(2);
    this.next() ;
    arg = this.parseExprHead(context & CTX_FOR);
    if (arg === null)
      this.err('unexpected.lookahead');

    if (!this.ensureSimpAssig_soft(core(arg)))
      this.err('incdec.pre.not.simple.assig',{tn:core(arg)});

    return {
      type: 'UpdateExpression', operator: u,
      start: c, end: arg.end, argument: core(arg),
      loc: { start: loc, end: arg.loc.end },
      prefix: true
    };
  }

  if (!this.ensureSimpAssig_soft(core(arg)))
    this.err('incdec.post.not.simple.assig',{tn:core(arg)});

  c  = this.c;
  loc = {
    start: arg.loc.start,
    end: { line: this.li, column: this.col }
  };

  this.next() ;
  return {
    type: 'UpdateExpression', operator: u,
    start: arg.start, end: c,
    argument: core(arg), loc: loc,
    prefix: false
  };
};

},
function(){
this.parseArgList = function () {
  var c0 = -1, li0 = -1, col0 = -1, parenAsync = this.parenAsync,
      elem = null, list = [];

  do { 
    this.next();
    elem = this.parseNonSeqExpr(PREC_WITH_NO_OP,CTX_NULLABLE|CTX_PAT|CTX_NO_SIMPLE_ERR); 
    if (elem)
      list.push(core(elem));
    else if (this.lttype === '...')
      list.push(this.parseSpreadElement(CTX_NONE));
    else {
      if (list.length !== 0) {
        if (this.v < 7)
          this.err('arg.non.tail',
            {c0:c0, li0:li0, col0:col0,
            extra: {list: list, async: parenAsync}});
      }
      break;
    }

    if (this.lttype === ',') {
      c0 = this.c0;
      li0 = this.li0;
      col0 = this.col0;
    }
    else break;
  } while (true);

  if (parenAsync !== null)
    this.parenAsync = parenAsync;

  return list ;
};

},
function(){
this.parseArrayExpression = function(context) {

  var startc = this.c - 1,
      startLoc = this.locOn(1);

  this.next();

  var elem = null,
      list = [];
  var elemContext = CTX_NULLABLE;

  if (context & CTX_PAT) {
    elemContext |= (context & CTX_PARPAT);
    elemContext |= (context & CTX_PARPAT_ERR);
  }
  else
    elemContext |= CTX_PAT|CTX_NO_SIMPLE_ERR;

  var pt = ERR_NONE_YET, pe = null, po = null;
  var at = ERR_NONE_YET, ae = null, ao = null;
  var st = ERR_NONE_YET, se = null, so = null;

  var pc0 = -1, pli0 = -1, pcol0 = -1;
  var ac0 = -1, ali0 = -1, acol0 = -1;
  var sc0 = -1, sli0 = -1, scol0 = -1;

  if (context & CTX_PARPAT) {
    if ((context & CTX_PARAM) &&
       !(context & CTX_HAS_A_PARAM_ERR)) {
      this.pt = ERR_NONE_YET; this.pe = this.po = null;
    }

    if ((context & CTX_PAT) &&
       !(context & CTX_HAS_AN_ASSIG_ERR)) {
      this.at = ERR_NONE_YET; this.ae = this.ao = null;
    }

    if (!(context & CTX_HAS_A_SIMPLE_ERR)) {
      this.st = ERR_NONE_YET; this.se = this.so = null;
    }
  }

  var hasMore = true;
  var hasRest = false, hasNonTailRest = false;

  while (hasMore) {
    elem = this.parseNonSeqExpr(PREC_WITH_NO_OP, elemContext);
    if (elem === null && this.lttype === '...') {
      elem = this.parseSpreadElement(elemContext);
      hasRest = true;
    }
    if (this.lttype === ',') {
      if (hasRest)
        hasNonTailRest = true; 
      if (elem === null) {
        if (this.v <= 5) this.err('ver.elision');
        list.push(null);
      }
      else list.push(core(elem));
      this.next();
    }
    else {
      if (elem) {
        list.push(core(elem));
        hasMore = false;
      }
      else break;
    }
 
    if (elemContext & CTX_PARAM)
      elem && this.scope.addPossibleArgument(elem);

    if (elem && (elemContext & CTX_PARPAT)) {
      var elemCore = elem;
      // TODO: [...(a),] = 12
      var t = ERR_NONE_YET;
      if (elemCore.type === PAREN_NODE)
        t = ERR_PAREN_UNBINDABLE;
      else if (hasNonTailRest)
        t = ERR_NON_TAIL_REST;

      if ((elemContext & CTX_PARAM) && 
         !(elemContext & CTX_HAS_A_PARAM_ERR)) {
        if (this.pt === ERR_NONE_YET && t !== ERR_NONE_YET) {
          this.pt = t; this.pe = elemCore;
        }
        if (this.pt !== ERR_NONE_YET) {
          if (pt === ERR_NONE_YET || agtb(this.pt, pt)) {
            pt = this.pt; pe = this.pe; po = core(elem);
            if (pt & ERR_P_SYN)
              elemContext |= CTX_HAS_A_PARAM_ERR;
            if (pt & ERR_PIN) 
              pc0 = this.ploc.c0, pli0 = this.ploc.li0, pcol0 = this.ploc.col0;
          }
        }
      }

      // ([a]) = 12
      if (t === ERR_PAREN_UNBINDABLE && this.ensureSimpAssig_soft(elem.expr))
        t = ERR_NONE_YET;

      if ((elemContext & CTX_PAT) &&
         !(elemContext & CTX_HAS_AN_ASSIG_ERR)) {
        if (this.at === ERR_NONE_YET && t !== ERR_NONE_YET) {
          this.at = t; this.ae = elemCore;
        }
        if (this.at !== ERR_NONE_YET) {
          if (at === ERR_NONE_YET || agtb(this.at, at)) {
            at = this.at; ae = this.ae; ao = core(elem);
            if (at & ERR_A_SYN)
              elemContext |= CTX_HAS_AN_ASSIG_ERR;
            if (at & ERR_PIN)
              ac0 = this.aloc.c0, ali0 = this.aloc.li0, acol0 = this.aloc.col0;
          }
        }
      }
      if (!(elemContext & CTX_HAS_A_SIMPLE_ERR)) {
        if (this.st !== ERR_NONE_YET) {
          if (st === ERR_NONE_YET || agtb(this.st, st)) {
            st = this.st; se = this.se; so = core(elem);
            if (st & ERR_S_SYN)
              elemContext |= CTX_HAS_A_SIMPLE_ERR;
            if (st & ERR_PIN)
              sc0 = this.eloc.c0, sli0 = this.eloc.li0, scol0 = this.eloc.col0;
          }
        }
      }
    }

    hasRest = hasNonTailRest = false;
  }
  
  var n = {
    type: 'ArrayExpression',
    loc: { start: startLoc, end: this.loc() },
    start: startc,
    end: this.c,
    elements : list  ,y:-1
  };

  if ((context & CTX_PARAM) && pt !== ERR_NONE_YET) {
    this.pt = pt; this.pe = pe; this.po = po;
    if (pt & ERR_PIN)
      this.ploc.c0 = pc0, this.ploc.li0 = pli0, this.ploc.col0;
  }
  if ((context & CTX_PAT) && at !== ERR_NONE_YET) {
    this.at = at; this.ae = ae; this.ao = ao;
    if (at & ERR_PIN)
      this.aloc.c0 = ac0, this.aloc.li0 = ali0, this.aloc.col0 = acol0;
  }
  if ((context & CTX_PARPAT) && st !== ERR_NONE_YET) {
    this.st = st; this.se = se; this.so = so;
    if (st & ERR_PIN)
      this.eloc.c0 = sc0, this.eloc.li0 = sli0, this.eloc.col0 = scol0;
  }

  if (!this.expectType_soft(']'))
    this.err('array.unfinished');
  
  return n;
};

},
function(){
this.parseArrowFunctionExpression = function(arg, context)   {
  if (this.v <= 5)
    this.err('ver.arrow');
  var tight = this.scope.insideStrict(), async = false;

  if (this.pt === ERR_ASYNC_NEWLINE_BEFORE_PAREN) {
    ASSERT.call(this, arg === this.pe,
      'how can an error core not be equal to the erroneous argument?!');
    this.err('arrow.newline.before.paren.async');
  }

  var st = ST_ARROW;
  switch ( arg.type ) {
  case 'Identifier':
    var decl = this.scope.findDecl(arg.name);
    if (decl) this.ref.direct.ex--;
    else this.scope.findRef(arg.name).direct.fw--;

    this.enterScope(this.scope.fnHeadScope(st));
    this.asArrowFuncArg(arg);
    this.scope.declare(arg.name, DM_FNARG);
    break;

  case PAREN_NODE:
    this.enterScope(this.scope.fnHeadScope(st));
    this.scope.absorb(this.parenScope);
    this.parenScope = null;
    if (arg.expr) {
      if (arg.expr.type === 'SequenceExpression')
        this.asArrowFuncArgList(arg.expr.expressions);
      else
        this.asArrowFuncArg(arg.expr);
    }
    break;

  case 'CallExpression':
    if (this.v >= 7 && arg.callee.type !== 'Identifier' || arg.callee.name !== 'async')
      this.err('not.a.valid.arg.list',{tn:arg});
    if (this.parenAsync !== null && arg.callee === this.parenAsync.expr)
      this.err('arrow.has.a.paren.async');

//  if (this.v < 7)
//    this.err('ver.async');

    async = true;
    st |= ST_ASYNC;
    this.enterScope(this.scope.fnHeadScope(st));
    this.scope.absorb(this.parenScope);
    this.parenScope = null;
    this.asArrowFuncArgList(arg.arguments);
    break;

  case INTERMEDIATE_ASYNC:
    async = true;
    st |= ST_ASYNC;
    this.enterScope(this.scope.fnHeadScope(st));
    this.asArrowFuncArg(arg.id);
    this.scope.declare(arg.name, DM_FNARG);
    break;

  default:
    this.err('not.a.valid.arg.list');

  }

  var funcHead = this.exitScope();
  this.currentExprIsParams();

  this.enterScope(this.scope.fnBodyScope(st));
  this.scope.funcHead = funcHead;

  if (this.nl)
    this.err('arrow.newline');

  this.next();

  var isExpr = true, nbody = null;

  if ( this.lttype === '{' ) {
    var prevLabels = this.labels, prevDeclMode = this.declMode;
    this.labels = {};
    isExpr = false;
    nbody = this.parseFuncBody(CTX_NONE|CTX_PAT|CTX_NO_SIMPLE_ERR);
    this.labels = prevLabels; this.declMode = prevDeclMode;
  }
  else
    nbody = this. parseNonSeqExpr(PREC_WITH_NO_OP, context|CTX_PAT) ;

  this.exitScope();

  var params = core(arg);
  if (params === null)
    params = [];
  else if (params.type === 'SequenceExpression')
    params = params.expressions;
  else if (params.type === 'CallExpression')
    params = params.arguments;
  else {
    if (params.type === INTERMEDIATE_ASYNC)
      params = params.id;
    params = [params];
  }

  return {
    type: 'ArrowFunctionExpression', params: params, 
    start: arg.start, end: nbody.end,
    loc: {
      start: arg.loc.start,
      end: nbody.loc.end
    },
    generator: false, expression: isExpr,
    body: core(nbody), id : null,
    async: async
  }; 
};


},
function(){
this.parseAssignment = function(head, context) {
  var o = this.ltraw;
  if (o === '=>')
    return this.parseArrowFunctionExpression(head);

  if (head.type === PAREN_NODE) {
    if (!this.ensureSimpAssig_soft(head.expr)) {
      this.at = ERR_PAREN_UNBINDABLE;
      this.ae = this.ao = head;
      this.throwTricky('a', this.at, this.ae);
    }
    else
      this.dissolveParen();
  }

  var right = null;
  if (o === '=') {
    if (context & CTX_PARAM) {
      if (head.type === 'Identifier')
        this.scope.addPossibleArgument(head);
    }
    if (context & CTX_PARPAT)
      this.adjustErrors();

    var st = ERR_NONE_YET, se = null, so = null,
        pt = ERR_NONE_YET, pe = null, po = null;

    this.toAssig(core(head), context);

    // flush any remaining simple error, now that there are no more assignment errors
    if ((context & CTX_NO_SIMPLE_ERR) && this.st !== ERR_NONE_YET)
      this.throwTricky('s', this.st);

    var sc0 = -1, sli0 = -1, scol0 = -1,
        pc0 = -1, pli0 = -1, pcol0 = -1;

    if ((context & CTX_PARPAT) && this.st !== ERR_NONE_YET) {
      st = this.st; se = this.se; so = this.so;
      if (st & ERR_PIN)
        sc0 = this.eloc.c0, sli0 = this.eloc.li0, scol0 = this.eloc.col0;
    }
    if ((context & CTX_PARAM) && this.pt !== ERR_NONE_YET) {
      pt = this.pt; pe = this.pe; po = this.po;
      if (pt & ERR_PIN)
        pc0 = this.ploc.c0, pli0 = this.ploc.li0, pcol0 = this.ploc.col0;
    }

    this.currentExprIsAssig();
    this.next();
    right = this.parseNonSeqExpr(PREC_WITH_NO_OP,
      (context & CTX_FOR)|CTX_PAT|CTX_NO_SIMPLE_ERR);

    if (pt !== ERR_NONE_YET) {
      this.pt = pt; this.pe = pe; this.po = po;
      if (pt & ERR_PIN)
        this.ploc.c0 = pc0, this.ploc.li0 = pli0, this.ploc.col0 = pcol0;
    }
    if (st !== ERR_NONE_YET) {
      this.st = st; this.se = se; this.so = so;
      if (st & ERR_PIN)
        this.eloc.c0 = sc0, this.eloc.li0 = sli0, this.eloc.scol0;
    }
  }
  else {
    // TODO: further scrutiny, like checking for this.at, is necessary (?)
    if (!this.ensureSimpAssig_soft(core(head)))
      this.err('assig.not.simple',{tn:core(head)});

    var c0 = -1, li0 = -1, col0 = -1;
    if (context & CTX_PARPAT) {
      c0 = this.c0; li0 = this.li0; col0 = this.col0;
    }
    this.next();
    right = this.parseNonSeqExpr(PREC_WITH_NO_OP,
      (context & CTX_FOR)|CTX_PAT|CTX_NO_SIMPLE_ERR);

    if (context & CTX_PARAM) {
      this.ploc.c0 = c0, this.ploc.li0 = li0, this.ploc.col0 = col0;
      this.pt = ERR_PIN_NOT_AN_EQ;
    }
    if (context & CTX_PAT) {
      this.aloc.c0 = c0, this.aloc.li0 = li0, this.aloc.col0 = col0;
      this.at = ERR_PIN_NOT_AN_EQ;
    }
  }
 
  return {
    type: 'AssignmentExpression',
    operator: o,
    start: head.start,
    end: right.end,
    left: head,
    right: core(right),
    loc: {
      start: head.loc.start,
      end: right.loc.end
    } ,y:-1
  };
};

},
function(){
function idAsync(c0,li0,col0,raw) {
  return {
    type: 'Identifier', name: 'async',
    start: c0, end: c0 + raw.length,
    loc: {
      start: { line: li0, column: col0 }, 
      end: { line: li0, column: col0 + raw.length }
    }, raw: raw
  };
}

this.parseAsync = function(context) {
  if (this.v < 7) 
    return this.id();

  var c0 = this.c0,
      li0 = this.li0,
      col0 = this.col0,
      raw = this.ltraw;

  var stmt = this.canBeStatement;
  if (stmt)
    this.canBeStatement = false;

  this.next();

  var n = null;
  switch (this.lttype) {
  case 'Identifier':
    if (this.nl) {
      if ((context & CTX_ASYNC_NO_NEWLINE_FN) &&
         this.ltval === 'function')
        n = null;
      else
        n = idAsync(c0,li0,col0,raw);
      break;
    }
    if (this.ltval === 'function') {
      // TODO: eliminate
      if (stmt) {
        this.canBeStatement = stmt;
        if (this.unsatisfiedLabel)
          this.err('async.label.not.allowed',{c0:c0,li0:li0,col0:col0});
        if (this.scope.isBare())
          this.err('async.is.not.allowed',{c0:c0,li0:li0,col0:col0});

        stmt = false;
      }

      n = this.parseFunc(context, ST_ASYNC);
      n.start = c0;
      n.loc.start.line = li0;
      n.loc.start.column = col0;
      break;
    }
    if (context & CTX_ASYNC_NO_NEWLINE_FN) {
      n = null;
      break;
    }
    n = this.parseAsync_intermediate(c0,li0,col0);
    this.st = ERR_INTERMEDIATE_ASYNC;
    this.se = n;
    break;

  case '(':
    if (context & CTX_ASYNC_NO_NEWLINE_FN) {
      n = null;
      break; 
    }
    var hasNewLineBeforeParen = this.nl;
    var args = this.parseParen(context & CTX_PAT), async = idAsync(c0,li0,col0,raw);
    n = {
      type: 'CallExpression', callee: async,
      start: c0, end: args.end,
      loc: {
        start: async.loc.start,
        end: args.loc.end
      }, arguments: args.expr ?
        args.expr.type === 'SequenceExpression' ?
          args.expr.expressions :
          [args.expr] :
        []
    };
    
    if ((context & CTX_PAT) && hasNewLineBeforeParen) {
      this.pt = ERR_ASYNC_NEWLINE_BEFORE_PAREN;
      this.pe = n;
    }

    break;

  default:
    if (context & CTX_ASYNC_NO_NEWLINE_FN)
      n = null;
    else
      n = idAsync(c0,li0,col0,raw);
    break;
  }

  if (stmt)
    this.canBeStatement = stmt;

  return n;
};

this.parseAsync_intermediate = function(c0, li0, col0) {
  var id = this.validateID("");
  return {
    type: INTERMEDIATE_ASYNC,
    id: id,
    start: c0,
    loc: { 
      start: { line: li0, column: col0 }
    }
  };
};


},
function(){
this.parseBlockStatement = function () {
  this.fixupLabels(false);

  this.enterScope(this.scope.blockScope()); 

  var startc = this.c - 1,
      startLoc = this.locOn(1);
  this.next();

  var n = { type: 'BlockStatement', body: this.blck(), start: startc, end: this.c,
        loc: { start: startLoc, end: this.loc() }/*,scope:  this.scope  ,y:-1*/};

  if ( !this.expectType_soft ('}' ) &&
        this.err('block.unfinished',{tn:n,extra:{delim:'}'}}))
    return this.errorHandlerOutput ;

  this.exitScope(); 

  return n;
};

},
function(){
this.parseBreakStatement = function () {
   if (!this.ensureStmt_soft())
     this.err('not.stmt');

   this.fixupLabels(false);
   var startc = this.c0, startLoc = this.locBegin();
   var c = this.c, li = this.li, col = this.col;

   this.next() ;

   var name = null, label = null, semi = 0;

   var semiLoc = null;

   if ( !this.nl && this.lttype === 'Identifier' ) {
       label = this.validateID("");
       name = this.findLabel(label.name + '%');
       if (!name) this.err('break.no.such.label',{tn:label});
       semi = this.semiI();
       semiLoc = this.semiLoc_soft();
       if ( !semiLoc && !this.nl &&
            this.err('no.semi') )
         return this.errorHandlerOutput;

       this.foundStatement = true;
       return { type: 'BreakStatement', label: label, start: startc, end: semi || label.end,
           loc: { start: startLoc, end: semiLoc || label.loc.end } };
   }
   else if (!this.scope.canBreak())
     this.err('break.not.in.breakable', {c0:startc,loc0:startLoc});

   semi = this.semiI();
   semiLoc = this.semiLoc_soft();
   if ( !semiLoc && !this.nl &&
        this.err('no.semi') )
     return this.errorHandlerOutput;

   this.foundStatement = true;
   return { type: 'BreakStatement', label: null, start: startc, end: semi || c,
           loc: { start: startLoc, end: semiLoc || { line: li, column : col } } };
};

},
function(){
this. parseCatchClause = function () {
   var startc = this.c0,
       startLoc = this.locBegin();

   this.next();

   this.enterScope(this.scope.catchHeadScope());
   if ( !this.expectType_soft ('(') &&
        this.err('catch.has.no.opening.paren',{c0:startc,loc0:startLoc}) )
     return this.errorHandlerOutput ;

   this.declMode = DM_CATCHARG;
   var catParam = this.parsePattern();
   if (this.lttype === 'op' && this.ltraw === '=')
     this.err('catch.has.an.assig.param',{c0:startc,loc0:startLoc,extra:catParam});

   this.declMode = DM_NONE;
   if (catParam === null)
     this.err('catch.has.no.param',{c0:startc,loc0:startLoc});

   if (!this.expectType_soft (')'))
     this.err('catch.has.no.end.paren',{c0:startc,loc0:startLoc,extra:catParam});
   this.exitScope();

   this.enterScope(this.scope.catchBodyScope());
   var catBlock = this.parseBlockStatement_dependent('catch');
   this.exitScope();

   return {
       type: 'CatchClause',
        loc: { start: startLoc, end: catBlock.loc.end },
       start: startc,
       end: catBlock.end,
       param: catParam ,
       body: catBlock ,y:-1
   };
};


},
function(){
this. parseClass = function(context) {
  if (this.v <= 5)
    this.err('ver.class');
  if (this.unsatisfiedLabel)
    this.err('class.label.not.allowed');

  var startc = this.c0,
      startLoc = this.locBegin();

  var isStmt = false, name = null;
  if (this.canBeStatement) {
    isStmt = true;
    this.canBeStatement = false;
  }

  this.next(); // 'class'

  // TODO: this is highly unnecessary, and prone to many errors if missed
//this.scope.strict = true;

  var st = ST_NONE;
  if (isStmt) {
    st = ST_DECL;
    if (!this.scope.canDeclareLetOrClass())
      this.err('class.decl.not.in.block',{c0:startc,loc0:startLoc});
    if (this.lttype === 'Identifier' && this.ltval !== 'extends') {
      this.declMode = DM_CLS;
      name = this.parsePattern();
    }
    else if (!(context & CTX_DEFAULT))
      this.err('class.decl.has.no.name', {c0:startc,loc0:startLoc});
  }
  else if (this.lttype === 'Identifier' && this.ltval !== 'extends') {
    st = ST_EXPR;
    name = this.validateID("");
  }

  var superClass = null;
  if ( this.lttype === 'Identifier' && this.ltval === 'extends' ) {
     this.next();
     superClass = this.parseExprHead(CTX_NONE);
  }

  var memParseFlags = ST_CLSMEM, memParseContext = CTX_NONE;
  this.enterScope(this.scope.clsScope(st));
  if (this.scope.isExpr() && name)
    this.scope.setName(name);

  if (superClass)
    this.scope.mode |= SM_CLS_WITH_SUPER;

  var list = [];
  var startcBody = this.c - 1, startLocBody = this.locOn(1);

  if (!this.expectType_soft('{'))
    this.err('class.no.curly',{c0:startc,loc0:startLoc,extra:{n:name,s:superClass,c:context}});

  var elem = null;

  while (true) {
    if (this.lttype === ';') {
      this.next();
      continue;
    }
    elem = this.parseMem(memParseContext, memParseFlags);
    if (elem !== null) {
      list.push(elem);
      if (elem.kind === 'constructor')
        memParseContext |= CTX_CTOR_NOT_ALLOWED;
    }
    else break;
  }

  var endLoc = this.loc();
  var n = {
    type: isStmt ? 'ClassDeclaration' : 'ClassExpression', id: name, start: startc,
    end: this.c, superClass: superClass,
    loc: { start: startLoc, end: endLoc },
    body: {
      type: 'ClassBody', loc: { start: startLocBody, end: endLoc },
      start: startcBody, end: this.c,
      body: list ,y:-1
    } ,y:-1 
  };

  if (!this.expectType_soft('}'))
    this.err('class.unfinished',{tn:n, extra:{delim:'}'}});

  this.exitScope();

  if (isStmt)
    this.foundStatement = true;

  return n;
};

this.parseSuper = function() {
  if (this.v <=5 ) this.err('ver.super');

  var n = {
    type: 'Super', loc: { start: this.locBegin(), end: this.loc() },
    start: this.c0, end: this.c
  };
 
  this.next();
  switch ( this.lttype ) {
  case '(':
    if (!this.scope.canSupCall())
      this.err('class.super.call',{tn:n});
 
    break;
 
  case '.':
  case '[':
    if (!this.scope.canSupMem())
      this.err('class.super.mem',{tn:n});
 
    break ;
  
  default:
    this.err('class.super.lone',{tn:n}); 

  }
 
  return n;
};

},
function(){
this.readMultiComment = function () {
  var c = this.c, l = this.src, e = l.length,
      r = -1, n = true, start = c;

  var c0 = c, li0 = this.li, col0 = this.col;

  while (c < e) {
    switch (r = l.charCodeAt(c++ ) ) {
    case CH_MUL:
      if (l.charCodeAt(c) === CH_DIV) {
        c++;
        this.col += (c-start);
        this.c = c;
        if (this.onComment_ !== null)
          this.onComment(true,c0,{line:li0,column:col0},
            this.c,{line:this.li,column:this.col});

        return n;
      }
      continue ;

    case CH_CARRIAGE_RETURN:
      if (CH_LINE_FEED === l.charCodeAt(c))
        c++;
    case CH_LINE_FEED:
    case 0x2028:
    case 0x2029:
      start = c;
      if (n)
        n = false;
      this.col = 0;
      this.li++;
      continue;

//  default : if ( r >= 0x0D800 && r <= 0x0DBFF ) this.col-- ;

    }
  }

  this.col += (c-start);
  this.c = c;

  this.err( 'comment.multi.unfinished',{extra:{c0:c0,li0:li0,col0:col0}});
};

this.readLineComment = function() {
  var c = this.c, l = this.src,
      e = l.length, r = -1;

  var c0 = c, li0 = this.li, col0 = this.col, li = -1, col = -1;

  L:
  while ( c < e )
    switch (r = l.charCodeAt(c++ ) ) {
    case CH_CARRIAGE_RETURN:
      if (CH_LINE_FEED === l.charCodeAt(c))
        c++;
    case CH_LINE_FEED :
    case 0x2028:
    case 0x2029 :
      col = this.col;
      li = this.li;
      this.col = 0 ;
      this.li++;
      break L;
    
//  default : if ( r >= 0x0D800 && r <= 0x0DBFF ) this.col-- ;
    }

   this.c=c;

   if (this.onComment_ !== null) {
     if (li === -1) { li = this.li; col = this.col; }
     this.onComment(false,c0,{line:li0,column:col0},
       this.c,{line:li,column:col+(c-c0)});
   }

   return;
};

},
function(){
this.parseCond = function(cond, context) {
  this.next();
  var seq =
    this.parseNonSeqExpr(PREC_WITH_NO_OP, CTX_NONE);

  if (!this.expectType_soft(':'))
    this.err('cond.colon',{extra:[cond,seq,context]});

  var alt =
    this.parseNonSeqExpr(PREC_WITH_NO_OP, context & CTX_FOR);

  return {
    type: 'ConditionalExpression', test: core(cond),
    start: cond.start, end: alt.end,
    loc: {
      start: cond.loc.start,
      end: alt.loc.end
    }, consequent: core(seq),
    alternate: core(alt)  ,y:-1
  };
};



},
function(){
this.parseContinueStatement = function () {
   if (!this.ensureStmt_soft())
     this.err('not.stmt');

   this.fixupLabels(false);

   if (!this.scope.canContinue())
     this.err('continue.not.in.loop');

   var startc = this.c0, startLoc = this.locBegin();
   var c = this.c, li = this.li, col = this.col;

   this.next() ;

   var name = null, label = null, semi = 0;

   var semiLoc = null;

   if ( !this.nl && this.lttype === 'Identifier' ) {
       label = this.validateID("");
       name = this.findLabel(label.name + '%');
       if (!name) this.err('continue.no.such.label',{tn:label,extra:{c0:startc,loc0:startLoc}}) ;

       // TODO: tell what it is labeling
       if (!name.loop) this.err('continue.not.a.loop.label',{tn:label,extra:{c0:startc,loc0:startLoc}});

       semi = this.semiI();
       semiLoc = this.semiLoc_soft();
       if ( !semiLoc && !this.nl &&
             this.err('no.semi') )
         return this.errorHandlerOutput;

       this.foundStatement = true;
       return { type: 'ContinueStatement', label: label, start: startc, end: semi || label.end,
           loc: { start: startLoc, end: semiLoc || label.loc.end } };
   }
   semi = this.semiI();
   semiLoc = this.semiLoc_soft();
   if ( !semiLoc && !this.nl &&
         this.err('no.semi') )
     return this.errorHandlerOutput;

   this.foundStatement = true;
   return { type: 'ContinueStatement', label: null, start: startc, end: semi || c,
           loc: { start: startLoc, end: semiLoc || { line: li, column : col } } };
};

},
function(){
this . prseDbg = function () {
  if (! this.ensureStmt_soft () &&
        this.err('not.stmt') )
    return this.errorHandlerOutput ;

  this.fixupLabels(false);

  var startc = this.c0,
      startLoc = this.locBegin();
  var c = this.c, li = this.li, col = this.col;

  this.next() ;
  if ( this. lttype ===  ';' ) {
    c = this.c;
    li = this.li;
    col = this.col;
    this.next();
  } 
  else if ( !this.nl &&
     this.err('no.semi') )
     return this.errorHandlerOutput;

  this.foundStatement = true;
  return {
     type: 'DebuggerStatement',
      loc: { start: startLoc, end: { line: li, column: col } } ,
     start: startc,
     end: c
   };
};

},
function(){
this. parseBlockStatement_dependent = function(name) {
    var startc = this.c - 1,
        startLoc = this.locOn(1);

    if (!this.expectType_soft ('{'))
      this.err('block.dependent.no.opening.curly',{extra:{name:name}});

    var n = { type: 'BlockStatement', body: this.blck(), start: startc, end: this.c,
        loc: { start: startLoc, end: this.loc() }/*,scope:  this.scope  ,y:-1*/ };
    if ( ! this.expectType_soft ('}') &&
         this.err('block.dependent.is.unfinished',{tn:n, extra:{delim:'}'}})  )
      return this.errorHandlerOutput;

    return n;
};

},
function(){
this.parseDoWhileStatement = function () {
  if (!this.ensureStmt_soft())
    this.err('not.stmt');

  this.enterScope(this.scope.bodyScope());
  this.allow(SA_BREAK|SA_CONTINUE);
  this.fixupLabels(true);

  var startc = this.c0,
      startLoc = this.locBegin() ;
  this.next() ;
  var nbody = this.parseStatement (true) ;
  if (this.lttype === 'Identifier' && this.ltval === 'while') {
    this.kw(); this.next();
  }
  else
    this.err('do.has.no.while',{extra:[startc,startLoc,nbody]});

  if ( !this.expectType_soft('(') &&
        this.err('do.has.no.opening.paren',{extra:[startc,startLoc,nbody]}) )
    return this.errorHandlerOutput;

  var cond = core(this.parseExpr(CTX_NONE|CTX_TOP));
  var c = this.c, li = this.li, col = this.col;
  if ( !this.expectType_soft (')') &&
        this.err('do.has.no.closing.paren',{extra:[startc,startLoc,nbody,cond]}) )
    return this.errorHandlerOutput;

  if (this.lttype === ';' ) {
     c = this.c;
     li = this.li ;
     col = this.col;
     this.next();
  }

 this.foundStatement = true;
 this.exitScope(); 

 return { type: 'DoWhileStatement', test: cond, start: startc, end: c,
          body: nbody, loc: { start: startLoc, end: { line: li, column: col } }  ,y:-1} ;
};

},
function(){
this .parseEmptyStatement = function() {
  var n = { type: 'EmptyStatement',
           start: this.c - 1,
           loc: { start: this.locOn(1), end: this.loc() },
            end: this.c };
  this.next();
  return n;
};

},
function(){
this.readEsc = function ()  {
  var src = this.src, b0 = 0, b = 0, start = this.c;
  switch ( src.charCodeAt ( ++this.c ) ) {
   case CH_BACK_SLASH: return '\\';
   case CH_MULTI_QUOTE: return'\"' ;
   case CH_SINGLE_QUOTE: return '\'' ;
   case CH_b: return '\b' ;
   case CH_v: return '\v' ;
   case CH_f: return '\f' ;
   case CH_t: return '\t' ;
   case CH_r: return '\r' ;
   case CH_n: return '\n' ;
   case CH_u:
      b0 = this.peekUSeq();
      if ( b0 >= 0x0D800 && b0 <= 0x0DBFF ) {
        this.c++;
        return String.fromCharCode(b0, this.peekTheSecondByte());
      }
      return fromcode(b0);

   case CH_x :
      b0 = toNum(this.src.charCodeAt(++this.c));
      if ( b0 === -1 && this.err('hex.esc.byte.not.hex') )
        return this.errorHandlerOutput;
      b = toNum(this.src.charCodeAt(++this.c));
      if ( b === -1 && this.err('hex.esc.byte.not.hex') )
        return this.errorHandlerOutput;
      return String.fromCharCode((b0<<4)|b);

   case CH_0: case CH_1: case CH_2:
   case CH_3:
       b0 = src.charCodeAt(this.c);
       if ( this.scope.insideStrict() ) {
          if ( b0 === CH_0 ) {
               b0 = src.charCodeAt(this.c +  1);
               if ( b0 < CH_0 || b0 >= CH_8 )
                 return '\0';
          }
          if ( this.err('strict.oct.str.esc') )
            return this.errorHandlerOutput
       }
       else if (this.directive !== DIR_NONE) {
         if (this.esct === ERR_NONE_YET) {
           this.eloc.c0 = this.c;
           this.eloc.li0 = this.li;
           this.eloc.col0 = this.col + (this.c-start);
           this.esct = ERR_PIN_OCTAL_IN_STRICT;
         }
       }

       b = b0 - CH_0;
       b0 = src.charCodeAt(this.c + 1 );
       if ( b0 >= CH_0 && b0 < CH_8 ) {
          this.c++;
          b <<= 3;
          b += (b0-CH_0);
          b0 = src.charCodeAt(this.c+1);
          if ( b0 >= CH_0 && b0 < CH_8 ) {
             this.c++;
             b <<= 3;
             b += (b0-CH_0);
          }
       }
       return String.fromCharCode(b)  ;

    case CH_4: case CH_5: case CH_6: case CH_7:
       if (this.scope.insideStrict())
         this.err('strict.oct.str.esc');
       else if (this.directive !== DIR_NONE) {
         if (this.esct === ERR_NONE_YET) {
           this.eloc.c0 = this.c;
           this.eloc.li0 = this.li;
           this.eloc.col0 = this.col + (this.c-start);
           this.esct = ERR_PIN_OCTAL_IN_STRICT;
         }
       }

       b0 = src.charCodeAt(this.c);
       b  = b0 - CH_0;
       b0 = src.charCodeAt(this.c + 1 );
       if ( b0 >= CH_0 && b0 < CH_8 ) {
          this.c++; 
          b <<= 3; 
          b += (b0-CH_0);
       }
       return String.fromCharCode(b)  ;

   case CH_8:
   case CH_9:
       if ( this.err('esc.8.or.9') ) 
         return this.errorHandlerOutput ;
       return '';

   case CH_CARRIAGE_RETURN:
      if ( src.charCodeAt(this.c + 1) === CH_LINE_FEED ) this.c++;
   case CH_LINE_FEED:
   case 0x2028:
   case 0x2029:
      start = this.c;
      this.col = 0;
      this.li++;
      return '';

   default:
      return src.charAt(this.c) ;
  }
};

this.readStrictEsc = function ()  {
  var src = this.src, b0 = 0, b = 0;
  switch ( src.charCodeAt ( ++this.c ) ) {
   case CH_BACK_SLASH: return '\\';
   case CH_MULTI_QUOTE: return'\"' ;
   case CH_SINGLE_QUOTE: return '\'' ;
   case CH_b: return '\b' ;
   case CH_v: return '\v' ;
   case CH_f: return '\f' ;
   case CH_t: return '\t' ;
   case CH_r: return '\r' ;
   case CH_n: return '\n' ;
   case CH_u:
      b0 = this.peekUSeq();
      if ( b0 >= 0x0D800 && b0 <= 0x0DBFF ) {
        this.c++;
        return String.fromCharCode(b0, this.peekTheSecondByte());
      }
      return fromcode(b0);

   case CH_x :
      b0 = toNum(this.src.charCodeAt(++this.c));
      if ( b0 === -1 && this.err('hex.esc.byte.not.hex') )
        return this.errorHandlerOutput;
      b = toNum(this.src.charCodeAt(++this.c));
      if ( b0 === -1 && this.err('hex.esc.byte.not.hex') )
        return this.errorHandlerOutput;
      return String.fromCharCode((b0<<4)|b);

   case CH_0: case CH_1: case CH_2:
   case CH_3:
       b0 = src.charCodeAt(this.c);
       if ( b0 === CH_0 ) {
            b0 = src.charCodeAt(this.c +  1);
            if ( b0 < CH_0 || b0 >= CH_8 )
              return '\0';
       }
       if ( this.err('strict.oct.str.esc.templ') )
         return this.errorHandlerOutput

    case CH_4: case CH_5: case CH_6: case CH_7:
       if (this.err('strict.oct.str.esc.templ') )
         return this.errorHandlerOutput  ;

   case CH_8:
   case CH_9:
       if ( this.err('esc.8.or.9') ) 
         return this.errorHandlerOutput ;

   case CH_CARRIAGE_RETURN:
      if ( src.charCodeAt(this.c + 1) === CH_LINE_FEED ) this.c++;
   case CH_LINE_FEED:
   case 0x2028:
   case 0x2029:
      this.col = 0;
      this.li++;
      return '';

   default:
      return src.charAt(this.c) ;
  }
};



},
function(){

this.peekTheSecondByte = function () {
  var e = this.src.charCodeAt(this.c), start = this.c;
  if (CH_BACK_SLASH === e) {
    if (CH_u !== this.src.charCodeAt(++this.c) &&
        this.err('u.second.esc.not.u') )
      return this.errorHandlerOutput ;

    e = (this.peekUSeq());
  }
//  else this.col--;
  if ( (e < 0x0DC00 || e > 0x0DFFF) && this.err('u.second.not.in.range',{extra:start}) )
    return this.errorHandlerOutput;

  return e;
};

this.peekUSeq = function () {
  var c = ++this.c, l = this.src, e = l.length;
  var byteVal = 0;
  var n = l.charCodeAt(c);
  if (CH_LCURLY === n) { // u{ 
    ++c;
    n = l.charCodeAt(c);
    do {
      n = toNum(n);
      if ( n === - 1 && this.err('u.esc.hex',{c0:c}) )
        return this.errorHandlerOutput ;

      byteVal <<= 4;
      byteVal += n;
      if (byteVal > 0x010FFFF && this.err('u.curly.not.in.range',{c0:c}) )
        return this.errorHandler ;

      n = l.charCodeAt( ++ c);
    } while (c < e && n !== CH_RCURLY);

    if ( n !== CH_RCURLY && this.err('u.curly.is.unfinished',{c0:c}) ) 
      return this.errorHandlerOutput ;

    this.c = c;
    return byteVal;
  }
 
  n = toNum(l.charCodeAt(c));
  if ( n === -1 && this.err('u.esc.hex',{c0:c}) )
    return this.errorHandlerOutput;
  byteVal = n;
  c++ ;
  n = toNum(l.charCodeAt(c));
  if ( n === -1 && this.err('u.esc.hex',{c0:c}) )
    return this.errorHandlerOutput;
  byteVal <<= 4; byteVal += n;
  c++ ;
  n = toNum(l.charCodeAt(c));
  if ( n === -1 && this.err('u.esc.hex',{c0:c}) )
    return this.errorHandlerOutput;
  byteVal <<= 4; byteVal += n;
  c++ ;
  n = toNum(l.charCodeAt(c));
  if ( n === -1 && this.err('u.esc.hex',{c0:c}) )
    return this.errorHandlerOutput;
  byteVal <<= 4; byteVal += n;

  this.c = c;

  return byteVal;
};



},
function(){
this.parseExport = function() {
  if (this.v <= 5) this.err('ver.exim');

  if ( !this.canBeStatement && this.err('not.stmt') )
    return this.errorHandlerOutput ;

  this.canBeStatement = false;

  var startc = this.c0, startLoc = this.locBegin();
  this.next();

  var list = [], local = null, src = null ;
  var endI = 0;
  var ex = null;

  var semiLoc = null;
  switch ( this.lttype ) {
  case 'op':
    if (this.ltraw !== '*' &&
        this.err('export.all.not.*',{extra:[startc,startLoc]}) )
      return this.errorHandlerOutput;
 
    this.next();
    if ( !this.expectID_soft('from') &&
          this.err('export.all.no.from',{extra:[startc,startLoc]}) )
      return this.errorHandlerOutput;

    if (!(this.lttype === 'Literal' &&
         typeof this.ltval === STRING_TYPE ) && 
         this.err('export.all.source.not.str',{extra:[startc,startLoc]}) )
      return this.errorHandlerOutput;

    src = this.numstr();
    
    endI = this.semiI();
    semiLoc = this.semiLoc_soft();
    if ( !semiLoc && !this.newlineBeforeLookAhead &&
         this.err('no.semi') )
      return this.errorHandlerOutput;

    this.foundStatement = true;
    
    return  { type: 'ExportAllDeclaration',
               start: startc,
               loc: { start: startLoc, end: semiLoc || src.loc.end },
                end: endI || src.end,
               source: src };

   case '{':
     this.next();
     var firstReserved = null;

     while ( this.lttype === 'Identifier' ) {
       local = this.id();
       if ( !firstReserved ) {
         this.throwReserved = false;
         this.validateID(local.name);
         if ( this.throwReserved )
           firstReserved = local;
         else
           this.throwReserved = true;
       }
       ex = local;
       if ( this.lttype === 'Identifier' ) {
         if ( this.ltval !== 'as' && 
              this.err('export.specifier.not.as',{extra:[startc,startLoc,local,list]}) )
           return this.errorHandlerOutput ;

         this.next();
         if ( this.lttype !== 'Identifier' ) { 
            if (  this.err('export.specifier.after.as.id',{extra:[startc,startLoc,local,list]}) )
           return this.errorHandlerOutput;
         }
         else
            ex = this.id();
       }
       list.push({ type: 'ExportSpecifier',
                  start: local.start,
                  loc: { start: local.loc.start, end: ex.loc.end }, 
                   end: ex.end, exported: ex,
                  local: local }) ;

       if ( this.lttype === ',' )
         this.next();
       else
         break;
     }

     endI = this.c;
     var li = this.li, col = this.col;
  
     if ( !this.expectType_soft('}') && 
           this.err('export.named.list.not.finished',{extra:[startc,startLoc,list,endI,li,col]}) )
       return this.errorHandlerOutput  ;

     if ( this.lttype === 'Identifier' ) {
       if ( this.ltval !== 'from' &&
            this.err('export.named.not.id.from',{extra:[startc,startLoc,list,endI,li,col]}) )
          return this.errorHandlerOutput;

       else this.next();
       if ( !( this.lttype === 'Literal' &&
              typeof this.ltval ===  STRING_TYPE) &&
            this.err('export.named.source.not.str', {extra:[startc,startloc,list,endI,li,col]}) )
         return this.errorHandlerOutput ;

       else {
          src = this.numstr();
          endI = src.end;
       }
     }
     else
        if (firstReserved && this.err('export.named.has.reserved',{tn:firstReserved,extra:[startc,startLoc,list,endI,li,col]}) )
          return this.errorHandlerOutput ;

     endI = this.semiI() || endI;
     semiLoc = this.semiLoc_soft();
     if ( !semiLoc && !this.nl &&
          this.err('no.semi'))
       return this.errorHandlerOutput; 

     this.foundStatement = true;
     return { type: 'ExportNamedDeclaration',
             start: startc,
             loc: { start: startLoc, end: semiLoc || ( src && src.loc.end ) ||
                                          { line: li, column: col } },
              end: endI, declaration: null,
               specifiers: list,
              source: src };

  }

  var context = CTX_NONE;

  if ( this.lttype === 'Identifier' && 
       this.ltval === 'default' ) {
    context = CTX_DEFAULT;
    if (this.onToken_ !== null)
      this.lttype = 'Keyword';
    this.next();
  }
  
  if ( this.lttype === 'Identifier' ) {
      switch ( this.ltval ) {
         case 'let':
         case 'const':
            if (context === CTX_DEFAULT && 
                this.err('export.default.const.let',{extra:[startc,startLoc]}) )
              return this.errorHandlerOutput;
                
            this.canBeStatement = true;
            ex = this.parseVariableDeclaration(CTX_NONE);
            break;
              
         case 'class':
            this.canBeStatement = true;
            ex = this.parseClass(context);
            break;
  
         case 'var':
            this.canBeStatement = true;
            ex = this.parseVariableDeclaration(CTX_NONE ) ;
            break ;

         case 'function':
            this.canBeStatement = true;
            ex = this.parseFunc( context, 0 );
            break ;

         case 'async':
           this.canBeStatement = true;
           if (context & CTX_DEFAULT) {
             ex = this.parseAsync(context);
             if (this.foundStatement)
               this.foundStatement = false;
             else {
               this.pendingExprHead = ex;
               ex = null;
             }
             break;
           }

           ex = this.parseAsync(context|CTX_ASYNC_NO_NEWLINE_FN);
           if (ex === null) {
             if (this.lttype === 'Identifier' && this.ltval === 'function') {
               ASSERT.call(this, this.nl, 'no newline before the "function" thing and still errors? -- impossible!');
               this.err('export.newline.before.the.function', {extra:[startc,startLoc]});
             } 
             else
               this.err('export.async.but.no.function',{extra:[startc,startLoc]});
           }
       }
  }

  if ( context !== CTX_DEFAULT ) {

    if (!ex && this.err('export.named.no.exports',{extra:[startc,startLoc]}) )
      return this.errorHandlerOutput ;
    
    this.foundStatement = true;
    return { type: 'ExportNamedDeclaration',
           start: startc,
           loc: { start: startLoc, end: ex.loc.end },
            end: ex.end , declaration: ex,
             specifiers: list ,
            source: null };
  }

  var endLoc = null;

  if ( ex === null ) {
    // TODO: this can exclusively happen as a result of calling `parseAsync` for parsing an async declaration;
    // eliminate
    if (this.canBeStatement)
      this.canBeStatement = false

    ex = this.parseNonSeqExpr(PREC_WITH_NO_OP, CTX_NONE|CTX_PAT );
    endI = this.semiI();
    endLoc = this.semiLoc_soft(); // TODO: semiLoc rather than endLoc
    if ( !endLoc && !this.nl &&
         this.err('no.semi') )
      return this.errorHandlerOutput;
  }

  this.foundStatement = true;
  return { type: 'ExportDefaultDeclaration',    
          start: startc,
          loc: { start: startLoc, end: endLoc || ex.loc.end },
           end: endI || ex.end, declaration: core( ex ) };
}; 

},
function(){
this.parseExprHead = function (context) {
  var head = null, inner = null, elem = null;

  if (this.pendingExprHead) {
    head = this.pendingExprHead;
    this.pendingExprHead = null;
  }
  else
    switch (this.lttype)  {
    case 'Identifier':
      if (head = this.parseIdStatementOrId(context))
        break;

      return null;

    case '[' :
      head = this.parseArrayExpression(context);
      break;

    case '(' :
      head = this.parseParen(context);
      break;

    case '{' :
      head = this.parseObjectExpression(context) ;
      break;

    case '/' :
      head = this.parseRegExpLiteral() ;
      break;

    case '`' :
        head = this.parseTemplateLiteral() ;
        break;

    case 'Literal':
      head = this.numstr();
      break;

    case '-':
      this.prec = PREC_U;
      return null;

    default:
      return null;
   
    }
    
  if (head.type === 'Identifier')
    this.scope.reference(head.name);

  switch (this.lttype) {
  case '.':
  case '[':
  case '(':
  case '`':
    this.currentExprIsSimple();
  }

  inner = core( head ) ;

  LOOP:
  while ( true ) {
    switch (this.lttype ) {
    case '.':
      this.next();
      if (this.lttype !== 'Identifier')
        this.err('mem.name.not.id');

      // TODO: null?
      elem  = this.memberID();
      if (elem === null)
        this.err('mem.id.is.null');

      head = { 
        type: 'MemberExpression', property: elem,
        start: head.start, end: elem.end,
        loc: {
          start: head.loc.start,
          end: elem.loc.end 
        }, object: inner,
        computed: false  ,y:-1
      };

      inner = head ;
      continue;

    case '[':
      this.next() ;
      elem = this.parseExpr(PREC_WITH_NO_OP,CTX_NONE);
      head = {
        type: 'MemberExpression', property: core(elem),
        start: head.start, end: this.c,
        loc : {
          start: head.loc.start,
          end: this.loc()
        }, object: inner,
        computed: true  ,y:-1
      };
      inner  = head ;
      if (!this.expectType_soft (']'))
        this.err('mem.unfinished');
      continue;

    case '(':
      elem = this.parseArgList();
      head = {
        type: 'CallExpression', callee: inner,
        start: head.start, end: this.c, arguments: elem,
        loc: {
          start: head.loc.start,
          end: this.loc()
        }  ,y:-1
      };

      if (!this.expectType_soft (')'))
        this.err('call.args.is.unfinished', {tn:elem,extra:{delim:')'}});

      inner = head  ;
      continue;

    case '`' :
      elem = this. parseTemplateLiteral();
      head = {
        type : 'TaggedTemplateExpression', quasi : elem,
        start: head.start, end: elem.end,
        loc : {
          start: head.loc.start,
          end: elem.loc.end
        }, tag : inner ,y:-1
      };
      inner = head;
      continue ;

    default: break LOOP;
    }

  }

  return head ;
};



},
function(){
this.parseFor = function() {
  if (!this.ensureStmt_soft())
    this.err('not.stmt');

  this.fixupLabels(true) ;

  var startc = this.c0,
      startLoc = this.locBegin();

  this.next () ;
  if (!this.expectType_soft ('('))
    this.err('for.with.no.opening.paren',{extra:[startc,startLoc]});

  this.enterScope(this.scope.bodyScope());
  this.scope.enterForInit();
  var head = null, headIsExpr = false;
  this.missingInit = false;

  if ( this.lttype === 'Identifier' ) {
    switch ( this.ltval ) {
    case 'var':
      this.canBeStatement = true;
      head = this.parseVariableDeclaration(CTX_FOR);
      break;

    case 'let':
      if ( this.v > 5 ) {
        this.canBeStatement = true;
        head = this.parseLet(CTX_FOR);
      }
      break;

    case 'const' :
      if (this.v < 5)
        this.err('for.const.not.in.v5',{extra:[startc,startLoc,scopeFlags]});

      this.canBeStatement = true;
      head = this. parseVariableDeclaration(CTX_FOR);
         break ;

    }
  }

  if (head === null) {
    headIsExpr = true;
    head = this.parseExpr( CTX_NULLABLE|CTX_PAT|CTX_FOR ) ;
  }
  else 
    this.foundStatement = false;

  this.scope.exitForInit();

  var nbody = null;
  var afterHead = null;

  if (head !== null && this.lttype === 'Identifier') {
    var kind = 'ForInStatement';
    switch ( this.ltval ) {
    case 'of':
       kind = 'ForOfStatement';
       this.ensureVarsAreNotResolvingToCatchParams();

    case 'in':
      if (this.ltval === 'in')
        this.resvchk();

      if (headIsExpr) {
        if (head.type === 'AssignmentExpression') { // TODO: not in the spec
          // TODO: squash with the `else if (head.init)` below
        //if (this.scope.insideStrict() || kind === 'ForOfStatement' || this.v < 7)
            this.err('for.in.has.init.assig',{tn:head,extra:[startc,startLoc,kind]});
        }
        this.adjustErrors()
        this.toAssig(head, CTX_FOR|CTX_PAT);
        this.currentExprIsAssig();
      }
      else if (head.declarations.length !== 1)
        this.err('for.decl.multi',{tn:head,extra:[startc,startLoc,kind]});
      else if (this.missingInit)
        this.missingInit = false;
      else if (head.declarations[0].init) {
        if (this.scope.insideStrict() || kind === 'ForOfStatement' ||
            this.v < 7 || head.declarations[0].id.type !== 'Identifier' || head.kind !== 'var')
          this.err('for.in.has.decl.init',{tn:head,extra:[startc,startLoc,kind]});
      }

      this.next();
      afterHead = kind === 'ForOfStatement' ? 
        this.parseNonSeqExpr(PREC_WITH_NO_OP, CTX_NONE|CTX_PAT|CTX_NO_SIMPLE_ERR) :
        this.parseExpr(CTX_NONE|CTX_TOP);

      if (!this.expectType_soft(')'))
        this.err('for.iter.no.end.paren',{extra:[head,startc,startLoc,afterHead,kind]});

      nbody = this.parseStatement(true);
      if (!nbody)
        this.err('null.stmt');

      this.foundStatement = true;
      this.exitScope();

      return {
        type: kind, loc: { start: startLoc, end: nbody.loc.end },
        start: startc, end: nbody.end,
        right: core(afterHead), left: head,
        body: nbody ,y:-1
      };

    default:
      this.err('for.iter.not.of.in',{extra:[startc,startLoc,head]});

    }
  }

  if (headIsExpr)
    this.currentExprIsSimple();
  else if (head && this.missingInit)
    this.err('for.decl.no.init',{extra:[startc,startLoc,head]});

  if (!this.expectType_soft (';'))
    this.err('for.simple.no.init.semi',{extra:[startc,startLoc,head]});

  afterHead = this.parseExpr(CTX_NULLABLE|CTX_PAT|CTX_NO_SIMPLE_ERR);
  if (!this.expectType_soft (';'))
    this.err('for.simple.no.test.semi',{extra:[startc,startLoc,head,afterHead]});

  var tail = this.parseExpr(CTX_NULLABLE|CTX_PAT|CTX_NO_SIMPLE_ERR);
  if (!this.expectType_soft (')'))
    this.err('for.simple.no.end.paren',{extra:[startc,startLoc,head,afterHead,tail]});

  nbody = this.parseStatement(true);
  if (!nbody)
    this.err('null.stmt');
  this.foundStatement = true;
  this.exitScope();

  return {
    type: 'ForStatement', init: head && core(head), 
    start : startc, end: nbody.end,
    test: afterHead && core(afterHead),
    loc: { start: startLoc, end: nbody.loc.end },
    update: tail && core(tail), body: nbody ,y:-1
  };
};

// TODO: exsureVarsAreNotResolvingToCatchParams_soft
this.ensureVarsAreNotResolvingToCatchParams = function() {
  return;
  var list = this.scope.nameList, e = 0;
  while (e < list.length) {
    if (list[e].type & DECL_MODE_CATCH_PARAMS)
      this.err('for.of.var.overrides.catch',{tn:this.idNames[list[e].id.name+'%']});
    e++;
  }
};

},
function(){
this.parseFunc = function(context, st) {
  var prevLabels = this.labels,
      prevDeclMode = this.declMode; 

  var isStmt = false,
      startc = this.c0,
      startLoc = this.locBegin();

  if (this.canBeStatement) {
    isStmt = true;
    this.canBeStatement = false;
  }

  var isGen = false,
      isMeth = st & (ST_CLSMEM|ST_OBJMEM);

  var fnName = null,
      argLen = !(st & ST_ACCESSOR) ? ARGLEN_ANY :
        (st & ST_SETTER) ? ARGLEN_SET : ARGLEN_GET;

  // it is not a meth -- so the next token is `function`
  if (!isMeth) {
    this.next();
    st |= isStmt ? ST_DECL : ST_EXPR;
    if (this.lttype === 'op' && this.ltraw === '*') {
      if (this.v <= 5)
        this.err('ver.gen');
      if (isStmt) {
        if (st & ST_ASYNC)
          this.err('async.gen.not.yet.supported');
        if (this.unsatisfiedlLabel)
          this.err('gen.label.notAllowed');
        if (this.scope.isBody())
          this.err('gen.decl.not.allowed');
      }
      isGen = true;
      st |= ST_GEN;
      this.next();
    }
    else {
      st |= ST_FN;
      if (isStmt) {
        var isAsync = st & ST_ASYNC;
        if (this.scope.isBare()) {
          if (isAsync)
            this.err('async.decl.not.allowed');
          if (!this.scope.insideIf() || this.scope.insideStrict())
            this.err('func.decl.not.allowed');
          if (this.unsatisfiedLabel)
            this.fixupLabels(false);
        }

        if (this.unsatisfiedLabel) {
          if (this.scope.insideStrict() | (st & (ST_ASYNC|ST_GEN)))
            this.err('func.label.not.allowed');
        }
      }
    }

    if (isStmt) {
      if (this.lttype === 'Identifier') {
        this.declMode = DM_FUNCTION;
        fnName = this.parsePattern();

      } else if (!(context & CTX_DEFAULT)) {
        this.err('func.decl.has.no.name');
      }
      // get the name and enter the scope
    }
    else {
      // enter the scope and get the name
      if (this.lttype === 'Identifier') {
        var temp = 0;
        if (st & ST_GEN) {
          temp = this.scop.mode;
          this.scope.mode |= SM_YIELD_KW;
          fnName = this.parseFuncExprName();
          this.scope.mode = temp;
        }
        else {
          temp = this.scope.allowed;
          this.scope.allowed &= ~SA_YIELD;
          fnName = this.parseFuncExprName();
          this.scope.allowed = temp;
        }
      }
    }
  }

  this.enterScope(this.scope.fnHeadScope(st));
  if (fnName && this.scope.isExpr())
    this.scope.setName(fnName);

  this.declMode = DM_FNARG;
  var argList = this.parseArgs(argLen);
  var fnHeadScope = this.exitScope();

  this.labels = {};

  this.enterScope(this.scope.fnBodyScope(st));
  this.scope.funcHead = fnHeadScope;
  var body = this.parseFuncBody(context & CTX_FOR);
  this.exitScope();

  var n = {
    type: isStmt ? 'FunctionDeclaration' : 'FunctionExpression',
    id: fnName,
    start: startc,
    end: body.end,
    generator: (st & ST_GEN) !== 0,
    body: body,
    loc: { start: startLoc, end: body.loc.end },
    expression: body.type !== 'BlockStatement', params: argList,
    async: (st & ST_ASYNC) !== 0
  };

  if (isStmt)
    this.foundStatement = true;

  this.labels = prevLabels;
  this.declMode = prevDeclMode;

  return n;
};

this.parseFuncExprName = function() {
  var name = this.validateID("");
  if (this.scope.insideStrict() && arguments_or_eval(fnName.name))
    this.err('bind.eval.or.arguments');
  return name;
};

},
function(){
this.parseFuncBody = function(context) {
  var elem = null;
  
  if ( this.lttype !== '{' ) {
    elem = this.parseNonSeqExpr(PREC_WITH_NO_OP, context|CTX_NULLABLE|CTX_PAT);
    if ( elem === null )
      return this.err('func.body.is.empty.expr');
    return elem;
  }

  var startc= this.c - 1, startLoc = this.locOn(1);

  this.directive = DIR_FUNC;
  this.clearAllStrictErrors();

  this.next() ;

  var list = this.blck();

  var n = { type : 'BlockStatement', body: list, start: startc, end: this.c,
           loc: { start: startLoc, end: this.loc() }/* ,scope: this.scope ,y:-1*/ };

  if ( ! this.expectType_soft ( '}' ) &&
         this.err('func.body.is.unfinished') )
    return this.errorHandlerOutput ;

  return  n;
};



},
function(){
this.parseArgs = function (argLen) {
  var c0 = -1, li0 = -1, col0 = -1, tail = true,
      list = [], elem = null;

  if (!this.expectType_soft('('))
    this.err('func.args.no.opening.paren');

  var gotNonSimple = false;
  while (list.length !== argLen) {
    elem = this.parsePattern();
    if (elem) {
      if (this.lttype === 'op' && this.ltraw === '=') {
        this.scope.enterUniqueArgs();
        elem = this.parseAssig(elem);
      }
      if (!gotNonSimple && elem.type !== 'Identifier') {
        gotNonSimple = true;
        this.scope.firstNonSimple = elem;
      }
      list.push(elem);
    }
    else {
      if (list.length !== 0) {
        if (this.v < 7)
          this.err('arg.non.tail.in.func',
            {c0:c0,li0:li0,col0:col0,extra:{list:list}});
      }
      break ;
    }

    if (this.lttype === ',' ) {
      c0 = this.c0, li0 = this.li0, col0 = this.col0;
      this.next();
    }
    else { tail = false; break; }
  }
  if (argLen === ARGLEN_ANY) {
    if (tail && this.lttype === '...') {
      this.scope.enterUniqueArgs();
      elem = this.parseRestElement();
      list.push(elem);
      if (!gotNonSimple) {
        gotNonSimple = true;
        this.scope.firstNonSimple = elem;
      }
    }
  }
  else if (list.length !== argLen)
    this.err('func.args.not.enough');

  if (!this.expectType_soft (')'))
    this.err('func.args.no.end.paren');

  if (this.scope.insideUniqueArgs())
    this.scope.exitUniqueArgs();

  return list;
};



},
function(){
this . notId = function(id) { throw new Error ( 'not a valid id '   +   id )   ;  } ;
this. parseIdStatementOrId = function ( context ) {
  var id = this.ltval ;
  var pendingExprHead = null;

  SWITCH:
  switch (id.length) {
  case 1:
    pendingExprHead = this.id(); break SWITCH ;

  case 2:
    switch (id) {
    case 'do':
      this.resvchk(); this.kw();
      return this.parseDoWhileStatement();
    case 'if':
      this.resvchk(); this.kw();
      return this.parseIfStatement();
    case 'in':
      this.resvchk(); this.kw();
      // TODO: is it actually needed anymore?
      if ( context & CTX_FOR )
        return null;
 
       this.notId() ;
    default: pendingExprHead = this.id(); break SWITCH ;
    }

  case 3:
    switch (id) {
    case 'new':
      this.resvchk(); this.kw();
      if ( this.canBeStatement ) {
        this.canBeStatement = false ;
        this.pendingExprHead = this.parseNewHead();
        return null;
      }
      return this.parseNewHead();

    case 'for':
      this.resvchk(); this.kw();
      return this.parseFor();
    case 'try':
      this.resvchk(); this.kw();
      return this.parseTryStatement();
    case 'let':
      if ( this.canBeStatement && this.v > 5 )
        return this.parseLet(CTX_NONE);

      if (this.scope.insideStrict()) this.err('strict.let.is.id');

      pendingExprHead = this.id();
      break SWITCH;

    case 'var':
      this.resvchk();
      return this.parseVariableDeclaration( context & CTX_FOR );
    case 'int':
      if (this.v <= 5) {
        this.errorReservedID();
      }

    default: pendingExprHead = this.id(); break SWITCH  ;
    }

  case 4:
    switch (id) {
    case 'null':
      this.resvchk(); if (this.onToken_ !== null) this.lttype = 'Null';
      pendingExprHead = this.parseNull();
      break SWITCH;
    case 'void':
      this.resvchk(); this.kw();
      if ( this.canBeStatement )
         this.canBeStatement = false;
      this.lttype = 'u'; 
      this.isVDT = VDT_VOID;
      return null;
    case 'this':
      this.resvchk(); this.kw();
      pendingExprHead = this. parseThis();
      break SWITCH;
    case 'true':
      this.resvchk(); if (this.onToken_ !== null) this.lttype = 'Boolean';
      pendingExprHead = this.parseTrue();
      break SWITCH;
    case 'case':
      this.resvchk();
      if ( this.canBeStatement ) {
        this.foundStatement = true;
        this.canBeStatement = false ;
        return null;
      }

    case 'else':
      this.resvchk(); this.kw();
      this.notId();
    case 'with':
      this.resvchk(); this.kw();
      return this.parseWithStatement();
    case 'enum': case 'byte': case 'char':
    case 'goto': case 'long':
      if (this. v <= 5 ) this.errorReservedID();

    default: pendingExprHead = this.id(); break SWITCH  ;
  }

  case 5:
    switch (id) {
    case 'super':
      this.resvchk(); this.kw();
      pendingExprHead = this.parseSuper();
      break SWITCH;
    case 'break':
      this.resvchk(); this.kw();
      return this.parseBreakStatement();
    case 'catch':
      this.resvchk(); this.kw();
      this.notId();
    case 'class':
      this.resvchk(); this.kw();
      return this.parseClass(CTX_NONE ) ;
    case 'const':
      this.resvchk();
      if (this.v<5) this.err('const.not.in.v5') ;
      return this.parseVariableDeclaration(CTX_NONE);

    case 'throw':
      this.resvchk(); this.kw();
      return this.parseThrowStatement();
    case 'while':
      this.resvchk(); this.kw();
      return this.parseWhileStatement();
    case 'yield': 
      if (this.scope.canYield()) {
        this.resvchk();
        if (this.scope.isAnyFnHead())
          this.err('yield.args');

        if ( this.canBeStatement )
          this.canBeStatement = false;

        this.lttype = 'yield';
        return null;
      }
      else if (this.scope.insideStrict()) this.errorReservedID(null);

      pendingExprHead = this.id();
      break SWITCH;
          
    case 'false':
      this.resvchk(); if (this.onToken_ !== null) this.lttype = 'Boolean';
      pendingExprHead = this.parseFalse();
      break SWITCH;

    case 'await':
      if (this.scope.canAwait()) {
        this.resvchk();
        if (this.scope.isAnyFnHead())
          this.err('await.args');
        if (this.canBeStatement)
          this.canBeStatement = false;
        this.isVDT = VDT_AWAIT;
        this.lttype = 'u';
        return null;
      }
      if (!this.isScript) {
        this.resvchk(); this.kw();
        this.err('await.in.strict');
      }

      pendingExprHead = this.suspys = this.id(); // async(e=await)=>l ;
      break SWITCH;

    case 'async':
      pendingExprHead = this.parseAsync(context);
      break SWITCH;

    case 'final':
    case 'float':
    case 'short':
      if ( this. v <= 5 ) this.errorReservedID() ;
    default: pendingExprHead = this.id(); break SWITCH ;
    }

  case 6: switch (id) {
    case 'static':
      if (this.scope.insideStrict() || this.v <= 5)
        this.errorReservedID();

    case 'delete':
    case 'typeof':
      this.resvchk(); this.kw();
      if ( this.canBeStatement )
        this.canBeStatement = false ;
      this.lttype = 'u'; 
      this.isVDT = id === 'delete' ? VDT_DELETE : VDT_VOID;
      return null;

    case 'export': 
      this.resvchk(); this.kw();
      if ( this.isScript && this.err('export.not.in.module') )
        return this.errorHandlerOutput;

      return this.parseExport() ;

    case 'import':
      this.resvchk(); this.kw();
      if ( this.isScript && this.err('import.not.in.module') )
        return this.errorHandlerOutput;

      return this.parseImport();

    case 'return':
      this.resvchk(); this.kw();
      return this.parseReturnStatement();
    case 'switch':
      this.resvchk(); this.kw();
      return this.parseSwitchStatement();
    case 'public':
      if (this.scope.insideStrict()) this.errorReservedID();
    case 'double': case 'native': case 'throws':
      if ( this. v <= 5 ) this.errorReservedID();

    default: pendingExprHead = this.id(); break SWITCH ;
    }

  case 7:
    switch (id) {
    case 'default':
      this.resvchk();
      if ( this.canBeStatement ) this.canBeStatement = false ;
      return null;

    case 'extends': case 'finally':
      this.resvchk(); this.kw();
      this.notId();

    case 'package': case 'private':
      if (this.scope.insideStrict())
        this.errorReservedID();

    case 'boolean':
      if (this.v <= 5)
        this.errorReservedID();

    default: pendingExprHead = this.id(); break SWITCH  ;
    }

  case 8:
    switch (id) {
    case 'function':
      this.resvchk(); this.kw();
      return this.parseFunc(context&CTX_FOR, 0 );
    case 'debugger':
      this.resvchk(); this.kw();
      return this.prseDbg();
    case 'continue':
      this.resvchk(); this.kw();
      return this.parseContinueStatement();
    case 'abstract': case 'volatile':
      if ( this. v <= 5 ) this.errorReservedID();

    default: pendingExprHead = this.id(); break SWITCH  ;
    }

  case 9:
    switch (id ) {
    case 'interface': case 'protected':
      if (this.scope.insideStrict()) this.errorReservedID() ;

    case 'transient':
      if (this.v <= 5) this.errorReservedID();

    default: pendingExprHead = this.id(); break SWITCH  ;
    }

  case 10:
    switch ( id ) {
    case 'instanceof':
       this.resvchk(); this.kw();
       this.notId();
    case 'implements':
      if ( this.v <= 5 || this.scope.insideStrict() )
        this.errorReservedID(id);

    default: pendingExprHead = this.id(); break SWITCH ;
    }

  case 12:
     if ( this.v <= 5 && id === 'synchronized' ) this.errorReservedID();

  default: pendingExprHead = this.id();

  }

  if ( this.canBeStatement ) {
    this.canBeStatement = false;
    this.pendingExprHead = pendingExprHead;
    return null;
  }

  return pendingExprHead;
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
this.id = function() {
  var id = {
    type: 'Identifier', name: this.ltval,
    start: this.c0, end: this.c,
    loc: { start: this.locBegin(), end: this.loc() }, raw: this.ltraw
  };
  this.next() ;
  return id;
};



},
function(){
this.readAnIdentifierToken = function (v) {
  var c = this.c, src = this.src, len = src.length, peek, start = c;
  c++; // start reading the body

  var byte2, startSlice = c; // the head is already supplied in v

  while ( c < len ) {
    peek = src.charCodeAt(c); 
    if ( isIDBody(peek) ) {
      c++;
      continue;
    }

    if ( peek === CH_BACK_SLASH ) {
      if (this.esct === ERR_NONE_YET) {
        this.esct = ERR_PIN_UNICODE_IN_RESV;
        this.eloc.c0 = c;
        this.eloc.li0 = this.li;
        this.eloc.col0 = this.col + (c-start);
      }
      if ( !v ) // if all previous characters have been non-u characters 
        v = src.charAt (startSlice-1); // v = IDHead

      if ( startSlice < c ) // if there are any non-u characters behind the current '\'
        v += src.slice(startSlice,c) ; // v = v + those characters

      this.c = ++c;
      (CH_u !== src.charCodeAt(c) && this.err('id.u.not.after.slash'));

      peek = this. peekUSeq() ;
      if (peek >= 0x0D800 && peek <= 0x0DBFF ) {
        this.c++;
        byte2 = this.peekTheSecondByte();
        if (!isIDBody(((peek-0x0D800)<<10) + (byte2-0x0DC00) + 0x010000) &&
             this.err('id.multi.must.be.idbody',{extra:[peek,byte2]}) )
          return this.errorHandlerOutput ;

        v += String.fromCharCode(peek, byte2);
      }
      else {
         if ( !isIDBody(peek) &&
               this.err('id.esc.must.be.idbody',{extra:peek}) )
           return this.errorHandlerOutput;
     
         v += fromcode(peek);
      }
      c = this.c;
      c++;
      startSlice = c;
    }
    else if (peek >= 0x0D800 && peek <= 0x0DBFF ) {
       if ( !v ) { v = src.charAt(startSlice-1); }
       if ( startSlice < c ) v += src.slice(startSlice,c) ;
       c++;
       this.c = c; 
       byte2 = this.peekTheSecondByte() ;
       if (!isIDBody(((peek-0x0D800 ) << 10) + (byte2-0x0DC00) + 0x010000) &&
            this.err('id.multi.must.be.idbody') )
         return this.errorHandlerOutput ;

       v += String.fromCharCode(peek, byte2);
       c = this.c ;
       c++;
       startSlice = c;
    }
    else { break ; } 
   }
   if ( v ) { // if we have come across at least one u character
      if ( startSlice < c ) // but all others that came after the last u-character have not been u-characters
        v += src.slice(startSlice,c); // then append all those characters

      this.ltraw = src.slice(this.c0,c);
      this.ltval = v  ;
   }
   else {
      this.ltval = this.ltraw = v = src.slice(startSlice-1,c);
   }
   this.c = c;
   this.lttype= 'Identifier';
};



},
function(){
this.parseIfStatement = function () {
  if ( !this.ensureStmt_soft () && this.err('not.stmt') )
    return this.errorHandlerOutput;

  this.fixupLabels(false);
  this.enterScope(this.scope.bodyScope());
  this.scope.mode |= SM_INSIDE_IF;

  var startc = this.c0,
      startLoc  = this.locBegin();
  this.next () ;
  !this.expectType_soft('(') &&
  this.err('if.has.no.opening.paren');

  var cond = core(this.parseExpr(CTX_NONE|CTX_TOP));

  !this.expectType_soft (')') &&
  this.err('if.has.no.closing.paren');

  var nbody = this. parseStatement (false);
  var scope = this.exitScope(); 

  var alt = null;
  if ( this.lttype === 'Identifier' && this.ltval === 'else') {
     this.kw(), this.next() ;
     this.enterScope(this.scope.bodyScope());
     alt = this.parseStatement(false);
     this.exitScope();
  }

  this.foundStatement = true;
  return { type: 'IfStatement', test: cond, start: startc, end: (alt||nbody).end,
     loc: { start: startLoc, end: (alt||nbody).loc.end }, consequent: nbody, alternate: alt/*,scope:  scope  ,y:-1*/};
};

},
function(){
// TODO: needs a thorough simplification
this.parseImport = function() {
  if (this.v <= 5)
    this.err('ver.exim');

  if (!this.canBeStatement)
    this.err('not.stmt');

  this.canBeStatement = false;

  var startc = this.c0,
      startLoc = this.locBegin(),
      hasList = false;

  this.next();

  var hasMore = true, list = [], local = null;
  if ( this.lttype === 'Identifier' ) {
    local = this.validateID("");
    list.push({
      type: 'ImportDefaultSpecifier',
      start: local.start,
      loc: local.loc,
      end: local.end,
      local: local
    });
    if (this.lttype === ',')
      this.next();
    else
      hasMore = false;
  }

  var spStartc = 0, spStartLoc = null;
  
  if (hasMore) switch (this.lttype) {   
  case 'op':
    if (this.ltraw !== '*')
      this.err('import.namespace.specifier.not.*');
    else {
      spStartc = this.c - 1;
      spStartLoc = this.locOn(1);
  
      this.next();
      if (!this.expectID_soft('as'))
        this.err('import.namespace.specifier.no.as');
      if (this.lttype !== 'Identifier')
        this.err('import.namespace.specifier.local.not.id');
 
      local = this.validateID("");
      list.push({
        type: 'ImportNamespaceSpecifier',
        start: spStartc,
        loc: { start: spStartLoc, end: local.loc.end },
        end: local.end,
        local: local
      });
    }
    break;
  
  case '{':
    hasList = true;
    this.next();
    while ( this.lttype === 'Identifier' ) {
      local = this.id();
      var im = local; 
      if ( this.lttype === 'Identifier' ) {
        if ( this.ltval !== 'as' && 
             this.err('import.specifier.no.as') )
          return this.errorHandlerOutput ;
 
        this.next();
        if ( this.lttype !== 'Identifier' &&
             this.err('import.specifier.local.not.id') )
          return this.errorHandlerOutput ;
 
        local = this.validateID("");
      }
      else this.validateID(local.name);
 
      list.push({
        type: 'ImportSpecifier',
        start: im.start,
        loc: { start: im.loc.start, end: local.loc.end },
        end: local.end, imported: im,
        local: local
      });
 
      if ( this.lttype === ',' )
         this.next();
      else
         break ;                                  
    }
 
    if (!this.expectType_soft('}')) 
      this.err('import.specifier.list.unfinished');
 
    break ;

  default:
    if (list.length) {
      ASSERT.call(this, list.length === 1,
        'how come has more than a single specifier been parsed before the comma was reached?!');
      this.err('import.invalid.specifier.after.comma');
    }
  }

   if (list.length || hasList) {
     if (!this.expectID_soft('from'))
       this.err('import.from');
   }

   // TODO: even though it's working the way it should, errors might be misleading for cases like:
   // `import , from "a"`
   if (!(this.lttype === 'Literal' &&
        typeof this.ltval === STRING_TYPE))
     this.err('import.source.is.not.str');

   var src = this.numstr();
   var endI = this.semiI() || src.end, 
       semiLoc = this.semiLoc_soft();

   if (!semiLoc && !this.nl)
     this.err('no.semi');
   
   this.foundStatement = true;

   return {
     type: 'ImportDeclaration',
     start: startc,
     loc: {
       start: startLoc,
       end: semiLoc || src.loc.end
     },
     end:  endI , specifiers: list,
     source: src
   };
}; 

},
function(){
this .parseLabeledStatement = function(label, allowNull) {
   this.next();
   var l = label.name;
   l += '%';
   var ex = this.findLabel(l); // existing label
   if ( ex && this.err('label.is.a.dup',{tn:label,extra:ex}) )
     return this.errorHandlerOutput ;

   this.labels[l] =
        this.unsatisfiedLabel ?
        this.unsatisfiedLabel :
        this.unsatisfiedLabel = { loop: false };

   var stmt  = this.parseStatement(allowNull);
   this.labels[l] = null;

   return { type: 'LabeledStatement', label: label, start: label.start, end: stmt.end,
            loc: { start: label.loc.start, end: stmt.loc.end }, body: stmt };
};

},
function(){

this.parseLet = function(context) {

// this function is only calld when we have a 'let' at the start of a statement,
// or else when we have a 'let' at the start of a for's init; so, CTX_FOR means "at the start of a for's init ",
// not 'in for'

  var startc = this.c0, startLoc = this.locBegin();
  var c = this.c, li = this.li, col = this.col, raw = this.ltraw;

  var letDecl = this.parseVariableDeclaration(context);

  if ( letDecl )
    return letDecl;

  if (this.scope.insideStrict())
    this.err('strict.let.is.id',{c0:startc,loc:startLoc});

  this.canBeStatement = false;
  this.pendingExprHead = {
     type: 'Identifier',
     name: 'let',
     start: startc,
     end: c,
     loc: { start: startLoc, end: { line: li, column: col }, raw: raw }
  };

  if (this.onToken_ !== null)
    this.onToken({type: 'Identifier', value: raw, start: startc, end: c, loc:this.pendingExprHead.loc });

  return null ;
};

this.hasDeclarator = function() {

  switch (this.lttype) {
  case '[':
  case '{':
  case 'Identifier':
    return true;
  
  default:
    return false;

  }
};

},
function(){
this.numstr = function () {
  var n = {
    type: 'Literal', value: this.ltval,
    start: this.c0, end: this.c,
    loc: { start: this.locBegin(), end: this.loc() },
    raw: this.ltraw
  };
  this.next();
  return n;
};

this.parseTrue = function() {
  var n = {
    type: 'Literal', value: true,
    start: this.c0, end: this.c,
    loc: { start: this.locBegin(), end: this.loc() }, raw: this.ltraw
  };
  this.next();
  return n;
};

this.parseNull = function() {
  var n = {
    type: 'Literal', value: null,
    start: this.c0, end: this.c,
    loc: { start: this.locBegin(), end: this.loc() }, raw: this.ltraw
  };
  this.next();
  return n;
};

this.parseFalse = function() {
  var n = {
    type: 'Literal', value: false,
    start: this.c0, end: this.c,
    loc: { start: this.locBegin(), end: this.loc() }, raw: this.ltraw
  };
  this.next();
  return n;
};



},
function(){
// TODO: the values for li, col, and c can be calculated
// by adding the value of raw.length to li0, col0, and c0, respectively,
// but this holds only in a limited use case where the
// value of the `raw` param is known to be either 'static', 'get', or 'set';
// but if this is going to be called for any value of raw containing surrogates, it may not work correctly.
function assembleID(c0, li0, col0, raw, val) {
  return { 
    type: 'Identifier', raw: raw,
    name: val, end: c0 + raw.length,
    start: c0, 
    loc: {
      start: { line: li0, column: col0 },
      end: { line: li0, column: col0 + raw.length }
    }
  }
}

this.parseMem = function(context, st) {
  var c0 = 0, li0 = 0, col0 = 0, nmod = 0,
      nli0 = 0, nc0 = 0, ncol0 = 0, nraw = "", nval = "", latestFlag = 0;

  var asyncNewLine = false;
  if (this.v > 5 && this.lttype === 'Identifier') {
    LOOP:  
    // TODO: check version number when parsing get/set
    do {
      if (nmod === 0) {
        c0 = this.c0; li0 = this.li; col0 = this.col0;
      }
      switch (this.ltval) {
      case 'static':
        if (!(st & ST_CLSMEM)) break LOOP;
        if (st & ST_STATICMEM) break LOOP;
        if (st & ST_ASYNC) break LOOP;

        nc0 = this.c0; nli0 = this.li0;
        ncol0 = this.col0; nraw = this.ltraw;
        nval = this.ltval;

        st |= latestFlag = ST_STATICMEM;
        nmod++;

        this.next();

        break;

      case 'get':
      case 'set':
        if (st & ST_ACCESSOR) break LOOP;
        if (st & ST_ASYNC) break LOOP;

        nc0 = this.c0; nli0 = this.li0;
        ncol0 = this.col0; nraw = this.ltraw;
        nval = this.ltval;
        
        st |= latestFlag = this.ltval === 'get' ? ST_GETTER : ST_SETTER;
        nmod++;
        this.next();
        break;

      case 'async':
        if (st & ST_ACCESSOR) break LOOP;
        if (st & ST_ASYNC) break LOOP;

        nc0 = this.c0; nli0 = this.li0;
        ncol0 = this.col0; nraw = this.ltraw;
        nval = this.ltval;

        st |= latestFlag = ST_ASYNC;
        nmod++;
        this.next();
        if (this.nl) {
          asyncNewLine = true;
          break;
        }

        break;

      default:
        break LOOP;

      }
    } while (this.lttype === 'Identifier');
  }
  
  if (this.lttype === 'op' && this.ltraw === '*') {
    if (this.v <= 5)
      this.err('ver.mem.gen');
    if (st & ST_ASYNC)
      this.err('async.gen.not.yet.supported');

    if (!c0) { c0 = this.c-1; li0 = this.li; col0 = this.col-1; }

    st |= latestFlag = ST_GEN;
    nmod++;
    this.next();
  }

  var nmem = null;
  switch (this.lttype) {
  case 'Identifier':
    if (asyncNewLine)
      this.err('async.newline');

    if ((st & ST_CLSMEM)) {
      if (this.ltval === 'constructor') st |= ST_CTOR;
      if (this.ltval === 'prototype') context |= CTX_HASPROTOTYPE;
    }
    else if (this.ltval === '__proto__')
      context |= CTX_HASPROTO;

    nmem = this.memberID();
    break;
  case 'Literal':
    if (asyncNewLine)
      this.err('async.newline');

    if (st & ST_CLSMEM) {
      if (this.ltval === 'constructor') st |= ST_CTOR;
      if (this.ltval === 'prototype') context |= CTX_HASPROTOTYPE;
    }
    else if (this.v > 5 && this.ltval === '__proto__')
      context |= CTX_HASPROTO;

    nmem = this.numstr();
    break;
  case '[':
    if (asyncNewLine)
      this.err('async.newline');

    nmem = this.memberExpr();
    break;
  default:
    if (nmod && latestFlag !== ST_GEN) {
      nmem = assembleID(nc0, nli0, ncol0, nraw, nval);
      st &= ~latestFlag; // it's found out to be a name, not a modifier
      nmod--;
    }
  }

  if (nmem === null) {
    if (st & ST_GEN)
      this.err('mem.gen.has.no.name');
    return null;
  } 

  if (this.lttype === '(') {
    if (this.v <= 5) this.err('ver.mem.meth');
    var mem = this.parseMeth(nmem, context, st);
    if (c0 && c0 !== mem.start) {
      mem.start = c0;
      mem.loc.start = { line: li0, column: col0 };
    }
    return mem;
  }

  if (st & ST_CLSMEM)
    this.err('meth.paren');

  if (nmod)
    this.err('obj.meth.no.paren');

  // TODO: it is not strictly needed -- this.parseObjElem itself can verify if the name passed to it is
  // a in fact a non-computed value equal to '__proto__'; but with the approach below, things might get tad
  // faster

  return this.parseObjElem(nmem, context);
};
 
this.parseObjElem = function(name, context) {
  var hasProto = context & CTX_HASPROTO, firstProto = this.first__proto__;
  var val = null;
  context &= ~CTX_HASPROTO;

  switch (this.lttype) {
  case ':':
    if (hasProto && firstProto)
      this.err('obj.proto.has.dup',{tn:name});

    this.next();
    val = this.parseNonSeqExpr(PREC_WITH_NO_OP, context);

    if (context & CTX_PARPAT) {
      if (val.type === PAREN_NODE) {
        if ((context & CTX_PARAM) &&
           !(context & CTX_HAS_A_PARAM_ERR) &&
           this.pt === ERR_NONE_YET) {
          this.pt = ERR_PAREN_UNBINDABLE; this.pe = val;
        }
        if ((context & CTX_PAT) &&
           !(context & CTX_HAS_A_PARAM_ERR) &&
           this.at === ERR_NONE_YET &&
           !this.ensureSimpAssig_soft(val.expr)) {
          this.at = ERR_PAREN_UNBINDABLE; this.pe = val;
        }
      }
    }

    val = {
      type: 'Property', start: name.start,
      key: core(name), end: val.end,
      kind: 'init',
      loc: { start: name.loc.start, end: val.loc.end },
      computed: name.type === PAREN,
      method: false, shorthand: false, value: core(val) ,y:-1
    };

    if (hasProto)
      this.first__proto__ = val;

    return val;
 
  case 'op':
    if (this.v <= 5)
      this.err('mem.short.assig');
    if (name.type !== 'Identifier')
      this.err('obj.prop.assig.not.id',{tn:name});
    if (this.ltraw !== '=')
      this.err('obj.prop.assig.not.assigop');
    if (context & CTX_NO_SIMPLE_ERR)
      this.err('obj.prop.assig.not.allowed');

    val = this.parseAssignment(name, context);
    if (!(context & CTX_HAS_A_SIMPLE_ERR) &&
       this.st === ERR_NONE_YET) {
      this.st = ERR_SHORTHAND_UNASSIGNED; this.se = val;
    }
 
    break;

  default:
    if (this.v <= 5)
      this.err('mem.short');
    if (name.type !== 'Identifier')
      this.err('obj.prop.assig.not.id',{tn:name});
    this.validateID(name.name);
    val = name;
    break;
  }
  
  return {
    type: 'Property', key: name,
    start: val.start, end: val.end,
    loc: val.loc, kind: 'init',
    shorthand: true, method: false,
    value: val, computed: false ,y:-1
  };
};



},
function(){
this .memberID = function() { return this.v > 5 ? this.id() : this.validateID("") ; };
this .memberExpr = function() {
  if (this.v <= 5)
    this.err('ver.mem.comp');

  var startc = this.c - 1,
      startLoc = this.locOn(1);
  this.next() ;
  
  // none of the modifications memberExpr may make to this.pt, this.at, and this.st
  // overwrite some other unrecorded this.pt, this.at, or this.st -- an unrecorded value of <pt:at:st>
  // means a whole elem was just parsed, and <pt:at:st> is immediately recorded after that whole
  // potpat element is parsed, so if a memberExpr overwrites <pt:at:st>, that <pt:at:st> is not an
  // unrecorded one.
  
  // TODO: it is not necessary to reset <pt:at>
  this.pt = this.at = this.st = 0;
  var e = this.parseNonSeqExpr(PREC_WITH_NO_OP, CTX_NONE|CTX_PAT|CTX_NO_SIMPLE_ERR); // TODO: should be CTX_NULLABLE, or else the next line is in vain 
  if (!e && this.err('prop.dyna.no.expr') ) // 
    return this.errorHandlerOutput ;

  var n = { type: PAREN, expr: e, start: startc, end: this.c, loc: { start: startLoc, end: this.loc() } } ;
  if ( !this.expectType_soft (']') &&
        this.err('prop.dyna.is.unfinished') )
    return this.errorHandlerOutput ;
 
  return n;
};



},
function(){
// TODO: new_raw
this.parseMeta = function(startc,end,startLoc,endLoc,new_raw ) {
  if (this.ltval !== 'target')
    this.err('meta.new.has.unknown.prop');
  
  if (!this.scope.canHaveNewTarget())
    this.err('meta.new.not.in.function',{c0:startc,loc:startLoc});

  var prop = this.id();

  return {
    type: 'MetaProperty',
    meta: {
      type: 'Identifier', name : 'new',
      start: startc, end: end,
      loc: { start : startLoc, end: endLoc }, raw: new_raw  
    },
    start : startc,
    property: prop, end: prop.end,
    loc : { start: startLoc, end: prop.loc.end }
  };
};



},
function(){
this.parseMeth = function(name, context, st) {
  if (this.lttype !== '(')
    this.err('meth.paren');
  var val = null;

  if (!(st & (ST_GEN|ST_ASYNC|ST_CTOR|ST_GETTER|ST_SETTER)))
    st |= ST_METH;

  if (st & ST_CLSMEM) {
    // all modifiers come at the beginning
    if (st & ST_STATICMEM) {
      if (context & CTX_HASPROTOTYPE)
        this.err('class.prototype.is.static.mem',{tn:name,extra:flags});

      st &= ~ST_CTOR;
    }

    if (st & ST_CTOR) {
      if (st & ST_SPECIAL)
        this.err('class.constructor.is.special.mem',{tn:name, extra:{flags:flags}});
      if (context & CTX_CTOR_NOT_ALLOWED)
        this.err('class.constructor.is.a.dup',{tn:name});
    }

    val = this.parseFunc(CTX_NONE, st);

    return {
      type: 'MethodDefinition', key: core(name),
      start: name.start, end: val.end,
      kind: (st & ST_CTOR) ? 'constructor' : (st & ST_GETTER) ? 'get' :
            (st & ST_SETTER) ? 'set' : 'method',
      computed: name.type === PAREN,
      loc: { start: name.loc.start, end: val.loc.end },
      value: val, 'static': !!(st & ST_STATICMEM) ,y:-1
    }
  }
   
  val = this.parseFunc(CTX_NONE, st);

  return {
    type: 'Property', key: core(name),
    start: name.start, end: val.end,
    kind:
     !(st & ST_ACCESSOR) ? 'init' :
      (st & ST_SETTER) ? 'set' : 'get',
    computed: name.type === PAREN,
    loc: { start: name.loc.start, end : val.loc.end },
    method: (st & ST_ACCESSOR) === 0, shorthand: false,
    value : val ,y:-1
  }
};


},
function(){
this.parseNewHead = function () {
  var startc = this.c0, end = this.c,
      startLoc = this.locBegin(), li = this.li,
      col = this.col, raw = this.ltraw ;

  this.next();
  if (this.lttype === '.') {
    this.next();
    return this.parseMeta(startc, end, startLoc, {line:li,column:col}, raw);
  }

  var head, elem, inner;
  switch (this  .lttype) {
  case 'Identifier':
    head = this.parseIdStatementOrId (CTX_NONE);
    break;

  case '[':
    head = this. parseArrayExpression(CTX_NONE);
    break;

  case '(':
    head = this. parseParen();
    break;

  case '{':
    head = this. parseObjectExpression(CTX_NONE) ;
    break;

  case '/':
    head = this. parseRegExpLiteral () ;
    break;

  case '`':
    head = this. parseTemplateLiteral () ;
    break;

  case 'Literal':
    head = this.numstr ();
    break;

  default:
    this.err('new.head.is.not.valid');

  }

  if (head.type === 'Identifier')
    this.scope.reference(head.name);

  var inner = core( head ) ;
  while ( true ) {
    switch (this. lttype) {
    case '.':
      this.next();
      if (this.lttype !== 'Identifier')
        this.err('mem.name.not.id');

      elem = this.memberID();
      head = { type: 'MemberExpression', property: elem, start: head.start, end: elem.end,
        loc: { start: head.loc.start, end: elem.loc.end }, object: inner, computed: false ,y:-1 };
      inner = head;
      continue;

    case '[':
      this.next() ;
      elem = this.parseExpr(CTX_NONE) ;
      head = { type: 'MemberExpression', property: core(elem), start: head.start, end: this.c,
        loc: { start : head.loc.start, end: this.loc() }, object: inner, computed: true ,y:-1 };
      inner = head ;
      if ( !this.expectType_soft (']') ) {
        this.err('mem.unfinished')  ;
      }
 
      continue;

    case '(':
      elem = this. parseArgList();
      inner = { type: 'NewExpression', callee: inner, start: startc, end: this.c,
        loc: { start: startLoc, end: this.loc() }, arguments: elem  ,y:-1};
      if ( !this. expectType_soft (')') ) {
        this.err('new.args.is.unfinished') ;
      }

      return inner;

    case '`' :
      elem = this.parseTemplateLiteral () ;
      head = {
        type : 'TaggedTemplateExpression' ,
        quasi :elem ,
        start: head.start,
         end: elem.end,
        loc : { start: head.loc.start, end: elem.loc.end },
        tag : inner  ,y:-1
      };

      inner = head;
      continue ;

    default: return { type: 'NewExpression', callee: inner, start: startc, end: head.end,
      loc: { start: startLoc, end: head.loc.end }, arguments : []  ,y:-1};

    }
  }
};


},
function(){
this.parseNonSeqExpr = function (prec, context) {
  var head = this.parseExprHead(context);
  if ( head === null ) {
    switch ( this.lttype ) {
    case 'u':
    case '-':
      head = this.parseUnaryExpression(context);
      break;

    case '--':
       head = this.parseUpdateExpression(null, context);
       break;

    case 'yield':
      // make sure there is no other expression before it 
      if (prec !== PREC_WITH_NO_OP) 
        return this.err('yield.as.an.id');

      // everything that comes belongs to it 
      return this.parseYield(context); 
 
    default:
      if (!(context & CTX_NULLABLE) )
        return this.err('nexpr.null.head');
       
      return null;
    }
  }

  var op = this.parseO(context);
  var assig = op && isAssignment(this.prec);
  if (assig) {
    if (prec === PREC_WITH_NO_OP)
      head = this.parseAssignment(head, context);
    else
      this.err('assig.not.first');
  }

  if ((context & CTX_PAT) &&
     (context & CTX_NO_SIMPLE_ERR)) {
      this.currentExprIsSimple();
      this.dissolveParen();
  }
  
  if (!op || assig)
    return head;

  do {
    var currentPrec = this.prec;

    if (currentPrec === PREC_COND) {
      if (prec === PREC_WITH_NO_OP)
        head = this.parseCond(head, context);
      break;
    }

    if ( isMMorAA(currentPrec) ) {
      if (this.nl )
        break;
    
      head = this.parseUpdateExpression(head, context);
      continue;
    }
    
    if (prec === PREC_U && currentPrec === PREC_EX)
      this.err('unary.before.an.exponentiation');
    if (currentPrec < prec)
      break;
    if (currentPrec === prec && !isRassoc(prec))
      break;

    var o = this.ltraw;
    this.next();
    var right = this.parseNonSeqExpr(currentPrec, context & CTX_FOR);
    head = {
      type: !isBin(currentPrec) ? 'LogicalExpression' : 'BinaryExpression',
      operator: o,
      start: head.start,
      end: right.end,
      loc: {
        start: head.loc.start,
        end: right.loc.end
      },
      left: core(head),
      right: core(right) ,y:-1
    };

  } while (op = this.parseO(context));

  return head;
};

},
function(){
this.readNumberLiteral = function (peek) {
  var c = this.c, src = this.src, len = src.length;
  var b = 10 , val = 0;
  this.lttype  = 'Literal' ;

  if (this.nl && (this.directive & DIR_MAYBE)) {
    this.gotDirective(this.dv, this.directive);
    this.directive |= DIR_HANDLED_BY_NEWLINE;
  }

  if (peek === CH_0) { // if our num lit starts with a 0
    b = src.charCodeAt(++c);
    switch (b) { // check out what the next is
      case CH_X: case CH_x:
         c++;
         if (c >= len && this.err('num.with.no.digits',{extra:'hex'}) )
           return this.errorHandlerOutput;
         b = src.charCodeAt(c);
         if ( ! isHex(b) && this.err('num.with.first.not.valid',{extra:'hex'})  )
           return this.errorHandlerOutput ;
         c++;
         while ( c < len && isHex( b = src.charCodeAt(c) ) )
             c++ ;
         this.ltval = parseInt( this.ltraw = src.slice(this.c,c) ) ;
         this.c = c;
         break;

      case CH_B: case CH_b:
        if (this.v <= 5)
          this.err('ver.bin');
        ++c;
        if (c >= len && this.err('num.with.no.digits',{extra:'binary'}) )
          return this.errorHandlerOutput ;
        b = src.charCodeAt(c);
        if ( b !== CH_0 && b !== CH_1 && this.err('num.with.first.not.valid',{extra:'binary'}) )
          return this.errorHandlerOutput ;
        val = b - CH_0; 
        ++c;
        while ( c < len &&
              ( b = src.charCodeAt(c), b === CH_0 || b === CH_1 ) ) {
           val <<= 1;
           val |= b - CH_0; 
           c++ ;
        }
        this.ltval = val ;
        this.ltraw = src.slice(this.c,c);
        this.c = c;
        break;

      case CH_O: case CH_o:
        if (this.v <= 5)
          this.err('ver.oct');
        ++c;
        if (c >= len && this.err('num.with.no.digits',{extra:'octal'}) )
          return this.errorHandlerOutput ; 
        b = src.charCodeAt(c);
        if ( (b < CH_0 || b >= CH_8) && this.err('num.with.first.not.valid',{extra:'octal'})  )
          return this.errorHandlerOutput ;

        val = b - CH_0 ;
        ++c; 
        while ( c < len &&
              ( b = src.charCodeAt(c), b >= CH_0 && b < CH_8 ) ) {
           val <<= (1 + 2);
           val |= b - CH_0;
           c++ ;
        } 
        this.ltval = val ;
        this.ltraw = src.slice(this.c,c) ;
        this.c = c;
        break;

      default:
        if ( b >= CH_0 && b <= CH_9 ) {
          if ( this.scope.insideStrict() ) this.err('num.legacy.oct');
          var base = 8;
          do {
            if ( b >= CH_8 && base === 8 ) base = 10 ;
            c ++;
          } while ( c < len &&
                  ( b = src.charCodeAt(c), b >= CH_0 && b <= CH_9) );
          
          b = this.c;
          this.c = c; 
  
          if ( !this.frac(b) )
            this.ltval = parseInt (this.ltraw = src.slice(b, c), base);
          
        }
        else {
          b = this.c ;
          this.c = c ;
          if ( !this.frac(b) ) {
             this.ltval = 0;
             this.ltraw = '0';
          }
        }
    }
  }

  else  {
    b = this.c;
    c ++ ;
    while (c < len && num(src.charCodeAt(c))) c++ ;
    this.c = c;
    if ( !this.frac(b) ) {
      this.ltval = parseInt(this.ltraw = src.slice(b, this.c)  ) ;
      this.c = c;
    }
  }
  // needless as it will be an error nevertheless, but it is still requir'd
  if ( ( this.c < len && isIDHead(src.charCodeAt(this.c))) ) this.err('num.idhead.tail') ; 
};

this . frac = function(n) {
  var c = this.c,
      l = this.src,
      e = l.length ;
  if ( n === -1 || l.charCodeAt(c)=== CH_SINGLEDOT )
     while( ++c < e && num(l.charCodeAt (c)))  ;

  switch( l.charCodeAt(c) ){
      case CH_E:
      case CH_e:
        c++;
        switch(l.charCodeAt(c)){
          case CH_MIN:
          case CH_ADD:
                 c++ ;
        }
        if ( !(c < e && num(l.charCodeAt(c))) )
          this.err('num.has.no.mantissa');

        do { c++;} while ( c < e && num(l.charCodeAt( c) ));
  }

  if ( c === this.c ) return false  ;
  this.ltraw = l.slice (n === -1 ? this.c - 1 : n, c);
  this.ltval =  parseFloat(this.ltraw )  ;
  this.c = c ;
  return true   ;
}



},
function(){
this.parseObjectExpression = function(context) {
  var startc = this.c0,
      startLoc = this.locBegin(),
      elem = null,
      list = [],
      first__proto__ = null,
      elemContext = CTX_NONE,
      pt = ERR_NONE_YET, pe = null, po = null,
      at = ERR_NONE_YET, ae = null, ao = null,
      st = ERR_NONE_YET, se = null, so = null,
      n = null;

  if (context & CTX_PAT) {
    elemContext |= context & CTX_PARPAT;
    elemContext |= context & CTX_PARPAT_ERR;
  }
  else 
    elemContext |= CTX_PAT|CTX_NO_SIMPLE_ERR;

  if (context & CTX_PARPAT) {
    if ((context & CTX_PARAM) &&
       !(context & CTX_HAS_A_PARAM_ERR)) {
      this.pt = ERR_NONE_YET; this.pe = this.po = null;
    }
    if ((context & CTX_PAT) &&
       !(context & CTX_HAS_AN_ASSIG_ERR)) {
      this.at = ERR_NONE_YET; this.ae = this.ao = null;
    }
    if (!(context & CTX_HAS_A_SIMPLE_ERR)) {
      this.st = ERR_NONE_YET; this.se = this.so = null;
    }
  }
  
  var pc0 = -1, pli0 = -1, pcol0 = -1;
  var ac0 = -1, ali0 = -1, acol0 = -1;
  var sc0 = -1, sli0 = -1, scol0 = -1;

  do {
    this.next();
    this.first__proto__ = first__proto__;
    elem = this.parseMem(elemContext, ST_OBJMEM);

    if (elem === null)
      break;

    if (!first__proto__ && this.first__proto__)
      first__proto__ = this.first__proto__;

    list.push(core(elem));
    if (!(elemContext & CTX_PARPAT))
      continue;

    if (elemContext & CTX_PARAM)
      this.scope.addPossibleArgument(elem);

    if ((elemContext & CTX_PARAM) &&
       !(elemContext & CTX_HAS_A_PARAM_ERR) &&
       this.pt !== ERR_NONE_YET) {
      if (pt === ERR_NONE_YET || agtb(this.pt, pt)) {
        pt = this.pt, pe = this.pe, po = elem;
        if (pt & ERR_PIN)
          pc0 = this.ploc.c0, pli0 = this.ploc.li0, pcol0 = this.ploc.col0;
        if (pt & ERR_P_SYN)
          elemContext |= CTX_HAS_A_PARAM_ERR;
      }
    }
    if ((elemContext & CTX_PAT) &&
       !(elemContext & CTX_HAS_AN_ASSIG_ERR) &&
       this.at !== ERR_NONE_YET) {
      if (at === ERR_NONE_YET || agtb(this.at, at)) {
        at = this.at; ae = this.ae; ao = elem;
        if (at & ERR_PIN)
          ac0 = this.aloc.c0, ali0 = this.aloc.li0, acol0 = this.aloc.col0;
        if (at & ERR_A_SYN)
          elemContext |= CTX_HAS_AN_ASSIG_ERR;
      }
    }
    // TODO: (elemContext & CTX_PARPAT) maybe?
    if (!(elemContext & CTX_HAS_A_SIMPLE_ERR) &&
       this.st !== ERR_NONE_YET) {
      if (st === ERR_NONE_YET || agtb(this.st, st)) {
        st = this.st; se = this.se; so = elem;
        if (st & ERR_PIN)
          sc0 = this.eloc.c0, sli0 = this.eloc.li0, scol0 = this.eloc.col0;
        if (st & ERR_S_SYN)
          elemContext |= CTX_HAS_A_SIMPLE_ERR;
      }
    }
  } while (this.lttype === ',');

  n = {
    properties: list,
    type: 'ObjectExpression',
    start: startc,
    end: this.c,
    loc: { start: startLoc, end: this.loc() } ,y:-1
  };

  // TODO: this is a slightly unnecessary work if the parent container already has an err;
  // (context & CTX_HAS_A(N)_<p:a:s>_ERR) should be also present in the conditions below
  if ((context & CTX_PARAM) && pt !== ERR_NONE_YET) {
    this.pt = pt; this.pe = pe; this.po = po;
    if (pt & ERR_PIN)
      this.ploc.c0 = pc0, this.ploc.li0 = pli0, this.ploc.col0 = pcol0;
  }
  if ((context & CTX_PAT) && at !== ERR_NONE_YET) {
    this.at = at; this.ae = ae; this.ao = ao;
    if (at & ERR_PIN)
      this.aloc.c0 = ac0, this.aloc.li0 = ali0, this.aloc.col0 = acol0;
  }
  if ((context & CTX_PARPAT) && st !== ERR_NONE_YET) {
    this.st = st; this.se = se; this.so = so;
    if (st & ERR_PIN)
      this.eloc.c0 = sc0, this.eloc.li0 = sli0, this.eloc.col0 = scol0;
  }

  if (!this.expectType_soft('}'))
    this.err('obj.unfinished');

  return n;
};


},
function(){
this.parseParen = function(context) {
  var startc = this.c0,
      startLoc = this.locBegin(),
      elem = null,
      elemContext = CTX_NULLABLE|CTX_PAT,
      list = null,
      prevys = this.suspys,
      hasRest = false,
      pc0 = -1, pli0 = -1, pcol0 = -1,
      sc0 = -1, sli0 = -1, scol0 = -1,
      st = ERR_NONE_YET, se = null, so = null,
      pt = ERR_NONE_YET, pe = null, po = null,
      insideParen = false,
      parenScope = null;

  if (context & CTX_PAT) {
    this.pt = this.st = ERR_NONE_YET;
    this.pe = this.po =
    this.se = this.so = null;
    this.suspys = null;
    elemContext |= CTX_PARAM;
    this.enterScope(this.scope.parenScope());
    insideParen = true;
  }
  else
    elemContext |= CTX_NO_SIMPLE_ERR;

  var lastElem = null, hasTailElem = false;
  this.next();
  while (true) {
    lastElem = elem;
    elem = this.parseNonSeqExpr(PREC_WITH_NO_OP, elemContext);
    if (elem === null) {
      if (this.lttype === '...') {
        if (!(elemContext & CTX_PARAM)) {
          this.st = ERR_UNEXPECTED_REST;
          this.se = this.so = null;
          this.currentExprIsSimple();
        }
        elem = this.parseSpreadElement(elemContext);
        hasRest = true;
      }
      else if (list) {
        if (this.v < 7)
          this.err('seq.non.tail.expr');
        else 
          hasTailElem = true;
      } 
      else break;
    }

    if (elemContext & CTX_PARAM) {
      if (elem) {
        this.scope.addPossibleArgument(elem);
        if (!this.scope.firstNonSimple && elem.type !== 'Identifier')
          this.scope.firstNonSimple = elem;
      }

      // TODO: could be `pt === ERR_NONE_YET`
      if (!(elemContext & CTX_HAS_A_PARAM_ERR)) {
        // hasTailElem -> elem === null
        if (this.pt === ERR_NONE_YET && !hasTailElem) {
          // TODO: function* l() { ({[yield]: (a)})=>12 }
          if (elem.type === PAREN_NODE) {
            this.pt = ERR_PAREN_UNBINDABLE;
            this.pe = elem;
          }
          else if(this.suspys) {
            this.pt = ERR_YIELD_OR_SUPER;
            this.pe = this.suspys;
          }
        }
        if (this.pt !== ERR_NONE_YET) {
          if (pt === ERR_NONE_YET || agtb(this.pt, pt)) {
            pt = this.pt, pe = this.pe, po = core(elem);
            if (pt & ERR_PIN)
              pc0 = this.ploc.c0, pli0 = this.ploc.li0, pcol0 = this.ploc.col0;
            if (pt & ERR_P_SYN)
              elemContext |= CTX_HAS_A_PARAM_ERR;
          }
        }
      }

      // TODO: could be `st === ERR_NONE_YET`
      if (!(elemContext & CTX_HAS_A_SIMPLE_ERR)) {
        if (this.st === ERR_NONE_YET) {
          if (hasRest) {
            this.st = ERR_UNEXPECTED_REST;
            this.se = elem;
          }
          else if (hasTailElem) {
            this.st = ERR_NON_TAIL_EXPR;
            this.se = lastElem;
          }
        }
        if (this.st !== ERR_NONE_YET) {
          if (st === ERR_NONE_YET || agtb(this.st, st)) {
            st = this.st, se = this.se, so = elem && core(elem);
            if (st & ERR_PIN)
              sc0 = this.eloc.c0, sli0 = this.eloc.li0, scol0 = this.eloc.col0;
            if (st & ERR_S_SYN)
              elemContext |= CTX_HAS_A_SIMPLE_ERR;
          }
        }
      }
    }

    if (hasTailElem)
      break;

    if (list) list.push(core(elem));
    if (this.lttype === ',') {
      if (hasRest)
        this.err('rest.arg.has.trailing.comma');
      if (list === null)
        list = [core(elem)];
      this.next();
    }
    else break;
  }

  var n = {
      type: PAREN_NODE,
      expr: list ? {
        type: 'SequenceExpression',
        expressions: list,
        start: list[0].start,
        end: list[list.length-1].end,
        loc: {
          start: list[0].loc.start,
          end: list[list.length-1].loc.end
        } 
      } : elem && core(elem),
      start: startc,
      end: this.c,
      loc: { start: startLoc, end: this.loc() }
  };

  if (!this.expectType_soft(')'))
    this.err('unfinished.paren',{tn:n});

  if (elem === null && list === null) {
    if (context & CTX_PARPAT) {
      st = ERR_EMPTY_LIST_MISSING_ARROW;
      se = so = n;
    }
    else {
      this.st = ERR_EMPTY_LIST_MISSING_ARROW;
      this.se = n;
      this.so = n;
      this.throwTricky('s', this.st);
    }
  }

  if (context & CTX_PAT) {
    if (pt !== ERR_NONE_YET) {
      this.pt = pt; this.pe = pe; this.po = po;
      if (pt & ERR_PIN)
        this.ploc.c0 = pc0, this.ploc.li0 = pli0, this.ploc.col0 = pcol0;
    }
    if (st !== ERR_NONE_YET) {
      this.st = st; this.se = se; this.so = so;
      if (st & ERR_PIN)
        this.eloc.c0 = sc0, this.eloc.li0 = sli0, this.eloc.col0 = scol0;
    }
    if (list === null && elem !== null &&
       elem.type === 'Identifier' && elem.name === 'async')
      this.parenAsync = n;
  }

  if (prevys !== null)
    this.suspys = prevys;

  if (insideParen)
    parenScope = this.exitScope();

  this.parenScope = parenScope;

  return n;
};

this.dissolveParen = function() {
  if (this.parenScope) {
    this.parenScope.dissolve();
    this.parenScope = null;
  }
};

},
function(){
this. parseArrayPattern = function() {
  if (this.v <= 5)
    this.err('ver.patarr');

  var startc = this.c - 1,
      startLoc = this.locOn(1),
      elem = null,
      list = [];

  if (this.scope.isAnyFnHead())
    this.scope.enterUniqueArgs();

  this.next();
  while ( true ) {
      elem = this.parsePattern();
      if ( elem ) {
         if ( this.lttype === 'op' && this.ltraw === '=' )
           elem = this.parseAssig(elem);
      }
      else {
         if ( this.lttype === '...' ) {
           list.push(this.parseRestElement());
           break ;
         }  
      }
    
      if ( this.lttype === ',' ) {
         list.push(elem);
         this.next();
      }       
      else  {
         if ( elem ) list.push(elem);
         break ;
      }
  } 

  elem = { type: 'ArrayPattern', loc: { start: startLoc, end: this.loc() },
           start: startc, end: this.c, elements : list ,y:-1};

  if ( !this. expectType_soft ( ']' ) &&
        this.err('pat.array.is.unfinished') )
    return this.errorHandlerOutput ;

  return elem;
};



},
function(){
this .parseAssig = function (head) {
  if (this.v <= 5)
    this.err('ver.assig');
  this.next() ;
  var e = this.parseNonSeqExpr( PREC_WITH_NO_OP, CTX_PAT|CTX_NO_SIMPLE_ERR );
  return { type: 'AssignmentPattern', start: head.start, left: head, end: e.end,
         right: core(e), loc: { start: head.loc.start, end: e.loc.end }  ,y:-1};
};



},
function(){
this.parseObjectPattern  = function() {
    if (this.v <= 5)
      this.err('ver.patobj');

    var sh = false;
    var startc = this.c-1;
    var startLoc = this.locOn(1);
    var list = [];
    var val = null;
    var name = null;

    if (this.scope.isAnyFnHead())
      this.scope.enterUniqueArgs();

    LOOP:
    do {
      sh = false;
      this.next ()   ;
      switch ( this.lttype ) {
         case 'Identifier':
            name = this.memberID();
            if ( this.lttype === ':' ) {
              this.next();
              val = this.parsePattern()
            }
            else {
              this.validateID(name.name);
              sh = true;
              val = name;
              this.declare(name);
            }
            break ;

         case '[':
            name = this.memberExpr();
            if (!this.expectType_soft(':'))
              this.err('obj.pattern.no.:');

            val = this.parsePattern();
            break ;

         case 'Literal':
            name = this.numstr();
            if (!this.expectType_soft(':'))
              this.err('obj.pattern.no.:');

            val = this.parsePattern();
            break ;

         default:
            break LOOP;
      }

      // TODO: this is a subtle case that was only lately noticed;
      // parsePattern must have a way to throw when the pattern is not supposed to be null 
      if (val === null)
        this.err('obj.prop.is.null');

      if ( this.lttype === 'op' && this.ltraw === '=' )
        val = this.parseAssig(val);

      list.push({ type: 'Property', start: name.start, key: core(name), end: val.end,
                  loc: { start: name.loc.start, end: val.loc.end },
                 kind: 'init', computed: name.type === PAREN, value: val,
               method: false, shorthand: sh ,y:-1 });

    } while ( this.lttype === ',' );

    var n = { type: 'ObjectPattern',
             loc: { start: startLoc, end: this.loc() },
             start: startc,
              end: this.c,
              properties: list ,y:-1 };

    if ( ! this.expectType_soft ('}') && this.err('pat.obj.is.unfinished') )
      return this.errorHandlerOutput ;

    return n;
};



},
function(){
// TODO: needs reconsideration,
this.parseRestElement = function() {
   if (this.v <= 5)
     this.err('ver.spread.rest');
   var startc = this.c0,
       startLoc = this.locBegin();

   this.next ();
   if ( this.v < 7 && this.lttype !== 'Identifier' ) {
      this.err('rest.binding.arg.peek.is.not.id');
   }

   var e = this.parsePattern();

   if (!e) {
      if (this.err('rest.has.no.arg'))
       return this.errorHandlerOutput ;
   }

   return { type: 'RestElement', loc: { start: startLoc, end: e.loc.end }, start: startc, end: e.end,argument: e };
};



},
function(){
this.parsePattern = function() {
  switch ( this.lttype ) {
    case 'Identifier' :
       var id = this.validateID("");
       this.declare(id);
       if (this.scope.insideStrict() && arguments_or_eval(id.name))
         this.err('bind.arguments.or.eval');

       return id;

    case '[':
       return this.parseArrayPattern();
    case '{':
       return this.parseObjectPattern();

    default:
       return null;
  }
};



},
function(){
this.parseProgram = function () {
  var startc = this.c, li = this.li, col = this.col;
  var endI = this.c , startLoc = null;
  var globalScope = null;

  globalScope = new GlobalScope();
 
  this.directive = !this.isScipt ? DIR_SCRIPT : DIR_MODULE; 
  this.clearAllStrictErrors();

  this.scope = new Scope(globalScope, ST_SCRIPT);
  this.scope.parser = this;
  if (!this.isScript)
    this.scope.enterStrict();

  this.next();

  var list = this.blck(); 

  this.scope.finish();
  globalScope.finish();

  var n = {
    type: 'Program',
    body: list,
    start: 0,
    end: this.src.length,
    sourceType: !this.isScript ? "module" : "script" ,
    loc: {
      start: {line: li, column: col},
      end: {line: this.li, column: this.col}
    }, scope: this.scope
  };

  if (this.onToken_ !== null) {
    if (typeof this.onToken_ !== FUNCTION_TYPE)
      n.tokens = this.onToken_;
  }

  if (this.onComment_ !== null) {
    if (typeof this.onComment_ !== FUNCTION_TYPE)
      n.comments = this.onComment_;
  }

  if ( !this.expectType_soft ('eof') &&
        this.err('program.unfinished') )
    return this.errorHandlerOutput ;

  return n;
};

},
function(){

var gRegexFlag =               1 ,
    uRegexFlag = gRegexFlag << 1 ,
    yRegexFlag = uRegexFlag << 1 ,
    mRegexFlag = yRegexFlag << 1 ,
    iRegexFlag = mRegexFlag << 1 ;

var regexFlagsSupported = 0;

try {
   new RegExp ( "lube", "g" ) ; regexFlagsSupported |= gRegexFlag ;
   new RegExp ( "lube", "u" ) ; regexFlagsSupported |= uRegexFlag ;
   new RegExp ( "lube", "y" ) ; regexFlagsSupported |= yRegexFlag ;
   new RegExp ( "lube", "m" ) ; regexFlagsSupported |= mRegexFlag ;
   new RegExp ( "lube", "i" ) ; regexFlagsSupported |= iRegexFlag ;
}
catch(r) {
}

function curlyReplace(matchedString, b, matchIndex, wholeString ) {
  var c = parseInt( '0x' + b );
  if ( c <= 0xFFFF ) return '\\u' + hex(c);
  return '\\uFFFF';
}

function regexReplace(matchedString, b, noB, matchIndex, wholeString) {
  var c = parseInt('0x' + ( b || noB ) ) ;
  if (c > 0x010FFFF )
    this.err('regex.val.not.in.range');
  
  if ( c <= 0xFFFF ) return String.fromCharCode(c) ;

  c -= 0x010000;
  return '\uFFFF';
} 

function verifyRegex(regex, flags) {
  var regexVal = null;

  try {
    return new RegExp(regex, flags);
  } catch ( e ) { throw e; }

}

function verifyRegex_soft (regex, flags) {
  var regexVal = null;

  try {
    return new RegExp(regex, flags);
  } catch ( e ) { return null; }

}

this.parseRegExpLiteral = function() {
  if (this.v < 2)
    this.err('ver.regex');
     var startc = this.c - 1, startLoc = this.locOn(1),
         c = this.c, src = this.src, len = src.length;

     var inSquareBrackets = false ;
     WHILE:
     while ( c < len ) {
       switch ( src.charCodeAt(c) ) {
         case CH_LSQBRACKET:
            if ( !inSquareBrackets )
               inSquareBrackets = true;

            break;

         case CH_BACK_SLASH:
            ++c;
            if (c < len) switch(src.charCodeAt(c)) {
               case CH_CARRIAGE_RETURN: 
                  if ( l.charCodeAt(c + 1) === CH_LINE_FEED ) c++;
               case CH_LINE_FEED :
               case 0x2028 :
               case 0x2029 :
                  if ( this.err('regex.newline.esc',{c0:c}) )
                    return this.errorHandlerOutput ;
            }

            break;

         case CH_RSQBRACKET:
            if ( inSquareBrackets )
               inSquareBrackets = false;

            break;

         case CH_DIV :
            if ( inSquareBrackets )
               break;

            break WHILE;

         case CH_CARRIAGE_RETURN: if ( l.charCodeAt(c + 1 ) === CH_LINE_FEED ) c++ ;
         case CH_LINE_FEED :
         case 0x2028 :
         case 0x2029 :
           if ( this.err('regex.newline',{c0:c}) )
             return this.errorHandlerOutput ;

//       default:if ( o >= 0x0D800 && o <= 0x0DBFF ) { this.col-- ; }
       }

       c++ ;
     }

     if ( src.charCodeAt(c) !== CH_DIV && 
          this.err('regex.unfinished') )
       return this.errorHandlerOutput ;

     var flags = 0;
     var flagCount = 0;
     WHILE:
     while ( flagCount <= 5 ) {
        switch ( src.charCodeAt ( ++c ) ) {
            case CH_g:
                if (flags & gRegexFlag)
                  this.err('regex.flag.is.dup',{c0:c});
                flags |= gRegexFlag; break;
            case CH_u:
                if (flags & uRegexFlag)
                  this.err('regex.flag.is.dup',{c0:c});
                flags |= uRegexFlag; break;
            case CH_y:
                if (flags & yRegexFlag)
                  this.err('regex.flag.is.dup',{c0:c});
                flags |= yRegexFlag; break;
            case CH_m:
                if (flags & mRegexFlag)
                  this.err('regex.flag.is.dup',{c0:c});
                flags |= mRegexFlag; break;
            case CH_i:
                if (flags & iRegexFlag)
                  this.err('regex.flag.is.dup',{c0:c});
                flags |= iRegexFlag; break;

            default : break WHILE;
        }

        flagCount++ ;
     }
     var patternString = src.slice(this.c, c-flagCount-1 ), flagsString = src .slice(c-flagCount,c);
     var val = null;

     var normalizedRegex = patternString;

     // those that contain a 'u' flag need special treatment when RegExp constructor they get sent to
     // doesn't support the 'u' flag: since they can have surrogate pair sequences (which are not allowed without the 'u' flag),
     // they must be checked for having such surrogate pairs, and should replace them with a character that is valid even
     // without being in the context of a 'u' 
     if ( (flags & uRegexFlag) && !(regexFlagsSupported & uRegexFlag) )
          normalizedRegex = normalizedRegex.replace( /\\u\{([A-F0-9a-f]+)\}/g, curlyReplace) // normalize curlies
             .replace( /\\u([A-F0-9a-f][A-F0-9a-f][A-F0-9a-f][A-F0-9a-f])/g, regexReplace ) // convert u
             .replace( /[\ud800-\udbff][\udc00-\udfff]/g, '\uFFFF' );
       

     // all of the 1 bits in flags must also be 1 in the same bit index in regexsupportedFlags;
     // flags ^ rsf returns a bit set in which the 1 bits mean "this flag is either not used in flags, or yt is not supported";
     // for knowing whether the 1 bit has also been 1 in flags, we '&' the above bit set with flags; the 1 bits in the
     // given bit set must both be 1 in flags and in flags ^ rsf; that is, they are both "used" and "unsupoorted or unused",
     // which would be equal to this: [used && (unsupported || !used)] === unsopprted
     if (flags & (regexFlagsSupported^flags) )
       val  = verifyRegex_soft (normalizedRegex, "");
     else
        val = verifyRegex( patternString, flagsString ) ;

     if ( !val &&
        this.err('regex.not.valid') )
       return this.errorHandlerOutput;

     this.col += (c-this.c);
     var regex = { type: 'Literal', regex: { pattern: patternString, flags: flagsString },
                   start: startc, end: c,
                   value: val, loc: { start: startLoc, end: this.loc() }, 
                   raw: this.src.substring(startc, c) };
     this.c = c;

     if (this.onToken_ !== null) {
       this.onToken({
         type: 'RegularExpression', value: this.src.substring(startc,c), start: startc,
         end: c, regex: regex.regex, loc: regex.loc });
       this.lttype = "";
     }

     this.next () ;

     return regex ;
};



},
function(){
this.parseReturnStatement = function () {
  if (! this.ensureStmt_soft () &&
       this.err('not.stmt') )
    return this.errorHandlerOutput ;

  this.fixupLabels(false ) ;

  if (!this.scope.canReturn()) {
    if (!this.misc.allowReturnOutsideFunction &&
      this.err('return.not.in.a.function'))
    return this.errorHandlerOutput;
  }

  var startc = this.c0,
      startLoc = this.locBegin(),
      retVal = null,
      li = this.li,
      c = this.c,
      col = this.col;

  this.next();

  var semi = 0, semiLoc = null;

  if ( !this.nl )
     retVal = this.parseExpr(CTX_NULLABLE|CTX_TOP);

  semi = this.semiI();
  semiLoc = this.semiLoc_soft();
  if ( !semiLoc && !this.nl &&
       this.err('no.semi') )
    return this.errorHandlerOutput;

  if ( retVal ) {
     this.foundStatement = true;
     return { type: 'ReturnStatement', argument: core(retVal), start: startc, end: semi || retVal.end,
        loc: { start: startLoc, end: semiLoc || retVal.loc.end } }
  }

  this.foundStatement = true;
  return {  type: 'ReturnStatement', argument: retVal, start: startc, end: semi || c,
     loc: { start: startLoc, end: semiLoc || { line: li, column : col } } };
};



},
function(){
this.parseSpreadElement = function(context) {
  if (this.v <= 5) this.err('ver.spread.rest');

  var startc = this.c0;
  var startLoc = this.locBegin();

  this.next();
  var e = this.parseNonSeqExpr(
    PREC_WITH_NO_OP,
    context & ~CTX_NULLABLE);

  if (e.type === PAREN_NODE) {
    if ((context & CTX_PARAM) && !(context & CTX_HAS_A_PARAM_ERR) &&
       this.pt === ERR_NONE_YET) { 
      this.pt = ERR_PAREN_UNBINDABLE; this.pe = e;
    }
    if ((context & CTX_PAT) && !(context & CTX_HAS_AN_ASSIG_ERR) &&
       this.at === ERR_NONE_YET && !this.ensureSimpAssig_soft(e.expr)) {
      this.at = ERR_PAREN_UNBINDABLE; this.ae = e;
    }
  }
    
  return {
    type: 'SpreadElement',
    loc: { start: startLoc, end: e.loc.end },
    start: startc,
    end: e.end,
    argument: core(e)
  };
};

},
function(){
this.parseStatement = function ( allowNull ) {
  var head = null,
      l,
      e ,
      directive = this.directive,
      esct = ERR_NONE_YET;

  if (directive !== DIR_NONE) {
    esct = this.esct; // does the current literal contain any octal escapes?
  }

  switch (this.lttype) {
    case '{': return this.parseBlockStatement();
    case ';': return this.parseEmptyStatement() ;
    case 'Identifier':
       this.canBeStatement = true;
       head = this.parseIdStatementOrId(CTX_NONE|CTX_PAT);
       if ( this.foundStatement ) {
          this.foundStatement = false ;
          return head;
       }

       break ;

    case 'eof':
      if (!allowNull && this.err('stmt.null') )
        return this.errorHandlerOutput ;

      return null;
  }

  if (head !== null)
    this.err('must.not.have.reached');

  head = this.parseExpr(CTX_NULLABLE|CTX_TOP) ;
  if ( !head ) {
    if ( !allowNull && this.err('stmt.null') )
      this.errorHandlerOutput;

    return null;
  }

  if ( head.type === 'Identifier' && this.lttype === ':')
    return this.parseLabeledStatement(head, allowNull);

  this.fixupLabels(false) ;

  if (DIR_MAYBE & directive) {
    if (head.type !== 'Literal')
      // TODO: technically it should instead get turned off: this.directive = DIR_NONE
      // Otherwise, if the next token to be recognized is a string literal, the octal sequence it may
      // contain is going to be unnecessarily recorded in to the error variables
      this.directive = directive|DIR_LAST;
    else {
      if (!(this.directive & DIR_HANDLED_BY_NEWLINE)) {
        ASSERT.call(this.directive === DIR_NONE,
          'an expression that is going to become a statement must have set a non-null directive to none if it has not handled it');
        this.gotDirective(this.dv, directive);
 
        // so that the escaped octals are recorded if the next token to be extracted is a string literal
        this.directive = directive; 
      }
    }
    if (esct !== ERR_NONE_YET && this.se === null)
      this.se = head;
  }

  e  = this.semiI() || head.end;
  l = this.semiLoc_soft ();
  if ( !l && !this.nl &&
       this.err('no.semi') )
    return this.errorHandlerOutput;
 
  return {
    type : 'ExpressionStatement',
    expression : core(head),
    start : head.start,
    end : e,
    loc : { start : head.loc.start, end : l || head.loc.end }
  };
};



},
function(){
this.readStrLiteral = function (start) {
  var c = this.c += 1,
      l = this.src,
      e = l.length,
      i = 0,
      v = "",
      v_start = c,
      startC =  c-1;

  if (this.nl && (this.directive & DIR_MAYBE)) {
    this.gotDirective(this.dv, this.directive);
    this.directive |= DIR_HANDLED_BY_NEWLINE;
  }

  while (c < e && (i = l.charCodeAt(c)) !== start) {
    switch ( i ) {
     case CH_BACK_SLASH :
        v  += l.slice(v_start,c );
        this.col += ( c - startC ) ;
        startC =  this.c = c;
        v  += this.readEsc()  ;
        c  = this.c;
        if ( this.col === 0 ) startC = c   +  1   ;
        else  { this.col += ( c - startC  )  ; startC = c ;   }
        v_start = ++c ;
        continue ;

     case CH_CARRIAGE_RETURN: if ( l.charCodeAt(c + 1 ) === CH_LINE_FEED ) c++ ;
     case CH_LINE_FEED :
     case 0x2028 :
     case 0x2029 :
           if ( this.err('str.newline',{c0:c,col0:this.col+(c-startC)}) )
             return this.errorHandlerOutput ;
    }
    c++;
  }

  if ( v_start !== c ) { v += l.slice(v_start,c ) ; }
  if (!(c < e && (l.charCodeAt(c)) === start) &&
       this.err('str.unfinished',{c0:c,col0:this.col+(c-startC)}) ) return this.errorHandlerOutput;

  this.c = c + 1 ;
  this.col += (this. c - startC   )  ;
  this.lttype = 'Literal'  ;
  this.ltraw =  l.slice (this.c0, this.c);
  this.ltval = v ;
};



},
function(){
this.parseSwitchCase = function () {
  var startc,
      startLoc;

  var nbody = null,
      cond  = null;

  if ( this.lttype === 'Identifier' ) switch ( this.ltval ) {
     case 'case':
       startc = this.c0;
       startLoc = this.locBegin();
       this.kw();
       this.next();
       cond = core(this.parseExpr(CTX_NONE|CTX_TOP)) ;
       break;

     case 'default':
       startc = this.c0;
       startLoc = this.locBegin();
       this.kw();
       this.next();
       break ;

     default: return null;
  }
  else
     return null;

  var c = this.c, li = this.li, col = this.col;
  if ( ! this.expectType_soft (':') &&
       this.err('switch.case.has.no.colon') )
    return this.errorHandlerOutput;

  nbody = this.blck();
  var last = nbody.length ? nbody[nbody.length-1] : null;
  return { type: 'SwitchCase', test: cond, start: startc, end: last ? last.end : c,
     loc: { start: startLoc, end: last ? last.loc.end : { line: li, column: col } }, consequent: nbody ,y:-1 };
};

},
function(){
this.parseSwitchStatement = function () {
  if (!this.ensureStmt_soft())
    this.err('not.stmt');

  this.fixupLabels(false) ;

  var startc = this.c0,
      startLoc = this.locBegin(),
      cases = [],
      hasDefault = false ,
      elem = null;

  this.next() ;
  if (!this.expectType_soft ('('))
    this.err('switch.has.no.opening.paren');

  var switchExpr = core(this.parseExpr(CTX_NONE|CTX_TOP));

  !this.expectType_soft (')') &&
  this.err('switch.has.no.closing.paren');

  !this.expectType_soft ('{') &&
  this.err('switch.has.no.opening.curly');

  this.enterScope(this.scope.blockScope()); 
  this.allow(SA_BREAK);

  while ( elem = this.parseSwitchCase()) {
    if (elem.test === null) {
       if (hasDefault ) this.err('switch.has.a.dup.default');
       hasDefault = true ;
    }
    cases.push(elem);
  }

  this.foundStatement = true;
  var scope = this.exitScope(); 

  var n = { type: 'SwitchStatement', cases: cases, start: startc, discriminant: switchExpr,
            end: this.c, loc: { start: startLoc, end: this.loc() }/*,scope:  scope  ,y:-1*/};
  if ( !this.expectType_soft ('}' ) &&
        this.err('switch.unfinished') )
    return this.errorHandlerOutput ;

  return n;
};



},
function(){
this . parseTemplateLiteral = function() {
  if (this.v <= 5)
    this.err('ver.temp');

  var li = this.li, col = this.col;
  var startc = this.c - 1, startLoc = this.locOn(1);
  var c = this.c, src = this.src, len = src.length;
  var templStr = [], templExpressions = [];
  
  // an element's content might get fragmented by an esc appearing in it,
  // e.g., 'eeeee\nee' has two fragments, 'eeeee' and 'ee'
  var startElemFragment = c; 

  var startElem = c,
      currentElemContents = "",
      startColIndex = c ,
      ch = 0, elem = null;
 
  while ( c < len ) {
    ch = src.charCodeAt(c);
    if ( ch === CH_BACKTICK ) break; 
    switch ( ch ) {
       case CH_$ :
          if ( src.charCodeAt(c+1) === CH_LCURLY ) {
              currentElemContents += src.slice(startElemFragment, c) ;
              this.col += ( c - startColIndex );
              elem =
                { type: 'TemplateElement', 
                 start: startElem, end: c, tail: false,
                 loc: { start: { line: li, column: col }, end: { line: this.li, column: this.col } },        
                 value: { raw : src.slice(startElem, c ).replace(/\r\n|\r/g,'\n'), 
                        cooked: currentElemContents   } };
              
              templStr.push(elem);

              if (this.onToken_ !== null) {
                var loc = elem.loc;
                this.onToken({
                  type:'Template', value: (templStr.length !== 1 ? '}' : '`') + elem.value.raw + '${',
                  start: elem.start - 1, end: elem.end + 2,
                  loc: {
                    start: { line: loc.start.line, column: loc.start.column - 1 },
                    end: { line: loc.end.line, column: loc.end.column + 2 }
                  }
                });
                this.lttype = "";
              }

              this.c = c + 2; // ${
              this.col += 2; // ${

              // this must be done manually because we must have                       
              // a lookahead before starting to parse an actual expression
              this.next(); 
                           
              templExpressions.push( core(this.parseExpr(CTX_NONE)) );
              if ( this. lttype !== '}')
                this.err('templ.expr.is.unfinished') ;

              currentElemContents = "";
              startElemFragment = startElem = c = this.c; // right after the '}'
              startColIndex = c;
              li = this.li;
              col = this.col;
          }

          else
             c++ ;

          continue;

       case CH_CARRIAGE_RETURN: 
           currentElemContents += src.slice(startElemFragment,c) + '\n' ;
           c++;
           if ( src.charCodeAt(c) === CH_LINE_FEED ) c++;
           startElemFragment = startColIndex = c;
           this.li++;
           this.col = 0;
           continue ;
 
       case CH_LINE_FEED:
           currentElemContents += src.slice(startElemFragment,c) + '\n';
           c++;
           startElemFragment = startColIndex = c;
           this.li++;
           this.col = 0;
           continue; 
 
       case 0x2028: case 0x2029:
           currentElemContents += src.slice(startElemFragment,c) + src.charAt(c);
           startColIndex = c;
           c++; 
           startElemFragment = c;
           this.li++;
           this.col = 0;           
           continue ;
 
       case CH_BACK_SLASH :
           this.c = c; 
           currentElemContents += src.slice( startElemFragment, c ) + this.readStrictEsc();
           c  = this.c;
           c++;
           if ( this.col === 0 ) // if we had an escaped newline 
             startColIndex = c;
           
           startElemFragment = c ;
           continue ;
    }

    c++ ;
  }
  
  if ( startElem < c ) {
     this.col += ( c - startColIndex );
     if ( startElemFragment < c )
       currentElemContents += src.slice( startElemFragment, c );
  }
  else currentElemContents = "";

  elem ={
     type: 'TemplateElement',
     start: startElem,
     loc: { start : { line: li, column: col }, end: { line: this.li, column: this.col } },
     end: startElem < c ? c : startElem ,
     tail: true,
     value: { raw: src.slice(startElem,c).replace(/\r\n|\r/g,'\n'), 
              cooked: currentElemContents }
  };

  templStr.push(elem);

  if (this.onToken_ !== null) {
    this.onToken({
      type:'Template', value: (templStr.length !== 1 ? '}' : '`')+elem.value.raw+'`',
      start: elem.start-1, end: elem.end+1,
      loc: {
        start: { line: elem.loc.start.line, column: elem.loc.start.column-1 },
        end: { line: elem.loc.end.line, column: elem.loc.end.column+1 }
      }    
    });
    this.lttype = "";
  }

  c++; // backtick  
  this.col ++ ;

  var n = { type: 'TemplateLiteral', start: startc, quasis: templStr, end: c,
       expressions: templExpressions , loc: { start: startLoc, end : this.loc() }  ,y:-1};

  if ( ch !== CH_BACKTICK ) this.err('templ.lit.is.unfinished',{extra:n}) ;

  this.c = c;
  this.next(); // prepare the next token  

  return n
};


},
function(){
this.parseThis = function() {
  var n = {
    type : 'ThisExpression',
    loc: { start: this.locBegin(), end: this.loc() },
    start: this.c0,
    end : this.c
  };
  this.next() ;

  if (this.scope.scs.isArrowComp())
    this.scope.reference_m(RS_LTHIS);

  return n;
};



},
function(){
this.parseThrowStatement = function () {
  if ( ! this.ensureStmt_soft () &&
         this.err('not.stmt') )
    return this.errorHandlerOutput ;

  this.fixupLabels(false ) ;

  var startc = this.c0,
      startLoc = this.locBegin(),
      retVal = null,
      li = this.li,
      c = this.c,
      col = this.col;

  this.next();

  var semi = 0 , semiLoc = null ;
  if ( this.nl &&
       this.err('throw.has.newline') )
    return this.errorHandlerOutput;

  retVal = this.parseExpr(CTX_NULLABLE|CTX_TOP);
  if ( retVal === null &&
       this.err('throw.has.no.argument') )
     return this.errorHandlerOutput;

  semi = this.semiI();
  semiLoc = this.semiLoc_soft();
  if ( !semiLoc && !this.nl &&
        this.err('no.semi') )
    return this.errorHandlerOutput;

  this.foundStatement = true;
  return { type: 'ThrowStatement', argument: core(retVal), start: startc, end: semi || retVal.end,
     loc: { start: startLoc, end: semiLoc || retVal.loc.end } }

};



},
function(){
this.parseExpr = function (context) {
  var head = this.parseNonSeqExpr(PREC_WITH_NO_OP, context);
  var lastExpr = null;

  if ( this.lttype !== ',' )
    return head;

  // TODO: abide to the original context by using `context = context|(CTX_FOR|CTX_PARPAT)` rather than the
  // assignment below
  context &= (CTX_FOR|CTX_PARPAT);

  var e = [core(head)];
  do {
    this.next() ;
    lastExpr = this.parseNonSeqExpr(PREC_WITH_NO_OP, context);
    e.push(core(lastExpr));
  } while (this.lttype === ',' );

  return {
    type: 'SequenceExpression', expressions: e,
    start: head.start, end: lastExpr.end,
    loc: { start : head.loc.start, end : lastExpr.loc.end} ,y:-1
  };
};



},
function(){
this.parseTryStatement = function () {
  if ( ! this.ensureStmt_soft () &&
         this.err('not.stmt') )
    return this.errorHandlerOutput ;

  this.fixupLabels(false);
  var startc = this.c0,
      startLoc = this.locBegin();

  this.next() ;

  this.enterScope(this.scope.blockScope()); 
  var tryBlock = this.parseBlockStatement_dependent('try');
  this.exitScope(); 

  var finBlock = null, catBlock  = null;
  if (this.lttype === 'Identifier' && this.ltval === 'catch')
    catBlock = this.parseCatchClause();

  if (this.lttype === 'Identifier' && this.ltval === 'finally') {
    this.next();
    this.enterScope(this.scope.blockScope()); 
    finBlock = this.parseBlockStatement_dependent('finally');
    this.exitScope(); 
  }

  var finOrCat = finBlock || catBlock;
  if ( ! finOrCat &&
       this.err('try.has.no.tail')  )
    return this.errorHandlerOutput ;

  this.foundStatement = true;
  return  { type: 'TryStatement', block: tryBlock, start: startc, end: finOrCat.end,
            handler: catBlock, finalizer: finBlock, loc: { start: startLoc, end: finOrCat.loc.end }  ,y:-1};
};



},
function(){
this.parseUnaryExpression = function(context) {
  var u = null,
      startLoc = null,  
      startc = 0,
      isVDT = this.isVDT;

  if (isVDT) {
    this.kw();
    this.isVDT = VDT_NONE;
    u = this.ltval;
    startLoc = this.locBegin();
    startc = this.c0;
  }
  else {
    u = this.ltraw;
    startLoc = this.locOn(1);
    startc = this.c - 1;
  }

  this.next();
  var arg = this.parseNonSeqExpr(PREC_U, context & CTX_FOR);

  if (this.scope.insideStrict() &&
      isVDT === VDT_DELETE &&
      core(arg).type !== 'MemberExpression')
    this.err('delete.arg.not.a.mem',{tn:arg,extra:{c0:startc,loc0:startLoc,context:context}});

  if (isVDT === VDT_AWAIT) {
    var n = {
      type: 'AwaitExpression', argument: core(arg),
      start: startc, end: arg.end,
      loc: { start: startLoc, end: arg.loc.end }
    };
    this.suspys = n;
    return n;
  }
  
  return {
    type: 'UnaryExpression', operator: u,
    start: startc, end: arg.end,
    loc: {
      start: startLoc,
      end: arg.loc.end
    }, argument: core(arg),
    prefix: true
  };
};



},
function(){
this.parseVariableDeclaration = function(context) {
  if (!this.canBeStatement)
    this.err('not.stmt');

  this.canBeStatement = false;

  var startc = this.c0,
      startLoc = this.locBegin(),
      kind = this.ltval,
      elem = null;

  if (this.unsatisfiedLabel) {
    if (kind === 'var')
      this.fixupLabels(false);
    else
      this.err('decl.label',{c0:startc,loc0:startLoc});
  }

  if (this.onToken_ !== null) {
    if (kind === 'let')
      this.lttype = ""; // turn off the automatic tokeniser
    else
      this.lttype = 'Keyword';
  }

  this.next();
  if (kind !== 'var') {
    if (this.hasDeclarator()) {
      if (!(this.scope.canDeclareLetOrClass()))
        this.err('lexical.decl.not.in.block',{c0:startc,loc0:startLoc,extra:kind});
    }
  }

  this.declMode = kind === 'var' ? 
    DM_VAR : DM_LET;
  
  if (kind === 'let' &&
      this.lttype === 'Identifier' &&
      this.ltval === 'in') {
    return null;
  }

  elem = this.parseVariableDeclarator(context);
  if (elem === null) {
    if (kind !== 'let') 
      this.err('var.has.no.declarators',{extra:[startc,startLoc,context,elem,kind]});

    return null; 
  }

  var isConst = kind === 'const';
  // TODO: if there is a context flag signifying that an init must be present,
  // this is no longer needed
  if (isConst && !elem.init && !this.missingInit) {
    if (!(context & CTX_FOR))
      this.err('const.has.no.init',{extra:[startc,startLoc,context,elem]});
    else this.missingInit = true;
  }

  var list = null;
  if (this.missingInit) {
    if (context & CTX_FOR)
      list = [elem];
    else this.err('var.must.have.init',{extra:[startc,startLoc,context,elem,kind]});
  }
  else {
    list = [elem];
    while (this.lttype === ',') {
      this.next();
      elem = this.parseVariableDeclarator(context);
      if (!elem)
        this.err('var.has.an.empty.declarator',{extra:[startc,startLoc,context,list,kind]});
   
      if (this.missingInit || (isConst && !elem.init))
        this.err('var.must.have.init',{extra:[startc,startLoc,context,list,kind],elem:elem});
   
      list.push(elem);
    }
  }

  var lastItem = list[list.length-1];
  var endI = 0, endLoc = null;

  if (!(context & CTX_FOR)) {
    endI = this.semiI() || lastItem.end;
    endLoc = this.semiLoc_soft();
    if (!endLoc) {
      if (this.nl)
        endLoc =  lastItem.loc.end; 
      else  
        this.err('no.semi');
    }
  }
  else {
    endI = lastItem.end;
    endLoc = lastItem.loc.end;
  }

  this.foundStatement = true ;

  return {
    declarations: list,
    type: 'VariableDeclaration',
    start: startc,
    end: endI,
    loc: { start: startLoc, end: endLoc },
    kind: kind  ,y:-1
  };
};

this.parseVariableDeclarator = function(context) {
  var head = this.parsePattern(), init = null;
  if (!head)
    return null;

  if (this.lttype === 'op') {
    if (this.ltraw === '=')  {
       this.next();
       init = this.parseNonSeqExpr(PREC_WITH_NO_OP, context|CTX_TOP);
    }
    else 
      this.err('var.decl.not.=',{extra:[context,head]});
  }
  else if (head.type !== 'Identifier') { // our pattern is an arr or an obj?
    if (!( context & CTX_FOR))  // bail out in case it is not a 'for' loop's init
      this.err('var.decl.neither.of.in',{extra:[context,head]});

    this.missingInit = true;
  }

  var initOrHead = init || head;
  return {
    type: 'VariableDeclarator', id: head,
    start: head.start, end: initOrHead.end,
    loc: {
      start: head.loc.start,
      end: initOrHead.loc.end 
    }, init: init && core(init) ,y:-1
  };
};


},
function(){
this.parseWhileStatement = function () {
   this.enterScope(this.scope.bodyScope());
   this.allow(SA_BREAK|SA_CONTINUE);
   if (!this.ensureStmt_soft())
     this.err('not.stmt');

   this.fixupLabels(true);

   var startc = this.c0,
       startLoc = this.locBegin();
   this.next();

   !this.expectType_soft ('(') &&
   this.err('while.has.no.opening.paren');
 
   var cond = core( this.parseExpr(CTX_NONE|CTX_TOP) );

   !this.expectType_soft (')') &&
   this.err('while.has.no.closing.paren');

   var nbody = this.parseStatement(false);
   this.foundStatement = true;

   var scope = this.exitScope();
   return { type: 'WhileStatement', test: cond, start: startc, end: nbody.end,
       loc: { start: startLoc, end: nbody.loc.end }, body:nbody/*,scope:  scope ,y:-1*/ };
};

},
function(){
this . parseWithStatement = function() {
   if ( !this.ensureStmt_soft () &&
         this.err('not.stmt') )
     return this.errorHandlerOutput ;

   if (this.scope.insideStrict())
     this.err('with.strict')  ;

   this.enterScope(this.scope.bodyScope());
   this.fixupLabels(false);

   var startc = this.c0,
       startLoc = this.locBegin();

   this.next();
   ! this.expectType_soft ('(') &&
   this.err('with.has.no.opening.paren');

   var obj = this.parseExpr(CTX_NONE|CTX_TOP);
   if (! this.expectType_soft (')' ) &&
         this.err('with.has.no.end.paren') )
     return this.errorHandlerOutput ;


   var nbody = this.parseStatement(true);
   this.foundStatement = true;

   var scope = this.exitScope();
   return  {
       type: 'WithStatement',
       loc: { start: startLoc, end: nbody.loc.end },
       start: startc,
       end: nbody.end,
       object: obj, body: nbody/*,scope:  scope ,y:-1*/
   };
};



},
function(){

this.parseYield = function(context) {
  var arg = null,
      deleg = false;

  var c = this.c, li = this.li, col = this.col;
  var startc = this.c0, startLoc = this.locBegin();

  this.next();
  if (  !this.nl  ) {
     if ( this.lttype === 'op' && this.ltraw === '*' ) {
            deleg = true;
            this.next();
            arg = this.parseNonSeqExpr ( PREC_WITH_NO_OP, context & CTX_FOR );
            if (!arg &&
                 this.err('yield.has.no.expr.deleg') )
              return this.errorHandlerOutput ;
     }
     else
        arg = this. parseNonSeqExpr ( PREC_WITH_NO_OP, (context & CTX_FOR)|CTX_NULLABLE );
  }

  var endI, endLoc;

  if ( arg ) { endI = arg.end; endLoc = arg.loc.end; }
  else { endI = c; endLoc = { line: li, column: col }; }  

  var n = { type: 'YieldExpression', argument: arg && core(arg), start: startc, delegate: deleg,
           end: endI, loc: { start : startLoc, end: endLoc } ,y:-1 }
 
  if (this.suspys === null)
    this.suspys = n;

  return n;
};



},
function(){
this .parseO = function(context ) {
  switch ( this. lttype ) {
  case 'op': return true;
  case '--': return true;
  case '-': this.prec = PREC_ADD_MIN; return true;
  case '/':
    if ( this.src.charCodeAt(this.c) === CH_EQUALITY_SIGN ) {
      this.c++ ;
      this.prec = PREC_OP_ASSIG;
      this.ltraw = '/=';
      this.col++; 
    }
    else
      this.prec = PREC_MUL ; 

    return true;

  case 'Identifier':
    switch ( this. ltval ) {
    case 'in':
      this.resvchk();
    case 'of':
      if (context & CTX_FOR)
        break ;

      this.prec = PREC_COMP ;
      this.ltraw = this.ltval;
      return true;

    case 'instanceof':
      this.resvchk();
      this.prec = PREC_COMP  ;
      this.ltraw = this.ltval ;
      return true;

    }
    break;

  case '?':
    this .prec = PREC_COND;
    return true;

  default:
    return false;

  }
};

},
function(){
this.declare = function(id) {
   ASSERT.call(this, this.declMode !== DM_NONE, 'Unknown declMode');
   if (this.declMode & (DM_LET|DM_CONST)) {
     if (id.name === 'let')
       this.err('lexical.name.is.let');
   }

   this.scope.declare(id.name, this.declMode).s(id);
};

this.enterScope = function(scope) {
  this.scope = scope;
};

this.exitScope = function() {
  var scope = this.scope;
  scope.finish();
  this.scope = this.scope.parent;
  return scope;
};

this.allow = function(allowedActions) {
  this.scope.allowed |= allowedActions;
};

},
function(){
this.semiLoc_soft = function () {
  switch (this.lttype) {
  case ';':
     var n = this.loc();
     this.next();
     return n;

  case 'eof':
     return this.nl ? null : this.loc();

  case '}':
     if ( !this.nl )
        return this.locOn(1);
  }
  
  return null;
};

this.semiI = function() {
  switch (this.lttype) {
  case ';':
    return this.c;
  case '}':
    return this.nl ? 0 : this.c0;
  case 'eof':
    return this.nl ? 0 : this.c;
  default:
    return 0;

  }
};

},
function(){
this . findLabel = function(name) {
    return HAS.call(this.labels, name) ?this.labels[name]:null;

};

this .ensureStmt_soft = function() {
   if ( this.canBeStatement ) {
     this.canBeStatement = false;
     return true;
   }
   return false;
};

this . fixupLabels = function(loop) {
    if ( this.unsatisfiedLabel ) {
         this.unsatisfiedLabel.loop = loop;
         this.unsatisfiedLabel = null;
    }
};

this.enterCatchScope = function() {
  this.scope = this.scope.spawnCatch();
};

this.blck = function () { // blck ([]stmt)
  var isFunc = false, stmt = null, stmts = [];
  if (this.directive !== DIR_NONE)
    this.parseDirectives(stmts);

  while (stmt = this.parseStatement(true))
    stmts.push(stmt);

  return (stmts);
};

this.checkForStrictError = function(directive) {
  if (this.esct !== ERR_NONE_YET)
    this.err('strict.err.esc.not.valid');
};

this.parseDirectives = function(list) {
  if (this.v < 5)
    return;

  var r = this.directive;

  // TODO: maybe find a way to let `numstr` take over this process (partially, at the very least);
  // that way, there will no longer be a need to check ltval's type
  while (this.lttype === 'Literal' && typeof this.ltval === STRING_TYPE) {
    this.directive = DIR_MAYBE|r;
    var rv = this.src.substring(this.c0+1, this.c-1);

    // other directives might actually come after "use strict",
    // but that is the only one we are interested to find; TODO: this behavior ought to change
    if (rv === 'use strict')
      this.directive |= DIR_LAST;

    this.dv.value = this.ltval;
    this.dv.raw = rv;

    var elem = this.parseStatement(true);
    list.push(elem);

    if (this.directive & DIR_LAST)
      break;

  }

  this.directive = DIR_NONE;
};

this.gotDirective = function(dv, flags) {
  if (dv.raw === 'use strict') {
    this.scope.enterStrict();
    if (flags & DIR_FUNC)
      this.scope.funcHead.verifyForStrictness();

    this.checkForStrictError(flags);
  }
};
 
this.clearAllStrictErrors = function() {
  this.esct = ERR_NONE_YET;
  this.se = null;
};
 

},
function(){
this .validateID  = function (e) {
  var n = e === "" ? this.ltval : e;

  SWITCH:
  switch (n.length) {
     case  1:
         break SWITCH;
     case  2: switch (n) {
         case 'do':
         case 'if':
         case 'in':
            
            return this.errorReservedID(e);
         default: break SWITCH;
     }
     case 3: switch (n) {
         case 'int' :
            if ( this.v > 5 )
                break SWITCH;
          return  this. errorReservedID(e);

         case 'let' :
            if ( this.v <= 5 || !this.scope.insideStrict() )
              break SWITCH;
         case 'for' : case 'try' : case 'var' : case 'new' :
             return this.errorReservedID(e);

         default: break SWITCH;
     }
     case 4: switch (n) {
         case 'byte': case 'char': case 'goto': case 'long':
            if ( this. v > 5 ) break SWITCH;
         case 'case': case 'else': case 'this': case 'void': case 'true':
         case 'with': case 'enum':
         case 'null':
            return this.errorReservedID(e);

//       case 'eval':
//          if (this.scope.insideStrict()) return this.err('eval.arguments.in.strict');

         default:
            break SWITCH;
     }
     case 5: switch (n) {
         case 'await':
            if (this.isScript &&
               !this.scope.canAwait() && !this.scope.awaitIsKW())
              break SWITCH;
            else
              this.errorReservedID(e);
         case 'final':
         case 'float':
         case 'short':
            if ( this. v > 5 ) break SWITCH;
            return this.errorReservedID(e);
    
         case 'yield': 
            if (!this.scope.insideStrict() && !this.scope.canYield() && !this.scope.yieldIsKW()) {
              break SWITCH;
            }

         case 'break': case 'catch': case 'class': case 'const': case 'false':
         case 'super': case 'throw': case 'while': 
            return this.errorReservedID(e);

         default: break SWITCH;
     }
     case 6: switch (n) {
         case 'double': case 'native': case 'throws':
             if ( this. v > 5 )
                break SWITCH;
             return this.errorReservedID(e); 
         case 'public':
         case 'static':
             if ( this.v > 5 && !this.scope.insideStrict() )
               break SWITCH;
         case 'delete': case 'export': case 'import': case 'return':
         case 'switch': case 'typeof':
            return this.errorReservedID(e) ;

         default: break SWITCH;
     }
     case 7:  switch (n) {
         case 'package':
         case 'private':
            if ( this.scope.insideStrict() ) return this.errorReservedID(e);
         case 'boolean':
            if ( this.v > 5 ) break;
         case 'default': case 'extends': case 'finally':
             return this.errorReservedID(e);

         default: break SWITCH;
     }
     case 8: switch (n) {
         case 'abstract': case 'volatile':
            if ( this.v > 5 ) break;
         case 'continue': case 'debugger': case 'function':
            return this.errorReservedID (e) ;

         default: break SWITCH;
     }
     case 9: switch (n) {
         case 'protected':
         case 'interface':
            if ( this.scope.insideStrict() )
              return this.errorReservedID (e);
         case 'transient':
            if ( this.v <= 5 )
              return this.errorReservedID(e) ;
//       case 'arguments':
//          if (this.scope.insideStrict()) return this.err('eval.arguments.in.strict');

         default: break SWITCH;
     }
     case 10: switch (n) {
         case 'implements':
            if ( this.v > 5 && !this.scope.insideStrict() ) break ;
         case 'instanceof':
            return this.errorReservedID(e) ;

         default: break SWITCH;
    }
    case 12: switch (n) {
      case 'synchronized':
         if ( this. v <= 5 )
           return this.errorReservedID(e) ;

      default: break SWITCH;
    }
  }

  return e ? null : this.id();
};

this.errorReservedID = function(id) {
  this.resvchk();
  if ( !this.throwReserved ) {
     this.throwReserved = true;
     return null;
  }
  if ( this.err('reserved.id',{tn:id}) ) return this.errorHandlerOutput;
}



}]  ],
[Ref.prototype, [function(){
this.resolve = function() {
  ASSERT.call(this, !this.resolved,
    'this ref has already been resolved actually');
  this.resolved = true;
  return this;
};

this.total = function() {
  return this.indirect.total() + this.direct.total();
};

this.absorb = function(anotherRef) {
  ASSERT.call(this, !this.resolved,
    'a resolved reference must absorb through its decl');
  ASSERT.call(this, !anotherRef.resolved,
    'absorbing a reference that has been resolved is not a valid action');
  var fromScope = anotherRef.scope;
  if (fromScope.isIndirect()) {
    if (fromScope.isHoistable())
      this.indirect.fw += anotherRef.total();
    else {
      this.direct.fw += anotherRef.direct.fw;
      this.indirect.fw += anotherRef.indirect.fw;
    }
  }
};

}]  ],
[RefCount.prototype, [function(){
this.total = function() {
  return this.fw + this.ex;
};

}]  ],
[Scope.prototype, [function(){
this.calculateParent = function() {
  if (this.parent.isParen())
    this.parent = this.parent.calculateParen();

  return this.parent;
};

this.calculateAllowedActions = function() {
  if (this.isParen())
    return this.parent.allowed;

  var a = SA_NONE;
  if (this.isLexical() || this.isClass() || this.isCatchHead() || this.isBare())
    a |= this.parent.allowed;
  else if (this.isAnyFnComp()) {
    a |= SA_RETURN;
    if (this.isCtorComp())
      a |= SA_CALLSUP;
    if (this.isGenComp())
      a |= SA_YIELD;
    if (this.isAsyncComp())
      a |= SA_AWAIT;
    if (this.isMem())
      a |= SA_MEMSUP;
  }

  return a;
};

this.calculateScopeMode = function() {
  if (this.isParen())
    return this.parent.mode;

  var m = SM_NONE;
  if (!this.parent) {
    ASSERT.call(this, this.isGlobal(),
      'global scope is the only scope that ' +
      'can have a null parent');
    return m;
  }

  if (this.isClass() || this.isModule() ||
      this.parent.insideStrict())
    m |= SM_STRICT;

  if (this.isLexical() && this.parent.insideLoop())
    m |= SM_LOOP;

  // catch-heads and non-simple fn-heads
  if (!this.isExpr() && !this.isDecl() && this.isHead())
    m |= SM_UNIQUE;

  return m;
};

this.setName = function(name) {
  ASSERT.call(this, this.isExpr(),
    'the current scope is not an expr scope, and can not have a name');
  ASSERT.call(this, this.scopeName === "",
    'the current scope has already got a name');
  this.scopeName = name;
};


},
function(){
this.declare = function(name, mode) {
  return this.declare_m(_m(name), mode);
};

this.declare_m = function(mname, mode) {
  if (mode & DM_LET)
    return this.let_m(mname, mode);
  if (mode & DM_FUNCTION)
    return this.function_m(mname, mode);
  if (mode & DM_CONST)
    return this.const_m(mname, mode);
  if (mode & DM_VAR)
    return this.var_m(mname, mode);
  if (mode & DM_CLS)
    return this.class_m(mname, mode);
  if (mode & DM_CATCHARG)
    return this.catchArg_m(mname, mode);
  if (mode & DM_FNARG)
    return this.fnArg_m(mname, mode);

  ASSERT.call(this, false, 'declmode unknown');
};

this.findDecl = function(name) {
  return this.findDecl_m(_m(name));
};

this.let_m = function(mname, mode) {
  return this.declareLexical_m(mname, mode);
};

this.function_m = function(mname, mode) {
  return this.isLexical() ?
    this.declareLexical_m(mname, mode) :
    this.declareVarLike_m(mname, mode);
};

this.const_m = function(mname, mode) {
  return this.declareLexical_m(mname, mode);
};

this.var_m = function(mname, mode) {
  return this.declareVarLike_m(mname, mode);
};

this.class_m = function(mname, mode) {
  return this.declareLexical_m(mname, mode);
};

this.catchArg_m = function(mname, mode) {
  ASSERT.call(this, this.isCatchHead(),
    'only catch heads are allowed to declare catch-args');
  
  var existing = this.findDecl_m(mname);
  if (existing)
    this.parser.err('var.catch.is.dup');

  var newDecl = null;
  var ref = this.findRef_m(mname, true).resolve();

  newDecl = new Decl().m(mode).n(_u(mname)).r(ref);
  this.insertDecl_m(mname, newDecl);

  return newDecl;
};

this.fnArg_m = function(mname, mode) {
  ASSERT.call(this, this.isAnyFnComp() && this.isHead(),
    'only fn heads are allowed to declare fn-args');

  var ref = this.findRef_m(mname, true),
      newDecl = new Decl().m(mode).n(_u(mname)).r(ref);

  var existing = null;
  if (HAS.call(this.paramMap, mname))
    existing = this.paramMap[mname];
  
  if (existing) {
    if (!this.canDup())
      this.parser.err('var.fn.is.dup.arg');

    if (!this.firstDup)
      this.firstDup = newDecl;
  }
  else {
    switch (_u(mname)) {
    case 'eval':
    case 'arguments':
      if (!this.firstEvalOrArguments)
        this.firstEvalOrArguments = newDecl;
    }
    ref.resolve();
    this.paramMap[mname] = newDecl;
  }

  this.paramList.push(newDecl);
  return newDecl;
};

this.declareLexical_m = function(mname, mode) {
  var existing = this.findDecl_m(mname);
  if (!existing && this.isAnyFnBody())
    existing = this.funcHead.findDecl_m(mname);

  if (existing)
    this.err('lexical.can.not.override.existing');

  
  var newDecl = null, ref = this.findRef_m(mname, true).resolve();
  newDecl = new Decl().m(mode).n(_u(mname)).r(ref);

  this.insertDecl_m(mname, newDecl);
  return newDecl;
};

this.declareVarLike_m = function(mname, mode) {
  var dest = null, varDecl = null;
  if (this.isLexical()) {
    var catchScope = this.surroundingCatchScope;
    if (catchScope) {
      varDecl = catchScope.findCatchVar_m(mname);
      if (varDecl) {
        if (!catchScope.hasSimpleList)
          this.err('non.simple.catch.var.is.not.overridable');

        dest = catchScope;
      }
    }
  }

  if (dest === null) {
    dest = this.scs;
    varDecl = dest.findDecl_m(mname);
    if (varDecl) {
      if (!varDecl.isVarLike())
        this.err('var.can.not.override.nonvarlike');
      if (!varDecl.isFunc() && (mode & DM_FUNC))
        varDecl.mode = mode;
    }
  }

  var newDecl = varDecl;
  if (newDecl === null)
    newDecl = new Decl().m(mode).n(_u(mname));

  var cur = this;
  while (cur !== dest) {
    var existing = cur.findDecl_m(mname);
    if (existing) {
      if (!existing.isVarLike())
        this.err('var.can.not.override.nonvarlike');
    }
    else
      cur.insertDecl_m(mname, newDecl);

    cur = cur.parent;
  }

  if (!varDecl) {
    var ref = dest.findRef_m(mname, true).resolve();
    newDecl.r(ref);
    dest.insertDecl_m(mname, newDecl);
  }

  return newDecl;
};

this.findDecl_m = function(mname) {
  return this.defs.has(mname) ?
    this.defs.get(mname) : null;
};

this.insertDecl_m = function(mname, decl) {
  this.defs.set(mname, decl);
};

},
function(){
this.finish = function() {
  this.tailI = this.iRef.v-1;
  this.handOverRefsToParent();
};

this.handOverRefsToParent = function() {
  var list = this.refs.keys, i = 0;
  while (i < list.length) {
    var ref = this.refs.at(i);
    if (!ref.resolved)
      this.parent.receiveRef_m(list[i], ref);
    i++ ;
  }
};

},
function(){
this.defaultReceive_m = function(mname, ref) {
  var decl = this.findDecl_m(mname);
  if (decl) decl.absorbRef(ref);
  else
    this.findRef_m(mname, true).absorb(ref);
};

this.receiveRef_m = function(mname, ref) {
  ASSERT.call(this, this.isScript() || this.isModule(),
    'this scope is supposed to have its own custom ref');
  this.defaultReceive_m(mname, ref);
};

},
function(){
this.findRef_m = function(mname, createIfNone) {
  return (
    this.refs.has(mname) ? 
    this.refs.get(mname) :
    createIfNone ?
      this.refs.set(mname, new Ref(this)) :
      null
  );
  
};

this.findRef = function(name, createIfNone) {
  return this.findRef_m(_m(name), createIfNone);
};

this.reference = function(name, prevRef) {
  return this.reference_m(_m(name), prevRef);
};

this.reference_m = function(mname, prevRef) {
  var decl = this.findDecl_m(mname);
  if (decl) {
    if (prevRef)
      decl.absorbRef(prevRef);
    else
      decl.ref.direct.ex++;

    return decl.ref;
  }

  var ref = this.findRef_m(mname, true);
  
  if (prevRef) ref.absorb(prevRef);
  else ref.direct.fw++;

  return ref;
};

},
function(){
this.str = function() {
  var emitter = new Emitter();
  this.writeTo(emitter);
  return emitter.code;
};

this.typeString = function() {
  var str = "";

  if (this.type & ST_GLOBAL) str += ":global"; 
  if (this.type & ST_MODULE) str += ":module"; 
  if (this.type & ST_SCRIPT) str += ":script";
  if (this.type & ST_DECL) str += ":decl";
  if (this.type & ST_CLS) str += ":class";
  if (this.type & ST_FN) str += ":fn";
  if (this.type & ST_CLSMEM) str += ":clsmem";
  if (this.type & ST_GETTER) str += ":getter";
  if (this.type & ST_SETTER) str += ":setter";
  if (this.type & ST_STATICMEM) str += ":static";
  if (this.type & ST_CTOR) str += ":ctor";
  if (this.type & ST_OBJMEM) str += ":objmem";
  if (this.type & ST_ARROW) str += ":arrow";
  if (this.type & ST_BLOCK) str += ":block";
  if (this.type & ST_CATCH) str += ":catch";
  if (this.type & ST_ASYNC) str += ":async";
  if (this.type & ST_BARE) str += ":bare";
  if (this.type & ST_BODY) str += ":body";
  if (this.type & ST_METH) str += ":meth";
  if (this.type & ST_EXPR) str += ':expr';
  if (this.type & ST_GEN) str += ":gen";
  if (this.type & ST_HEAD) str += ":head";
  if (this.type & ST_PAREN) str += ":paren";

  return str;
};

this.writeTo = function(emitter) {
  var defs = this.defs,
      scopes = this.ch,
      si = 0,
      di = 0;

  emitter.w(this.headI+':<scope type="'+this.typeString()+'">');
  if (defs.keys.length !== 0 || scopes.length !== 0) {
    emitter.i();
    while (true) {
      var def = null,
          scope = null;
      if (di < defs.keys.length)
        def = defs.at(di);
      if (si < scopes.length)
        scope = scopes[si];
      if (scope === null && def === null)
        break;

      if (def && (scope === null || def.i < scope.headI)) {
        emitter.l();
        def.writeTo(emitter); di++;
      }
      else if (scope && (def === null || scope.headI < def.i)) {
        emitter.l()
        scope.writeTo(emitter); si++;
      }
    }
    emitter.u().l()
  }

  emitter.w(this.tailI+':</scope>');
};

},
function(){
this.clsScope = function(t) {
  return new ClassScope(this, t);
};

this.fnHeadScope = function(t) {
  return new FuncHeadScope(this, t);
};

this.fnBodyScope = function(t) {
  return new FuncBodyScope(this, t);
};

this.blockScope = function() {
  return new LexicalScope(this, ST_BLOCK);
};

this.catchBodyScope = function() {
  return new CatchBodyScope(this);
};

this.catchHeadScope = function() {
  return new CatchHeadScope(this);
};

this.bodyScope = function() {
  return new LexicalScope(this, ST_BODY);
};

this.parenScope = function() {
  return new ParenScope(this);
};

},
function(){
// function component: function head or function body
this.isGlobal = function() { return this.type & ST_GLOBAL; };
this.isModule = function() { return this.type & ST_MODULE; };
this.isScript = function() { return this.type & ST_SCRIPT; };
this.isDecl = function() { return this.type & ST_DECL; };
this.isClass = function() { return this.type & ST_CLS; };
this.isAnyFnComp = function() { return this.type & ST_ANY_FN; };
this.isAnyFnHead = function() {
  return this.isAnyFnComp() && this.isHead();
};
this.isAnyFnBody = function() {
  return this.isAnyFnComp() && this.isBody();
};
this.isClassMem = function() { return this.type & ST_CLSMEM; };
this.isGetterComp = function() { return this.type & ST_GETTER; };
this.isSetterComp = function() { return this.type & ST_SETTER; };
this.isStaticMem = function() { return this.type & ST_STATICMEM; };
this.isCtorComp = function() { return this.type & ST_CTOR; };
this.isObjMem = function() { return this.type & ST_OBJMEM; };
this.isArrowComp = function() { return this.type & ST_ARROW; };
this.isBlock = function() { return this.type & ST_BLOCK; };
this.isCatchComp = function() { return this.type & ST_CATCH; };
this.isBody = function() { return this.type & ST_BODY; };
this.isMethComp = function() { return this.type & ST_METH; };
this.isExpr = function() { return this.type & ST_EXPR; };
this.isMem = function() { return this.isStaticMem() || this.isClassMem() || this.isObjMem(); };
this.isGenComp = function() { return this.type & ST_GEN; };
this.isAsyncComp = function() { return this.type & ST_ASYNC; };
this.isAccessorComp = function() { return this.isGetterComp() || this.isSetterComp(); };
this.isSpecialComp = function() { return this.isAccessorComp() || this.isGenComp(); };
this.isLexical = function() { return this.isCatchBody() || this.isBlock(); };
this.isTopLevel = function() { return this.type & ST_TOP; };
this.isHoistable = function() { return this.isSimpleFnComp() && this.isDecl(); };
this.isIndirect = function() { return this.isAnyFnComp() || this.isClass(); };
this.isConcrete = function() { return this.type & ST_CONCRETE; };
this.isSimpleFnComp = function() { return this.type & ST_FN; };
this.isBare = function() { return this.isBody() && !(this.isLexical() || this.isAnyFnComp()); };
this.isCatchBody = function() { return this.isCatchComp() && this.isBody(); };
this.isCatchHead = function() { return this.isCatchComp() && this.isHead(); };
this.isHead = function() { return this.type & ST_HEAD; };
this.isParen = function() { return this.type & ST_PAREN; };

this.insideIf = function() { return this.mode & SM_INSIDE_IF; };
this.insideLoop = function() { return this.mode & SM_LOOP; };
this.insideStrict = function() { return this.mode & SM_STRICT; };
this.insideBlock = function() { return this.mode & SM_BLOCK; };
this.insideFuncArgs = function() { return this.mode & SM_INARGS; };
this.insideForInit = function() { return this.mode & SM_FOR_INIT; };
this.insideUniqueArgs = function() { return this.mode & SM_UNIQUE; };

this.canReturn = function() { return this.allowed & SA_RETURN; };
this.canContinue = function() { return this.allowed & SA_CONTINUE; };
this.canBreak = function() { return this.allowed & SA_BREAK; };
this.canDeclareLetOrClass = function() {
  return this.isAnyFnBody() || this.isTopLevel() || this.isLexical() || this.insideForInit();
};
this.canDeclareFunc = function() {
  if (this.insideStrict())
    return false;

  return this.isTopLevel() ||
         this.isAnyFnBody() ||
         this.isLexical() ||
         this.insideIf();
};

this.canYield = function() { return this.allowed & SA_YIELD; };
this.canAwait = function() { return this.allowed & SA_AWAIT; };
this.canSupCall = function() {
  return this.isArrowComp() ?
    this.parent.canSupCall() :
    this.allowed & SA_CALLSUP 
};

this.canSupMem = function() {
  return this.isArrowComp() ?
    this.parent.canSupMem() :
    this.allowed & SA_MEMSUP;
};

this.canHaveNewTarget = function() {
   return this.isArrowComp() ?
     this.parent.canHaveNewTarget() :
     this.isAnyFnComp();
};

this.canDup = function() {
  ASSERT.call(this, this.insideFuncArgs(),
    'it has no meaning to call canDup when not ' +
    'in func-arguments');
  return !this.insideStrict() &&
         !this.insideUniqueArgs();
};

this.enterForInit = function() {
  ASSERT.call(this, this.isBare(),
    'to enter for init mode, the scope has to be a bare one');
  
  this.mode |= SM_FOR_INIT;
};

this.exitForInit = function() {
  ASSERT.call(this, this.insideForInit(),
    'can not unset the for-init mode when it is not set');

  this.mode &= ~SM_FOR_INIT;
};

this.enterStrict = function() {
  this.mode |= SM_STRICT;
};

this.exitStrict = function() {
  ASSERT.call(this, this.insideStrict(),
    'can not unset strict when it is not set');
  this.mode &= ~SM_STRICT;
};

this.yieldIsKW = function() { return this.mode & SM_YIELD_KW; };
this.awaitIsKW = function() { return this.mode & SM_AWAIT_KW; };

this.hasHeritage = function() {
  ASSERT.call(this, this.isClass(),
    'only classes are allowed to be tested for '+
    'heritage');
  return this.mode & SM_CLS_WITH_SUPER;
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
this.y = function(n) {
  return this.inGen ? y(n) : 0;
};

this.allocTemp = function() {
  var id = newTemp(this.currentScope.allocateTemp());
  return id;
};

this.releaseTemp = this.rl = function(id) {
  this.currentScope.releaseTemp(id.name);
};

this.transform = this.tr = function(n, list, isVal) {
  var ntype = n.type;
  switch (ntype) {
    case 'Identifier':
    case 'Literal':
    case 'This':
    case 'Super':
    case 'ArrIterGet':
    case 'Unornull':
    case 'ObjIterGet':
    case 'SpecialIdentifier':
    case 'SynthSequenceExpression':
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

},
function(){
transform['UpdateExpression'] = function(n, pushTarget, isVal) {
  if (this.y(n.argument))
    n.argument = this.transform(n.argument, pushTarget, true);
  else
    n.argument = this.transform(n.argument, null, true);
  return n;
};

},
function(){
transform['ArgsPrologue'] = function(n, pushTarget, isVal) {
  var synthLeft = { type: 'ArrayPattern', elements: n.left, y: 0 };
  var synthAssig = { type: 'AssignmentExpression', left: synthLeft, right: n.right, y: 0 };
  var synthStmt = { type: 'ExpressionStatement', expression: synthAssig, y: 0 };
  return this.transform(synthStmt, null, false);
};

},
function(){
var transformAssig = {};
transform['SyntheticAssignment'] =
transform['AssignmentExpression'] = function(n, list, isVal) {
  var transformer = transformAssig[n.left.type], tr = null;
  if (n.type === 'SyntheticAssignment') {
    tr = transformer.call(this, n, list, isVal);
    push_if_assig(tr, list);
    ASSERT.call(this, !isVal, 'synthetic assignment must not be transformed as a value');
    return NOEXPR;
  }

  // transforms-to-sequence
  var tts = false;
  if (!list) { // i.e., list is not a yield container
    list = [];
    tts = true;
  }
  var rightTemp = n.left.type !== 'Identifier' ? this.allocTemp() : null;
  this.evalLeft(n.left, n.right, list);
  rightTemp && this.rl(rightTemp);
  tr = transformer.call(this, n, list, isVal);
  if (tts) {
    if (isVal) push_checked(tr, list);
    else push_if_assig(tr, list);
    return synth_seq(list, isVal);
  }
  
  return tr;
};

// TODO: things like `[a[yield]] = 12` are currently transformed as:
// `t1 = a; yield; t2 = sent; t = arrIter(12); t1[t2] = t.get()`
// from an optimal perspective, this should rather be:
// `t1 = a; yield; t = arrIter(12); t1[sent] = t.get()`
// generally speaking, an 'occupySent' should exist, and should be used by any expression
// that makes use of sent; each call to this hypothetical 'occupySent' will then return 'sent',
// saving the current expression that is using 'sent' in a temp, and further replacing that expression with
// the temp it is saved in. 
// observation: if there are no temps needed for its right, the element need not be saved
var evalLeft = {};
this.evalLeft = function(left, right, list) {
  return evalLeft[left.type].call(this, left, right, list);
};

evalLeft['Identifier'] = function(left, right, list) {
  return;
};

transformAssig['Identifier'] = function(n, list, isVal) {
  n.right = this.tr(n.right, list, true);
  return n;
};

evalLeft['MemberExpression'] = function(left, right, list) {
  left.object = this.tr(left.object, list, true);
  if (right === null || this.y(right))
    left.object = this.save(left.object, list);
  if (left.computed) {
    left.property = this.tr(left.property, list, true);
    if (right === null || this.y(right))
      left.property = this.save(left.property, list);
  }
};

transformAssig['MemberExpression'] = function(n, list, isVal) {
  var left = n.left;
  n.right = this.tr(n.right, list, true);
  
  // `a()[b()] = (yield a()) * (yield)`, you know
  this.rlit(left.property);
  this.rlit(left.object);
  return n;
};

var assigPattern = {};
this.assigPattern = function(left, right, list) {
  return assigPattern[left.type].call(this, left, right, list);
};

this.evalProp = function(elem, list) {
  if (elem.computed) {
    elem.key = this.tr(elem.key, list, true);
    elem.key = this.save(elem.key, list);
  }
  this.evalLeft(elem.value, null, list);
};
 
evalLeft['ObjectPattern'] = function(left, right, list) {
  var elems = left.properties, e = 0;
  while (e < elems.length)
    this.evalProp(elems[e++], list);
};
 
assigPattern['ObjectPattern'] = function(left, right, list) {
  var elems = left.properties, e = 0;
  while (e < elems.length) {
    var elem = elems[e];
    this.tr(
      synth_assig_explicit(elem.value,
        synth_call_objIter_get(right, getExprKey(elem))
      ), list, false
    );
    e++;
  }
};

transformAssig['ObjectPattern'] = function(n, list, isVal) {
  // var iterVal = this.allocTemp();
  // this.evalLeft(n.left, /* TODO: unnecessary */n.right, list);
  // this.rl(iterVal);
  n.right = this.tr(n.right, list, true);
  var iter = this.save(wrapObjIter(n.right), list);
  this.assigPattern(n.left, iter, list);
  this.rl(iter);
  return isVal ? iterVal(iter) : NOEXPR;
};

evalLeft['ArrayPattern'] = function(left, right, list) {
  var elems = left.elements, e = 0;
  while (e < elems.length)
    this.evalLeft(elems[e++], null, list);
};

assigPattern['ArrayPattern'] = function(left, right, list) {
  var elems = left.elements, e = 0;
  while (e < elems.length) {
    this.tr(
      synth_assig_explicit(elems[e],
        synth_call_arrIter_get(right)
      ), list, false
    );
    e++;
  }
};

transformAssig['ArrayPattern'] = function(n, list, isVal) {
  // var iterVal = this.allocTemp();
  // this.evalLeft(n.left, /* TODO: unnecessary */n.right, list);
  // this.rl(iterVal);
  n.right = this.tr(n.right, list, true);
  var iter = this.save(wrapArrIter(n.right), list);
  this.assigPattern(n.left, iter, list);
  this.rl(iter);
  return isVal ? iterVal(iter) : NOEXPR;
}; 

evalLeft['AssignmentPattern'] = function(left, right, list) {
  return this.evalLeft(left.left, right, list);
};

transformAssig['AssignmentPattern'] = function(n, list, isVal) {
  var assigDefault = null, t = null, left = n.left;
  t = this.allocTemp();
  assigDefault = synth_cond(
       wrapInUnornull(
         synth_assig_explicit(t,
           n.right // not transformed -- it's merely a synth call in the form of either #t.get() or #t.get('<string>')
         ) ), left.right, t );
  this.rl(t);
  assigDefault = this.tr(assigDefault, list, true);
  push_checked(this.tr(synth_assig(left.left, assigDefault), list, isVal), list);
  return NOEXPR;
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

  var list = n.body, i = 0;
  while (i < list.length) {
    list[i] = this.tr(list[i], pushTarget, isVal);
    i++;
  }

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
transform['ExpressionStatement'] = function(n, list, isVal) {
  n.expression = this.tr(n.expression, list, false);
  return n;
};



},
function(){
transform['FunctionExpression'] =
transform['FunctionDeclaration'] = function(n, pushTarget, isVal) {
  if (functionHasNonSimpleParams(n))
    n.body = this.addParamAssigPrologueToBody(n);

  if (n.generator)
    return this.transformGenerator(n, null, isVal);

  n.body = this.transform(n.body, null, isVal);
  return n;
};

this.addParamAssigPrologueToBody = function(fn) {
  var prolog = {
    type: 'ArgsPrologue',
    left: fn.params,
    right: synth_jz_arguments_to_array(),
  };

  // TODO: make it more low-power
  fn.body.body = [prolog].concat(fn.body.body);

  return fn.body;
};

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
  while (i < b.length) {
    b[i] = this.transform(b[i], null, false);
    i++;
  }
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
;}).call (function(){try{return module.exports;}catch(e){return this;}}.call(this))