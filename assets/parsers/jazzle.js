(function(){
"use strict";
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
var Parser = function (src, isModule) {

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
  this.tight = !!isModule ;

  this.firstNonSimpArg = null;

  this.isScript = !isModule;
  this.v = 7;

  this.throwReserved = true;
 
  this.errorHandlers = {};
  this.errorHandlerOutput = null;

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
  this.strictError = { offset: -1, line: -1, column: -1, stringNode: null };

  this.parenAsync = null; // so that things like (async)(a,b)=>12 will not get to parse.
};

;
function Scope(parent, type) {
  this.type = type;

  if (!parent) 
    ASSERT.call(this.isConcrete(), 'sub-scopes must have a parent');

  this.parent = parent;
  this.funcScope = 
     this.isConcrete() ? this : this.parent.funcScope;

  this.definedNames = {};


  this.idNames = {};
  this.isInComplexArgs = false;
  this.strict = this.parent ? this.parent.strict : false;
  this.synth = false;
  
  // TODO: is it really needed? because all it will do is to delegate errors
  this.parser = null;
  if (this.parent && this.isConcrete())
    this.parser = this.parent.parser;
}

Scope.createFunc = function(parent, decl) {
  var scope = new Scope(parent, decl ?
       ST_FN_STMT :
       ST_FN_EXPR );
  return scope;
};

Scope.createLexical = function(parent, loop) {
   return new Scope(parent, !loop ?
        ST_LEXICAL :
        ST_LEXICAL|ST_LOOP);
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

var STRING_TYPE = typeof "string";
var NUMBER_TYPE = typeof 0;
var HAS = {}.hasOwnProperty;

function ASSERT(cond, message) { if (!cond) throw new Error(message); }

// TODO: ST_STRICT and ST_ALLOW_FUNC_DECL
var ST_FN_EXPR = 1,
    ST_FN_STMT = ST_FN_EXPR << 1,
    ST_LEXICAL = ST_FN_STMT << 1,
    ST_LOOP = ST_LEXICAL << 1,
    ST_MODULE = ST_LOOP << 1,
    ST_SCRIPT = ST_MODULE << 1,
    ST_GLOBAL = ST_SCRIPT << 1,
    
    // TODO: only used to determine whether a scope can have a catch var
    ST_CATCH = ST_GLOBAL << 1,

    ST_CLASS_EXPR = ST_CATCH << 1,
    ST_CLASS_STMT = ST_CLASS_EXPR << 1,

    ST_FN = ST_FN_EXPR|ST_FN_STMT,
    ST_TOP = ST_SCRIPT|ST_MODULE,
    ST_CONCRETE = ST_TOP|ST_FN,
    ST_HOISTED = ST_FN_STMT|ST_CLASS_STMT;

var CTX_NONE = 0,
    CTX_PARAM = 1,
    CTX_FOR = CTX_PARAM << 1,
    CTX_PAT = CTX_FOR << 1,
    CTX_NULLABLE = CTX_PAT << 1,
    CTX_DEFAULT = CTX_NULLABLE << 1,
    CTX_HASPROTO = CTX_DEFAULT << 1,
    CTX_HAS_A_PARAM_ERR = CTX_HASPROTO << 1,
    CTX_HAS_AN_ASSIG_ERR = CTX_HAS_A_PARAM_ERR << 1,
    CTX_HAS_A_SIMPLE_ERR = CTX_HAS_AN_ASSIG_ERR << 1,
    CTX_NO_SIMPLE_ERR = CTX_HAS_A_SIMPLE_ERR << 1,
    CTX_ASYNC_NO_NEWLINE_FN = CTX_NO_SIMPLE_ERR << 1,
    CTX_PARPAT = CTX_PARAM|CTX_PAT,
    CTX_PARPAT_ERR = CTX_HAS_A_PARAM_ERR|CTX_HAS_AN_ASSIG_ERR|CTX_HAS_A_SIMPLE_ERR;

// TODO: order matters in the first few declarations below, mostly due to a 
// slight performance gain in parseFunc, where MEM_CONSTRUCTOR and MEM_SUPER in `flags` are
// getting added to the current scope flags.
// the ordering is also to make the relevant value sets (i.e., SCOPE_FLAG_* and MEM_*)
// span less bit lengths; this order sensitivity is something that must change in a very
// near future.
var MEM_CLASS = 1, 
    MEM_GEN = MEM_CLASS << 1,
   
    SCOPE_FLAG_GEN = MEM_GEN,
    SCOPE_FLAG_ALLOW_YIELD_EXPR = SCOPE_FLAG_GEN,

    MEM_SUPER = MEM_GEN << 1,
    SCOPE_FLAG_ALLOW_SUPER = MEM_SUPER,    

    MEM_CONSTRUCTOR = MEM_SUPER << 1,
    SCOPE_FLAG_IN_CONSTRUCTOR = MEM_CONSTRUCTOR,

    MEM_ASYNC = MEM_CONSTRUCTOR << 1,
    SCOPE_FLAG_ALLOW_AWAIT_EXPR = MEM_ASYNC,

    SCOPE_FLAG_BREAK = SCOPE_FLAG_ALLOW_AWAIT_EXPR << 1,
    SCOPE_FLAG_CONTINUE = SCOPE_FLAG_BREAK << 1,
    SCOPE_FLAG_FN = SCOPE_FLAG_CONTINUE << 1,
    SCOPE_FLAG_ARG_LIST = SCOPE_FLAG_FN << 1,
    SCOPE_FLAG_IN_BLOCK = SCOPE_FLAG_ARG_LIST << 1,
    SCOPE_FLAG_IN_IF = SCOPE_FLAG_IN_BLOCK << 1,
    SCOPE_FLAG_ALLOW_RETURN_STMT = SCOPE_FLAG_FN,
    SCOPE_FLAG_CONSTRUCTOR_WITH_SUPER = SCOPE_FLAG_IN_CONSTRUCTOR|SCOPE_FLAG_ALLOW_SUPER,
    SCOPE_FLAG_NONE = 0,
    INHERITED_SCOPE_FLAGS = SCOPE_FLAG_ALLOW_SUPER|MEM_CONSTRUCTOR,
    CLEAR_IB = ~(SCOPE_FLAG_IN_BLOCK|SCOPE_FLAG_IN_IF),

    MEM_OBJ = MEM_ASYNC << 1,
    MEM_SET = MEM_OBJ << 1,
    MEM_GET = MEM_SET << 1,
    MEM_STATIC = MEM_GET << 1,
    MEM_PROTOTYPE = MEM_STATIC << 1,
    MEM_OBJ_METH = MEM_PROTOTYPE << 1,
    MEM_PROTO = MEM_OBJ_METH << 1,
    MEM_HAS_CONSTRUCTOR = MEM_PROTO << 1,
    MEM_ACCESSOR = MEM_GET|MEM_SET,
    MEM_SPECIAL = MEM_ACCESSOR|MEM_GEN|MEM_ASYNC,
    MEM_CLASS_OR_OBJ = MEM_CLASS|MEM_OBJ;

var ARGLEN_GET = 0,
    ARGLEN_SET = 1,
    ARGLEN_ANY = -1;

var DECL_MODE_VAR = 1,
    DECL_MODE_LET = DECL_MODE_VAR << 1,
    DECL_MODE_FUNC_STMT = DECL_MODE_LET << 1,
    DECL_DUPE = DECL_MODE_FUNC_STMT << 1,
    DECL_MODE_FUNC_PARAMS = DECL_DUPE << 1,
    DECL_MODE_FUNC_EXPR = DECL_MODE_FUNC_PARAMS << 1,
    DECL_MODE_CATCH_PARAMS = DECL_MODE_FUNC_EXPR << 1,
    DECL_MODE_CLASS_STMT = DECL_MODE_CATCH_PARAMS << 1,
    DECL_MODE_CLASS_EXPR = DECL_MODE_FUNC_EXPR,
    DECL_MODE_VAR_LIKE = DECL_MODE_VAR|DECL_MODE_FUNC_PARAMS,
    DECL_MODE_LET_LIKE = DECL_MODE_LET|DECL_MODE_CATCH_PARAMS,
    DECL_MODE_EITHER = DECL_MODE_CLASS_STMT|DECL_MODE_FUNC_STMT,
    DECL_MODE_FCE = DECL_MODE_FUNC_EXPR|DECL_MODE_CLASS_EXPR;

var DECL_NONE = 0;
var DECL_NOT_FOUND = 
  DECL_NONE;

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
    DIR_HANDLED_BY_NEWLINE = DIR_MAYBE << 1;
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
var ERR_NONE_YET = 0,
    // [(a)] = 12;
    ERR_PAREN_UNBINDABLE = ERR_NONE_YET + 1,

    // { a = 12 };
    ERR_SHORTHAND_UNASSIGNED = ERR_PAREN_UNBINDABLE + 1,

    // [...a, b] = [...e,] = 12 
    ERR_NON_TAIL_REST = ERR_SHORTHAND_UNASSIGNED + 1,

    // [arguments, [arguments=12], [arguments]=12, eval] = 'l'
    ERR_ARGUMENTS_OR_EVAL_ASSIGNED = ERR_NON_TAIL_REST + 1,

    // function* l() { ([e=yield])=>12 }
    ERR_YIELD_OR_SUPER = ERR_ARGUMENTS_OR_EVAL_ASSIGNED + 1,

    // (a, ...b)
    ERR_UNEXPECTED_REST = ERR_YIELD_OR_SUPER + 1,

    // ()
    ERR_EMPTY_LIST_MISSING_ARROW = ERR_UNEXPECTED_REST + 1,

    // (a,)
    ERR_NON_TAIL_EXPR = ERR_EMPTY_LIST_MISSING_ARROW + 1,

    // async a
    ERR_INTERMEDIATE_ASYNC = ERR_NON_TAIL_EXPR + 1,

    ERR_ASYNC_NEWLINE_BEFORE_PAREN = ERR_INTERMEDIATE_ASYNC + 1,
    ERR_ARGUMENTS_OR_EVAL_DEFAULT = ERR_ASYNC_NEWLINE_BEFORE_PAREN + 1;

;
// ! ~ - + typeof void delete    % ** * /    - +    << >>
// > <= < >= in instanceof   === !==    &    ^   |   ?:    =       ...



var PREC_WITH_NO_OP = 0;
var PREC_SIMP_ASSIG = PREC_WITH_NO_OP + 1  ;
var PREC_OP_ASSIG = PREC_SIMP_ASSIG + 40 ;
var PREC_COND = PREC_OP_ASSIG + 1;
var PREC_OO = -12 ;

var PREC_BOOL_OR = PREC_COND + 2;
var PREC_BOOL_AND  = PREC_BOOL_OR + 2 ;
var PREC_BIT_OR = PREC_BOOL_AND + 2 ;
var PREC_XOR = PREC_BIT_OR + 2;
var PREC_BIT_AND = PREC_XOR + 2;
var PREC_EQUAL = PREC_BIT_AND + 2;
var PREC_COMP = PREC_EQUAL + 2;
var PREC_SH = PREC_COMP + 2;
var PREC_ADD_MIN = PREC_SH + 2;
var PREC_MUL = PREC_ADD_MIN + 2;
var PREC_EX = PREC_MUL + 2;
var PREC_U = PREC_EX + 1;

function isAssignment(prec) { return prec === PREC_SIMP_ASSIG || prec === PREC_OP_ASSIG ;  }
function isRassoc(prec) { return prec === PREC_U ; }
function isBin(prec) { return prec !== PREC_BOOL_OR && prec !== PREC_BOOL_AND ;  }
function isMMorAA(prec) { return prec < 0 ;  }
function isQuestion(prec) { return prec === PREC_COND  ; }


;

var SCOPE_FUNC = 1, SCOPE_CATCH = 2, SCOPE_LEXICAL = 0;

var REF_I = 1, REF_D = 2;

var has = Object.hasOwnProperty; 

var VAR_DEF = 1, LET_OR_CONST = 2;
     
var SCOPE_LOOP = 4;

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

var has   = Object.prototype.hasOwnProperty;

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
};

function createObj(fromPrototype) {
  function Obj() {}
  Obj.prototype = fromPrototype;
  return new Obj();
}

function getOwnN(obj, name, notHave) {
  return HAS.call(obj, name) ? obj[name] : notHave;
}

function getOwn(obj, name) {
  return getOwnN(obj, name, null);
}

function hasOwn(obj, name) {
  return HAS.call(obj, name);
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
[Parser.prototype, [function(){
this.asArrowFuncArgList = function(argList) {
  var i = 0, list = argList;
  while (i < list.length)
    this.asArrowFuncArg(list[i++]);
};

this.asArrowFuncArg = function(arg) {
  var i = 0, list = null;

  if (this.firstNonSimpArg === null && arg.type !== 'Identifier')
    this.firstNonSimpArg = arg;

  if (arg === this.po)
    this.err('invalid.arg');

  switch  ( arg.type ) {
  case 'Identifier':
    if ((this.scopeFlags & SCOPE_FLAG_ALLOW_AWAIT_EXPR) &&
       arg.name === 'await')
      this.err('arrow.param.is.await.in.an.async');
     
    // TODO: this can also get checked in the scope manager rather than below
    if (this.tight && arguments_or_eval(arg.name))
      this.err('binding.to.arguments.or.eval');

    this.declare(arg);
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
    if (arg.operator !== '=')
      this.err('complex.assig.not.arg');

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
    if (this.e < 7 && arg.argument.type !== 'Identifier')
      this.err('binding.rest.arg.not.id');
    this.asArrowFuncArg(arg.argument);
    arg.type = 'RestElement';
    return;

  case 'RestElement':
    if (this.e < 7 && arg.argument.type !== 'Identifier')
      this.err('binding.rest.arg.not.id');
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


this.parseArrowFunctionExpression = function(arg, context)   {

  var tight = this.tight, async = false;

  this.enterFuncScope(false);
  this.declMode = DECL_MODE_FUNC_PARAMS;
  this.enterComplex();

  var scopeFlags = this.scopeFlags;
  this.scopeFlags &= INHERITED_SCOPE_FLAGS;

  if (this.pt === ERR_ASYNC_NEWLINE_BEFORE_PAREN) {
    ASSERT.call(this, arg === this.pe, 'how can an error core not be equal to the erroneous argument?!');
    this.err('arrow.newline.before.paren.async');
  }

  switch ( arg.type ) {
  case 'Identifier':
    this.firstNonSimpArg = null;
    this.asArrowFuncArg(arg);
    break;

  case PAREN_NODE:
    this.firstNonSimpArg = null;
    if (arg.expr) {
      if (arg.expr.type === 'SequenceExpression')
        this.asArrowFuncArgList(arg.expr.expressions);
      else
        this.asArrowFuncArg(arg.expr);
    }
    break;

  case 'CallExpression':
    if (arg.callee.type !== 'Identifier' || arg.callee.name !== 'async')
      this.err('not.a.valid.arg.list');
    if (this.parenAsync !== null && arg.callee === this.parenAsync.expr)
      this.err('arrow.has.a.paren.async');

    async = true;
    this.scopeFlags |= SCOPE_FLAG_ALLOW_AWAIT_EXPR;
    this.asArrowFuncArgList(arg.arguments);
    break;

  case INTERMEDIATE_ASYNC:
    async = true;
    this.scopeFlags |= SCOPE_FLAG_ALLOW_AWAIT_EXPR;
    this.asArrowFuncArg(arg.id);
    break;

  default:
    this.err('not.a.valid.arg.list');

  }

  this.currentExprIsParams();

  if (this.nl)
    this.err('new.line.before.arrow');

  this.next();

  var isExpr = true, nbody = null;

  if ( this.lttype === '{' ) {
    var prevLabels = this.labels;
    this.labels = {};
    isExpr = false;
    this.scopeFlags |= SCOPE_FLAG_FN;
    nbody = this.parseFuncBody(CTX_NONE|CTX_PAT|CTX_NO_SIMPLE_ERR);
    this.labels = prevLabels;
  }
  else
    nbody = this. parseNonSeqExpr(PREC_WITH_NO_OP, context|CTX_PAT) ;

  this.exitScope();
  this.tight = tight;

  this.scopeFlags = scopeFlags;

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
this .ensureSimpAssig_soft = function(head) {
  switch(head.type) {
    case 'Identifier':
       if ( this.tight && arguments_or_eval(head.name) )
         this.err('assig.to.eval.or.arguments');

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
        stmt = false;
      }

      n = this.parseFunc(context, MEM_ASYNC);
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
this. parseClass = function(context) {
  var startc = this.c0,
      startLoc = this.locBegin();

  var isStmt = false, name = null;
  if (this.canBeStatement) {
    isStmt = true;
    this.canBeStatement = false;
  }
  this.next(); // 'class'

  if (isStmt) {
    if (!this.canDeclareClassInScope())
      this.err('class.decl.not.in.block');
    if (this.lttype === 'Identifier' && this.ltval !== 'extends') {
      this.declMode = DECL_MODE_CLASS_STMT;
      name = this.parsePattern();
    }
    else if (!(context & CTX_DEFAULT))
      this.err('class.decl.has.no.name');
  }
  else if (this.lttype === 'Identifier' && this.ltval !== 'extends') {
    this.enterLexicalScope(false);
    this.scope.synth = true;
    this.declMode = DECL_MODE_CLASS_EXPR;
    name = this.parsePattern();
  }

  var memParseFlags = MEM_CLASS;
  var superClass = null;
  if ( this.lttype === 'Identifier' && this.ltval === 'extends' ) {
     this.next();
     superClass = this.parseExprHead(CTX_NONE);
     memParseFlags |= MEM_SUPER;
  }

  var list = [];
  var startcBody = this.c - 1, startLocBody = this.locOn(1);

  if (!this.expectType_soft('{'))
    this.err('class.no.curly');

  var elem = null;

  while (true) {
    if (this.lttype === ';') {
      this.next();
      continue;
    }
    elem = this.parseMem(CTX_NONE, memParseFlags);
    if (elem !== null) {
      list.push(elem);
      if (elem.kind === 'constructor')
        memParseFlags |= MEM_HAS_CONSTRUCTOR;
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
      body: list/* ,y:-1*/
    }/* ,y:-1*/ 
  };

  if (!this.expectType_soft('}'))
    this.err('class.unfinished');

  if (isStmt)
    this.foundStatement = true;

  return n;
};

this.parseSuper = function() {
  var n = {
    type: 'Super', loc: { start: this.locBegin(), end: this.loc() },
    start: this.c0, end: this.c
  };
 
  this.next();
  switch ( this.lttype ) {
  case '(':
    if ((this.scopeFlags & SCOPE_FLAG_CONSTRUCTOR_WITH_SUPER) !==
      SCOPE_FLAG_CONSTRUCTOR_WITH_SUPER)
      this.err('class.super.call');
 
    break;
 
  case '.':
  case '[':
    if (!(this.scopeFlags & SCOPE_FLAG_ALLOW_SUPER))
      this.err('class.super.mem');
 
    break ;
  
  default:
    this.err('class.super.lone'); 

  }
 
  return n;
};

},
function(){
this.readMultiComment = function () {
  var c = this.c, l = this.src, e = l.length,
      r = -1, n = true, start = c;

  while (c < e) {
    switch (r = l.charCodeAt(c++ ) ) {
    case CH_MUL:
      if (l.charCodeAt(c) === CH_DIV) {
        c++;
        this.col += (c-start);
        this.c = c;
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

  this.err( 'comment.multi.unfinished');
};

this.readLineComment = function() {
    var c = this.c, l = this.src,
        e = l.length, r = -1;

    L:
    while ( c < e )
     switch (r = l.charCodeAt(c++ ) ) {
     case CH_CARRIAGE_RETURN:
       if (CH_LINE_FEED === l.charCodeAt(c))
         c++;
     case CH_LINE_FEED :
     case 0x2028:
     case 0x2029 :
       this.col = 0 ;
       this.li++;
       break L;

//     default : if ( r >= 0x0D800 && r <= 0x0DBFF ) this.col-- ;
     }

     this.c=c;
     return;
};

},
function(){
this.parseExport = function() {
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
             this.err('export.all.not.*') )
           return this.errorHandlerOutput;
 
         this.next();
         if ( !this.expectID_soft('from') &&
               this.err('export.all.no.from') )
           return this.errorHandlerOutput;

         if (!(this.lttype === 'Literal' &&
              typeof this.ltval === STRING_TYPE ) && 
              this.err('export.all.source.not.str') )
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
                   this.err('export.specifier.not.as') )
                return this.errorHandlerOutput ;

              this.next();
              if ( this.lttype !== 'Identifier' ) { 
                 if (  this.err('export.specifier.after.as.id') )
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
               this.err('export.named.list.not.finished') )
           return this.errorHandlerOutput  ;

         if ( this.lttype === 'Identifier' ) {
           if ( this.ltval !== 'from' &&
                this.err('export.named.not.id.from') )
              return this.errorHandlerOutput;

           else this.next();
           if ( !( this.lttype === 'Literal' &&
                  typeof this.ltval ===  STRING_TYPE) &&
                this.err('export.named.source.not.str') )
             return this.errorHandlerOutput ;

           else {
              src = this.numstr();
              endI = src.end;
           }
         }
         else
            if (firstReserved && this.err('export.named.has.reserved') )
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
        this.ltval === 'default' ) { context = CTX_DEFAULT; this.next(); }
  
   if ( this.lttype === 'Identifier' ) {
       switch ( this.ltval ) {
          case 'let':
          case 'const':
             if (context === CTX_DEFAULT && 
                 this.err('export.default.const.let') )
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
                ASSERT.call(this, this.nl, 'no newline before the "function" and still errors? -- impossible!');
                this.err('export.newline.before.the.function');
              } 
              else
                this.err('export.async.but.no.function');
            }
        }
   }

   if ( context !== CTX_DEFAULT ) {

     if (!ex && this.err('export.named.no.exports') )
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
// TODO: needs a thorough simplification
this.parseImport = function() {
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
// TODO: trickyContainer
this.throwTricky = function(source, trickyType, trickyCore) {
  if (!HAS.call(tm, trickyType))
    throw new Error("Unknown error value: "+trickyType);
  
  this.err(tm[trickyType], {tn:trickyCore, extra:{source:source}});
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
   if ( has.call(this.errorHandlers, errorType) )
     return this.handleError(this.errorHandlers[errorType], errParams);

   var message = "";
   if (!HAS.call(ErrorBuilders, errorType))
     message = "Error: " + errorType + "\n" +
       this.src.substr(this.c-120,120) +
       ">>>>" + this.src.charAt(this.c+1) + "<<<<" +
       this.src.substr(this.c, 120);

   else {
     errParams = this.normalize(errParams);
     var errorBuilder = ErrorBuilders[errorType];  
     var errorInfo = this.buildErrorInfo(errorBuilder, errParams);

     var offset = errorInfo.c0,
         line = errorInfo.li0,
         column = errorInfo.col0,
         errMessage = errorInfo.messageTemplate.applyTo(errParams);

     message += "Error: "+line+":"+column+" (src@"+offset+"): "+errMessage;

     // TODO: add a way to print a 'pinpoint', i.e., the particular chunk of the
     // source code that is causing the error
   }

   throw new Error(message);
};
  
this.handleError = function(handlerFunction, errorTok, args ) {
   var output = handlerFunction.call( this, params, coords );
   if ( output ) {
     this.errorHandlerOutput = output;
     return true;
   }

   return false;
};

var exclusivity = {
  c0: {tn: 1}, c: {tn: 1},
  li0: {loc0: 1,tn: 1}, li: {loc: 1,tn: 1},
  col0: {loc0: 1, tn: 1}, col: {loc: 1, tn: 1},
  parser: {}, extra: {},
  loc0: {tn: 1, li0: 1, col0: 1},
  loc: {tn: 1, li: 1, col: 1},
  tn: { 
    c0: 1, c: 1,
    col0: 1, li0: 1,
    col: 1, li: 1,
    loc0: 1, loc: 1
  }
}; 

this.getExclusivity = function(name, obj) {
  if (!HAS.call(exclusivity, name))
    throw new Error('no map for ' + name);
  var clashes = null;
  for (var n in exclusivity[name]) {
    if (!HAS.call(obj, n))
      continue;
    if (clashes === null)
      clashes = [];
    clashes.push(n);
  }
  return clashes;
};

this.verifyExclusivity = this.veri = function(name, obj) {
  var e = this.getExclusivity(name, obj);
  if (!e) return; 
      
  throw new Error("clashing error; name '"+name+"'; clash list: ["+e.join(", ")+"]");
};

// TODO: choose a more descriptive name
var NORMALIZE_COMMON = ['li0', 'c0', 'col0', 'li', 'c', 'col'];

this.normalize = function(err) {
  // normalized err
  var e = {
    c0: -1, li0: -1, col0: -1,
    c: -1, li: -1, col: -1,
    tn: null,
    parser: this,
    extra: null
  };
  
  if (err) {
    var i = 0;
    while (i < NORMALIZE_COMMON.length) {
      var name = NORMALIZE_COMMON[i];
      if (HAS.call(err, name)) {
        this.veri(name, err);
        e[name] = err[name];
      }
      i++;
    } 
    if (HAS.call(err, 'tn')) {
      this.veri('tn', err);
      var t = err.tn;
      e.c0 = t.start; e.li0 = t.loc.start.line; e.col0 = t.loc.start.column;
      e.c = t.end; e.li = t.loc.end.line; e.col = t.loc.end.column;
      e.tn = err.tn; 
    }
    if (HAS.call(err, 'loc0')) {
      this.veri('loc0', err);
      e.li0 = err.loc0.line; e.col0 = err.loc0.column; 
    }
    if (HAS.call(err, 'loc')) {
      this.veri('loc', err);
      e.li = err.loc.line; e.col = err.loc.column;
    }
    if (HAS.call(err, 'extra')) { e.extra = err.extra; }
  }

  return e;
};

// TODO: find a way to squash it with normalize
this.buildErrorInfo = function(builder, params) {
  var errInfo = {
    messageTemplate: null,
    c: -1, li: -1, col: -1,
    c0: -1, li0: -1, col0: -1
  };

  // TODO: find a way to run this verification when the
  // builder is first added to the ErrorBuilders obj, rather than when the builder
  // is applied to the params given to it
  var i = 0;
  while (i < NORMALIZE_COMMON.length) {
    var name = NORMALIZE_COMMON[i];
    if (HAS.call(builder, name)) {
      this.veri(name, builder);
      errInfo[name] = builder[name].applyTo(params);
    }
    i++;
  }

  if (HAS.call(builder, 'tn')) {
    this.veri('tn', builder);
    var t = builder.tn.applyTo(params);
    errInfo.li0 = t.loc.start.line;
    errInfo.c0 = t.start;
    errInfo.col0 = t.loc.start.column;
    errInfo.li = t.loc.end.line;
    errInfo.c = t.end;
    errInfo.col = t.loc.end.column;
  }
 
  errInfo.messageTemplate = builder.messageTemplate;

  if (builder.preprocessor)
    builder.preprocessor.call(errInfo);
 
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
a('arrow.paren.no.arrow',
  { tn: 'parser.unsatisfiedArg', m: 'Unexpected token: ...' },
  '(a,...b)');

a('assignable.unsatisfied',
  { tn: 'parser.unsatisfiedAssignment', m: 'Shorthand assignments can not be left unassigned' },
  '[{a=b}]');

a('assig.not.first',
  { c0: 'parser.c',
    li0: 'parser.li',
    col0: 'parser.col',
    m: 'Assignment left hand side not valid',
    p: function() { this.c0 -= 1; this.col0 -= 1; }
  },
  'a*b=12');

a('assig.not.simple',
  { tn: 'tn',
    m: 'Identifiers along with member expressions are the only valid targets for non-simple assignments; {tn.type} is neither an identifier nor a member expression' });

a('assig.to.eval.or.arguments',
  { tn: 'tn',
    m: '{tn.name} cannot be modified in the current context' },
  '"use strict"; [eval, arguments=12]=l');

a('binding.rest.arg.not.id',
  { tn:'tn',
    m: 'a function\'s rest parameter can only have an identifier as its argument; in this case, it is a {tn.argument.type}' },
  '(a, ...[b])=>12', '(function (e, ...{l}) {})');

a('block.unfinished',
  { c0: 'parser.c0', li0: 'parser.li0', col0: 'parser.col0',
    m: 'the block starting at {tn.loc.start.line}:{tn.loc.start.column} is unfinished; got a token of type {parser.lttype} instead of a closing "}"' }, '{ )');

set('block.dependent.is.unfinished', 'block.unfinished');

// TODO: locations
a('block.dependent.no.opening.curly',
  { c0: 'parser.c0', li0: 'parser.li0', col0: 'parser.col0',
    m: 'curly brace was expected after this {extra.blockOwner}; instead, got a token with type {parser.lttype}' },
  'try (', 'try {} catch (e) return');


},
function(){
this.readEsc = function ()  {
  var src = this.src, b0 = 0, b = 0, start = -1;
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
       if ( this.tight ) {
          if ( b0 === CH_0 ) {
               b0 = src.charCodeAt(this.c +  1);
               if ( b0 < CH_0 || b0 >= CH_8 )
                 return '\0';
          }
          if ( this.err('strict.oct.str.esc') )
            return this.errorHandlerOutput
       }
       else if (this.directive !== DIR_NONE) {
         if (this.strictError.stringNode === null) {
           this.strictError.offset = this.c;
           this.strictError.line = this.li;
           this.strictError.column = this.col + (this.c-start);
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
       if (this.tight)
         this.err('strict.oct.str.esc');
       else if (this.directive !== DIR_NONE) {
         if (this.strictError.stringNode === null) {
           this.strictError.offset = this.c;
           this.strictError.line = this.li;
           this.strictError.column = this.col + (this.c-start);
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
       if ( this.err('strict.oct.str.esc') )
         return this.errorHandlerOutput

    case CH_4: case CH_5: case CH_6: case CH_7:
       if (this.err('strict.oct.str.esc') )
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
  var e = this.src.charCodeAt(this.c);
  if (CH_BACK_SLASH === e) {
    if (CH_u !== this.src.charCodeAt(++this.c) &&
        this.err('u.second.esc.not.u') )
      return this.errorHandlerOutput ;

    e = (this.peekUSeq());
  }
//  else this.col--;
  if ( (e < 0x0DC00 || e > 0x0DFFF) && this.err('u.second.not.in.range') )
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
      if ( n === - 1 && this.err('u.esc.hex') )
        return this.errorHandlerOutput ;

      byteVal <<= 4;
      byteVal += n;
      if (byteVal > 0x010FFFF && this.err('u.curly.not.in.range') )
        return this.errorHandler ;

      n = l.charCodeAt( ++ c);
    } while (c < e && n !== CH_RCURLY);

    if ( n !== CH_RCURLY && this.err('u.curly.is.unfinished') ) 
      return this.errorHandlerOutput ;

    this.c = c;
    return byteVal;
  }
 
  n = toNum(l.charCodeAt(c));
  if ( n === -1 && this.err('u.esc.hex') )
    return this.errorHandlerOutput;
  byteVal = n;
  c++ ;
  n = toNum(l.charCodeAt(c));
  if ( n === -1 && this.err('u.esc.hex') )
    return this.errorHandlerOutput;
  byteVal <<= 4; byteVal += n;
  c++ ;
  n = toNum(l.charCodeAt(c));
  if ( n === -1 && this.err('u.esc.hex') )
    return this.errorHandlerOutput;
  byteVal <<= 4; byteVal += n;
  c++ ;
  n = toNum(l.charCodeAt(c));
  if ( n === -1 && this.err('u.esc.hex') )
    return this.errorHandlerOutput;
  byteVal <<= 4; byteVal += n;

  this.c = c;

  return byteVal;
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
    this.err('for.with.no.opening.paren');

  var head = null, headIsExpr = false;

  var scopeFlags = this.scopeFlags;

  // inside a for statement's init is like a block
  this.scopeFlags = SCOPE_FLAG_IN_BLOCK;

  this.enterLexicalScope(true);

  this.missingInit = false;
  if ( this.lttype === 'Identifier' ) {
    switch ( this.ltval ) {
    case 'var':
      this.canBeStatement = true;
      head = this.parseVariableDeclaration(CTX_FOR);
      break;

    case 'let':
      if ( this.v >= 5 ) {
        this.canBeStatement = true;
        head = this.parseLet(CTX_FOR);
      }
      break;

    case 'const' :
      if (this.v < 5)
        this.err('const.not.in.v5');

      this.canBeStatement = true;
      head = this. parseVariableDeclaration(CTX_FOR);
         break ;

    }
  }

  this.scopeFlags = scopeFlags;

  if (head === null) {
    headIsExpr = true;
    head = this.parseExpr( CTX_NULLABLE|CTX_PAT|CTX_FOR ) ;
  }
  else 
    this.foundStatement = false;

  var nbody = null;
  var afterHead = null;

  if (head !== null && this.lttype === 'Identifier') {
    var kind = 'ForInStatement';
    switch ( this.ltval ) {
    case 'of':
       kind = 'ForOfStatement';
       this.ensureVarsAreNotResolvingToCatchParams();

    case 'in':
      if (headIsExpr) {
        if (head.type === 'AssignmentExpression') { // TODO: not in the spec
          // TODO: squash with the `else if (head.init)` below
        //if (this.tight || kind === 'ForOfStatement' || this.v < 7)
            this.err('for.in.has.init.assig');
        }
        this.adjustErrors()
        this.toAssig(head, CTX_FOR|CTX_PAT);
        this.currentExprIsAssig();
      }
      else if (head.declarations.length !== 1)
        this.err('for.decl.multi');
      else if (this.missingInit)
        this.missingInit = false;
      else if (head.declarations[0].init) {
        if (this.tight || kind === 'ForOfStatement' ||
            this.v < 7 || head.declarations[0].id.type !== 'Identifier' || head.kind !== 'var')
          this.err('for.in.has.decl.init');
      }

      this.next();
      afterHead = kind === 'ForOfStatement' ? 
        this.parseNonSeqExpr(PREC_WITH_NO_OP, CTX_NONE|CTX_PAT|CTX_NO_SIMPLE_ERR) :
        this.parseExpr(CTX_NONE|CTX_PAT|CTX_NO_SIMPLE_ERR);

      if (!this.expectType_soft(')'))
        this.err('for.iter.no.end.paren');

      this.scopeFlags &= CLEAR_IB;
      this.scopeFlags |= ( SCOPE_FLAG_BREAK|SCOPE_FLAG_CONTINUE );

      nbody = this.parseStatement(true);
      if (!nbody)
        this.err('null.stmt');

      this.scopeFlags = scopeFlags;
      this.foundStatement = true;
      this.exitScope();

      return {
        type: kind, loc: { start: startLoc, end: nbody.loc.end },
        start: startc, end: nbody.end,
        right: core(afterHead), left: head,
        body: nbody/* ,y:-1*/
      };

    default:
      this.err('for.iter.not.of.in');

    }
  }

  if (headIsExpr)
    this.currentExprIsSimple();
  else if (head && this.missingInit)
    this.err('for.decl.no.init');

  if (!this.expectType_soft (';'))
    this.err('for.simple.no.init.comma');

  afterHead = this.parseExpr(CTX_NULLABLE|CTX_PAT|CTX_NO_SIMPLE_ERR);
  if (!this.expectType_soft (';'))
    this.err('for.simple.no.test.comma');

  var tail = this.parseExpr(CTX_NULLABLE|CTX_PAT|CTX_NO_SIMPLE_ERR);
  if (!this.expectType_soft (')'))
    this.err('for.simple.no.end.paren');

  this.scopeFlags &= CLEAR_IB;
  this.scopeFlags |= ( SCOPE_FLAG_CONTINUE|SCOPE_FLAG_BREAK );

  nbody = this.parseStatement(true);
  if (!nbody)
    this.err('null.stmt');

  this.scopeFlags = scopeFlags;
  this.foundStatement = true;
  this.exitScope();

  return {
    type: 'ForStatement', init: head && core(head), 
    start : startc, end: nbody.end,
    test: afterHead && core(afterHead),
    loc: { start: startLoc, end: nbody.loc.end },
    update: tail && core(tail), body: nbody/* ,y:-1*/
  };
};

this.ensureVarsAreNotResolvingToCatchParams = function() {
  for (var name in this.scope.definedNames) {
    if (this.scope.definedNames[name] & DECL_MODE_CATCH_PARAMS)
      this.err('for.of.var.overrides.catch');
  }
};

},
function(){
this.parseArgs = function (argLen) {
  var tail = true, list = [], elem = null;

  if (!this.expectType_soft('('))
    this.err('func.args.no.opening.paren');

  var firstNonSimpArg = null;
  while (list.length !== argLen) {
    elem = this.parsePattern();
    if (elem) {
      if (this.lttype === 'op' && this.ltraw === '=') {
        elem = this.parseAssig(elem);
        this.makeComplex();
      }
      if (!firstNonSimpArg && elem.type !== 'Identifier')
        firstNonSimpArg =  elem;
      list.push(elem);
    }
    else {
      if (list.length !== 0) {
        if (this.v < 7)
          this.err('arg.non.tail.in.func');
      }
      break ;
    }

    if (this.lttype === ',' ) this.next();
    else { tail = false; break; }
  }
  if (argLen === ARGLEN_ANY) {
    if (tail && this.lttype === '...') {
      this.makeComplex();
      elem = this.parseRestElement();
      list.push( elem  );
      if ( !firstNonSimpArg )
        firstNonSimpArg = elem;
    }
  }
  else if (list.length !== argLen)
    this.err('func.args.not.enough');

  if (!this.expectType_soft (')'))
    this.err('func.args.no.end.paren');

  if (firstNonSimpArg)
    this.firstNonSimpArg = firstNonSimpArg;
 
  return list;
};

this.parseFuncBody = function(context) {
  var elem = null;
  
  if ( this.lttype !== '{' ) {
    elem = this.parseNonSeqExpr(PREC_WITH_NO_OP, context|CTX_NULLABLE|CTX_PAT);
    if ( elem === null )
      return this.err('func.body.is.empty.expr');
    return elem;
  }

  this.scopeFlags |= SCOPE_FLAG_IN_BLOCK;
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

this . makeStrict  = function() {
   if ( this.firstNonSimpArg )
     return this.err('func.strict.non.simple.param')  ; 

   if ( this.tight ) return;

   // TODO: squash them into one
   this.tight = true;
   this.scope.strict = true;

   var a = null, argNames = this.scope.definedNames;
   for (a in argNames) {
     var declType = argNames[a];
     a = a.substring(0,a.length-1);
     if (declType&DECL_DUPE)
       this.err('func.args.has.dup');

     ASSERT.call(this, !arguments_or_eval(a));
     this.validateID(a);
   }
};


},
function(){
this.parseFunc = function(context, flags) {
  var prevLabels = this.labels,
      prevStrict = this.tight,
      prevScopeFlags = this.scopeFlags,
      prevDeclMode = this.declMode,
      prevNonSimpArg = this.firstNonSimpArg;

  var isStmt = false, startc = this.c0, startLoc = this.locBegin();
  if (this.canBeStatement) {
    isStmt = true;
    this.canBeStatement = false;
  }

  var isGen = false,
      isWhole = !(flags & MEM_CLASS_OR_OBJ);
   
  var argLen = !(flags & MEM_ACCESSOR) ? ARGLEN_ANY :
    (flags & MEM_SET) ? ARGLEN_SET : ARGLEN_GET;

  // current func name
  var cfn = null;

  if (isWhole) { 
    this.next();
    if (this.lttype === 'op' && this.ltraw === '*') {
      isGen = true;
      this.next();
    }

    if (isStmt) {
      if (!this.canDeclareFunctionsInScope(isGen))
        this.err('func.decl.not.allowed');
      if (this.unsatisfiedLabel) {
        if (!this.canLabelFunctionsInScope(isGen))
          this.err('func.decl.not.alowed');
        this.fixupLabels(false);
      }
      if (this.lttype === 'Identifier') {
        this.declMode = DECL_MODE_FUNC_STMT;
        cfn = this.parsePattern();
      }
      else if (!(context & CTX_DEFAULT))
        this.err('missing.name');
    }
    else {
      // FunctionExpression's BindingIdentifier can be yield regardless of context;
      // but a GeneratorExpression's BindingIdentifier can't be 'yield'
      this.scopeFlags = isGen ?
        SCOPE_FLAG_ALLOW_YIELD_EXPR :
        SCOPE_FLAG_NONE;
      if (this.lttype === 'Identifier') {
        this.enterLexicalScope(false);
        this.scope.synth = true;
        this.declMode = DECL_MODE_FUNC_EXPR;
        cfn = this.parsePattern();
      }
    }
  }
  else if (flags & MEM_GEN)
    isGen = true;

  this.enterFuncScope(isStmt); 
  this.declMode = DECL_MODE_FUNC_PARAMS;

  this.scopeFlags = SCOPE_FLAG_NONE;

  if (isGen)
    this.scopeFlags |= SCOPE_FLAG_ALLOW_YIELD_EXPR;

  if (flags & MEM_SUPER)
    this.scopeFlags |= (flags & (MEM_SUPER|MEM_CONSTRUCTOR));

  // TODO: super is allowed in methods of a class regardless of whether the class
  // has an actual heritage clause; but this could probably be implemented better
  else if (!isWhole && !(flags & MEM_CONSTRUCTOR))
    this.scopeFlags |= SCOPE_FLAG_ALLOW_SUPER;
 
  if (flags & MEM_ASYNC) {
    if (isGen)
      this.err('async.gen.not.yet.supported');
    this.scopeFlags |= SCOPE_FLAG_ALLOW_AWAIT_EXPR;
  }

  // class members, along with obj-methods, have strict formal parameter lists,
  // which is a rather misleading name for a parameter list in which dupes are not allowed
  if (!this.tight && !isWhole)
    this.enterComplex();

  this.firstNonSimpArg = null;

  this.scopeFlags |= SCOPE_FLAG_ARG_LIST;
  var argList = this.parseArgs(argLen);
  this.scopeFlags &= ~SCOPE_FLAG_ARG_LIST;

  this.scopeFlags |= SCOPE_FLAG_FN;  

  this.labels = {};

  var nbody = this.parseFuncBody(context & CTX_FOR);

  var n = {
    type: isStmt ? 'FunctionDeclaration' : 'FunctionExpression', id: cfn,
    start: startc, end: nbody.end, generator: isGen,
    body: nbody, loc: { start: startLoc, end: nbody.loc.end },
    expression: nbody.type !== 'BlockStatement', params: argList,

    // TODO: this should go in parseAsync
    async: (flags & MEM_ASYNC) !== 0
  };

  if (isStmt)
    this.foundStatement = true;

  this.labels = prevLabels;
  this.tight = prevStrict;
  this.scopeFlags = prevScopeFlags;
  this.declMode = prevDeclMode;
  this.firstNonSimpArg = prevNonSimpArg;
  
  this.exitScope();
  return n;
};
  
this.parseMeth = function(name, flags) {
  if (this.lttype !== '(')
    this.err('meth.paren');
  var val = null;
  if (flags & MEM_CLASS) {
    // all modifiers come at the beginning
    if (flags & MEM_STATIC) {
      if (flags & MEM_PROTOTYPE)
        this.err('class.prototype.is.static.mem');

      flags &= ~(MEM_CONSTRUCTOR|MEM_SUPER);
    }

    if (flags & MEM_CONSTRUCTOR) {
      if (flags & MEM_SPECIAL)
        this.err('class.constructor.is.special.mem');
      if (flags & MEM_HAS_CONSTRUCTOR)
        this.err('class.constructor.is.a.dup');
    }

    val = this.parseFunc(CTX_NONE, flags);

    return {
      type: 'MethodDefinition', key: core(name),
      start: name.start, end: val.end,
      kind: (flags & MEM_CONSTRUCTOR) ? 'constructor' : (flags & MEM_GET) ? 'get' :
            (flags & MEM_SET) ? 'set' : 'method',
      computed: name.type === PAREN,
      loc: { start: name.loc.start, end: val.loc.end },
      value: val, 'static': !!(flags & MEM_STATIC)/* ,y:-1*/
    }
  }
   
  val = this.parseFunc(CTX_NONE, flags);

  return {
    type: 'Property', key: core(name),
    start: name.start, end: val.end,
    kind:
     !(flags & MEM_ACCESSOR) ? 'init' :
      (flags & MEM_SET) ? 'set' : 'get',
    computed: name.type === PAREN,
    loc: { start: name.loc.start, end : val.loc.end },
    method: (flags & MEM_ACCESSOR) === 0, shorthand: false,
    value : val/* ,y:-1*/
  }
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
    case 'do': return this.parseDoWhileStatement();
    case 'if': return this.parseIfStatement();
    case 'in':
       if ( context & CTX_FOR )
         return null;
 
       this.notId() ;
    default: pendingExprHead = this.id(); break SWITCH ;
    }

  case 3:
    switch (id) {
    case 'new':
      if ( this.canBeStatement ) {
        this.canBeStatement = false ;
        this.pendingExprHead = this.parseNewHead();
        return null;
      }
      return this.parseNewHead();

    case 'for': return this.parseFor();
    case 'try': return this.parseTryStatement();
    case 'let':
      if ( this.canBeStatement && this.v >= 5 )
        return this.parseLet(CTX_NONE);

      if (this.tight ) this.err('strict.let.is.id');

      pendingExprHead = this.id();
      break SWITCH;

    case 'var': return this.parseVariableDeclaration( context & CTX_FOR );
    case 'int':
      if ( this.v <= 5 )
        this.errorReservedID();

    default: pendingExprHead = this.id(); break SWITCH  ;
    }

  case 4:
    switch (id) {
    case 'null':
      pendingExprHead = this.parseNull();
      break SWITCH;
    case 'void':
      if ( this.canBeStatement )
         this.canBeStatement = false;
      this.lttype = 'u'; 
      this.isVDT = VDT_VOID;
      return null;
    case 'this':
      pendingExprHead = this. parseThis();
      break SWITCH;
    case 'true':
      pendingExprHead = this.parseTrue();
      break SWITCH;
    case 'case':
      if ( this.canBeStatement ) {
        this.foundStatement = true;
        this.canBeStatement = false ;
        return null;
      }

    case 'else':
      this.notId();
    case 'with':
      return this.parseWithStatement();
    case 'enum': case 'byte': case 'char':
    case 'goto': case 'long':
      if ( this. v <= 5 ) this.errorReservedID();

    default: pendingExprHead = this.id(); break SWITCH  ;
  }

  case 5:
    switch (id) {
    case 'super': pendingExprHead = this.parseSuper(); break SWITCH;
    case 'break': return this.parseBreakStatement();
    case 'catch': this.notId ()  ;
    case 'class': return this.parseClass(CTX_NONE ) ;
    case 'const':
      if (this.v<5) this.err('const.not.in.v5') ;
      return this.parseVariableDeclaration(CTX_NONE);

    case 'throw': return this.parseThrowStatement();
    case 'while': return this.parseWhileStatement();
    case 'yield': 
      if ( this.scopeFlags & SCOPE_FLAG_GEN ) {
        if (this.scopeFlags & SCOPE_FLAG_ARG_LIST)
          this.err('yield.args');

        if ( this.canBeStatement )
          this.canBeStatement = false;

        this.lttype = 'yield';
        return null;
      }
      else if (this.tight) this.errorReservedID(null);

      pendingExprHead = this.id();
      break SWITCH;
          
    case 'false':
      pendingExprHead = this.parseFalse();
      break SWITCH;

    case 'await':
      if (this.scopeFlags & SCOPE_FLAG_ALLOW_AWAIT_EXPR) {
        if (this.scopeFlags & SCOPE_FLAG_ARG_LIST)
          this.err('await.args');
        if (this.canBeStatement)
          this.canBeStatement = false;
        this.isVDT = VDT_AWAIT;
        this.lttype = 'u';
        return null;
      }
      if (this.tight)
        this.err('await.in.strict');

      pendingExprHead = this.id();
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
      if ( this.tight || this.v <= 5 )
        this.error();

    case 'delete':
    case 'typeof':
      if ( this.canBeStatement )
        this.canBeStatement = false ;
      this.lttype = 'u'; 
      this.isVDT = id === 'delete' ? VDT_DELETE : VDT_VOID;
      return null;

    case 'export': 
      if ( this.isScript && this.err('export.not.in.module') )
        return this.errorHandlerOutput;

      return this.parseExport() ;

    case 'import':
      if ( this.isScript && this.err('import.not.in.module') )
        return this.errorHandlerOutput;

      return this.parseImport();

    case 'return': return this.parseReturnStatement();
    case 'switch': return this.parseSwitchStatement();
    case 'public':
      if (this.tight) this.errorReservedID();
    case 'double': case 'native': case 'throws':
      if ( this. v <= 5 ) this.errorReservedID();

    default: pendingExprHead = this.id(); break SWITCH ;
    }

  case 7:
    switch (id) {
    case 'default':
      if ( this.canBeStatement ) this.canBeStatement = false ;
      return null;

    case 'extends': case 'finally':
      this.notId() ;

    case 'package': case 'private':
      if ( this. tight  )
        this.errorReservedID();

    case 'boolean':
      if (this.v <= 5)
        this.errorReservedID();

    default: pendingExprHead = this.id(); break SWITCH  ;
    }

  case 8:
    switch (id) {
    case 'function': return this.parseFunc(context&CTX_FOR, 0 );
    case 'debugger': return this.prseDbg();
    case 'continue': return this.parseContinueStatement();
    case 'abstract': case 'volatile':
      if ( this. v <= 5 ) this.errorReservedID();

    default: pendingExprHead = this.id(); break SWITCH  ;
    }

  case 9:
    switch (id ) {
    case 'interface': case 'protected':
      if (this.tight) this.errorReservedID() ;

    case 'transient':
      if (this.v <= 5) this.errorReservedID();

    default: pendingExprHead = this.id(); break SWITCH  ;
    }

  case 10:
    switch ( id ) {
    case 'instanceof':
       this.notId();
    case 'implements':
      if ( this.v <= 5 || this.tight )
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
 

},
function(){
this.readAnIdentifierToken = function (v) {
   var c = this.c, src = this.src, len = src.length, peek;
   c++; // start reading the body

   var byte2, startSlice = c; // the head is already supplied in v

   while ( c < len ) {
      peek = src.charCodeAt(c); 
      if ( isIDBody(peek) ) {
         c++;
         continue;
      }

      if ( peek === CH_BACK_SLASH ) {
         if ( !v ) // if all previous characters have been non-u characters 
            v = src.charAt (startSlice-1); // v = IDHead

         if ( startSlice < c ) // if there are any non-u characters behind the current '\'
            v += src.slice(startSlice,c) ; // v = v + those characters

         this.c = ++c;
         if (CH_u !== src.charCodeAt(c) &&
             this.err('id.slash.no.u') )
           return this.errorHandlerOutput ;

         peek = this. peekUSeq() ;
         if (peek >= 0x0D800 && peek <= 0x0DBFF ) {
           this.c++;
           byte2 = this.peekTheSecondByte();
           if (!isIDBody(((peek-0x0D800)<<10) + (byte2-0x0DC00) + 0x010000) &&
                this.err('id.multi.must.be.idbody') )
             return this.errorHandlerOutput ;

           v += String.fromCharCode(peek, byte2);
         }
         else {
            if ( !isIDBody(peek) &&
                  this.err('id.esc.must.be.idbody') )
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

this.parseLet = function(context) {

// this function is only calld when we have a 'let' at the start of a statement,
// or else when we have a 'let' at the start of a for's init; so, CTX_FOR means "at the start of a for's init ",
// not 'in for'
 
  if ( !(this.scopeFlags & SCOPE_FLAG_IN_BLOCK) )
    this.err('lexical.decl.not.in.block');

  var startc = this.c0, startLoc = this.locBegin();
  var c = this.c, li = this.li, col = this.col;

  var letDecl = this.parseVariableDeclaration(context);

  if ( letDecl )
    return letDecl;

  if (this.tight && this.err('strict.let.is.id') )
    return this.errorHandlerOutput ;

  this.canBeStatement = false;
  this.pendingExprHead = {
     type: 'Identifier',
     name: 'let',
     start: startc,
     end: c,
     loc: { start: startLoc, end: { line: li, column: col } }
  };

  return null ;
};



},
function(){
this.loc = function() { return { line: this.li, column: this.col }; };
this.locBegin = function() { return  { line: this.li0, column: this.col0 }; };
this.locOn = function(l) { return { line: this.li, column: this.col - l }; };



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

this.parseMem = function(context, flags) {
  var c0 = 0, li0 = 0, col0 = 0, nmod = 0,
      nli0 = 0, nc0 = 0, ncol0 = 0, nraw = "", nval = "", latestFlag = 0;

  var asyncNewLine = false;
  if (this.lttype === 'Identifier') {
    LOOP:  
    // TODO: check version number when parsing get/set
    do {
      if (nmod === 0) {
        c0 = this.c0; li0 = this.li; col0 = this.col0;
      }
      switch (this.ltval) {
      case 'static':
        if (!(flags & MEM_CLASS)) break LOOP;
        if (flags & MEM_STATIC) break LOOP;
        if (flags & MEM_ASYNC) break LOOP;

        nc0 = this.c0; nli0 = this.li0;
        ncol0 = this.col0; nraw = this.ltraw;
        nval = this.ltval;

        flags |= latestFlag = MEM_STATIC;
        nmod++;
        this.next();
        break;

      case 'get':
      case 'set':
        if (flags & MEM_ACCESSOR) break LOOP;
        if (flags & MEM_ASYNC) break LOOP;

        nc0 = this.c0; nli0 = this.li0;
        ncol0 = this.col0; nraw = this.ltraw;
        nval = this.ltval;
        
        flags |= latestFlag = this.ltval === 'get' ? MEM_GET : MEM_SET;
        nmod++;
        this.next();
        break;

      case 'async':
        if (flags & MEM_ACCESSOR) break LOOP;
        if (flags & MEM_ASYNC) break LOOP;

        nc0 = this.c0; nli0 = this.li0;
        ncol0 = this.col0; nraw = this.ltraw;
        nval = this.ltval;

        flags |= latestFlag = MEM_ASYNC;
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
    if (!c0) { c0 = this.c-1; li0 = this.li; col0 = this.col-1; }

    flags |= latestFlag = MEM_GEN;
    nmod++;
    this.next();
  }

  var nmem = null;
  switch (this.lttype) {
  case 'Identifier':
    if (asyncNewLine)
      this.err('async.newline');

    if ((flags & MEM_CLASS)) {
      if (this.ltval === 'constructor') flags |= MEM_CONSTRUCTOR;
      if (this.ltval === 'prototype') flags |= MEM_PROTOTYPE;
    }
    else if (this.ltval === '__proto__')
      flags |= MEM_PROTO;

    nmem = this.memberID();
    break;
  case 'Literal':
    if (asyncNewLine)
      this.err('async.newline');

    if ((flags & MEM_CLASS)) {
      if (this.ltval === 'constructor') flags |= MEM_CONSTRUCTOR;
      if (this.ltval === 'prototype') flags |= MEM_PROTOTYPE;
    }
    else if (this.ltval === '__proto__')
      flags |= MEM_PROTO;

    nmem = this.numstr();
    break;
  case '[':
    if (asyncNewLine)
      this.err('async.newline');

    nmem = this.memberExpr();
    break;
  default:
    if (nmod && latestFlag !== MEM_GEN) {
      nmem = assembleID(nc0, nli0, ncol0, nraw, nval);
      flags &= ~latestFlag; // it's found out to be a name, not a modifier
      nmod--;
    }
  }

  if (nmem === null) {
    if (flags & MEM_GEN)
      this.err('mem.gen.has.no.name');
    return null;
  } 

  if (this.lttype === '(') {

    var mem = this.parseMeth(nmem, flags);
    if (c0 && c0 !== mem.start) {
      mem.start = c0;
      mem.loc.start = { line: li0, column: col0 };
    }
    return mem;
  }

  if (flags & MEM_CLASS)
    this.err('unexpected.lookahead');

  if (nmod)
    this.err('unexpected.lookahead');

  // TODO: it is not strictly needed -- this.parseObjElem itself can verify if the name passed to it is
  // a in fact a non-computed value equal to '__proto__'; but with the approach below, things might get tad
  // faster
  if (flags & MEM_PROTO)
    context |= CTX_HASPROTO;

  return this.parseObjElem(nmem, context|(flags & MEM_PROTO));
};
 
this.parseObjElem = function(name, context) {
  var hasProto = context & CTX_HASPROTO, firstProto = this.first__proto__;
  var val = null;
  context &= ~CTX_HASPROTO;

  switch (this.lttype) {
  case ':':
    if (hasProto && firstProto)
      this.err('obj.proto.has.dup');

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
           this.at === ERR_NONE_YET) {
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
      method: false, shorthand: false, value: core(val)/* ,y:-1*/
    };

    if (hasProto)
      this.first__proto__ = val;

    return val;
 
  case 'op':
    if (name.type !== 'Identifier')
      this.err('obj.prop.assig.not.id');
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
    if (name.type !== 'Identifier')
      this.err('obj.prop.assig.not.id');
    this.validateID(name.name);
    val = name;
    break;
  }
  
  return {
    type: 'Property', key: name,
    start: val.start, end: val.end,
    loc: val.loc, kind: 'init',
    shorthand: true, method: false,
    value: val, computed: false/* ,y:-1*/
  };
};



},
function(){
this .memberID = function() { return this.v > 5 ? this.id() : this.validateID("") ; };
this .memberExpr = function() {
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
      list.push(elem && core(elem));
      this.next();
    }
    else {
      if (elem) {
        list.push(core(elem));
        hasMore = false;
      }
      else break;
    }
 
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
          pt = this.pt; pe = this.pe; po = core(elem);
          elemContext |= CTX_HAS_A_PARAM_ERR;
        }
      }

      // (a) = 12
      if (t === ERR_PAREN_UNBINDABLE && this.ensureSimpAssig_soft(elem.expr))
        t = ERR_NONE_YET;

      if ((elemContext & CTX_PAT) &&
         !(elemContext & CTX_HAS_AN_ASSIG_ERR)) {
        if (this.at === ERR_NONE_YET && t !== ERR_NONE_YET) {
          this.at = t; this.ae = elemCore;
        }
        if (this.at !== ERR_NONE_YET) {
          at = this.at; ae = this.ae; ao = core(elem);
          elemContext |= CTX_HAS_AN_ASSIG_ERR;
        }
      }
      if (!(elemContext & CTX_HAS_A_SIMPLE_ERR)) {
        if (this.st !== ERR_NONE_YET) {
          st = this.st; se = this.se; so = core(elem);
          elemContext |= CTX_HAS_A_SIMPLE_ERR;
        }
      }
    }

    hasRest = hasNonTailRest = false;
  }

  
  if ((context & CTX_PARAM) && pt !== ERR_NONE_YET) {
    this.pt = pt; this.pe = pe; this.po = po; 
  }
  if ((context & CTX_PAT) && at !== ERR_NONE_YET) {
    this.at = at; this.ae = ae; this.ao = ao;
  }
  if ((context & CTX_PARPAT) && st !== ERR_NONE_YET) {
    this.st = st; this.se = se; this.so = so;
  }

  var n = {
    type: 'ArrayExpression',
    loc: { start: startLoc, end: this.loc() },
    start: startc,
    end: this.c,
    elements : list /* ,y:-1*/
  };

  if (!this.expectType_soft(']'))
    this.err('array.unfinished');
  
  return n;
};

},
function(){
this.toAssig = function(head, context) {
  if (head === this.ao)
    this.throwTricky('a', this.at, this.ae)

  var i = 0, list = null;
  switch (head.type) {
  case 'Identifier':
    if (this.tight && arguments_or_eval(head.name)) {
      if (this.st === ERR_ARGUMENTS_OR_EVAL_DEFAULT)
        this.st = ERR_NONE_YET;
      if (this.st === ERR_NONE_YET) {
        this.st = ERR_ARGUMENTS_OR_EVAL_ASSIGNED;
        this.se = head;
      }
      if (context & CTX_NO_SIMPLE_ERR)
        this.currentExprIsSimple();
    }
    return;

  case 'MemberExpression':
    return;

  case 'ObjectExpression':
    i = 0; list = head.properties;
    while (i < list.length)
      this.toAssig(list[i++], context);
    head.type = 'ObjectPattern';
    return;

  case 'ArrayExpression':
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
      this.err('rest.arg.not.valid');
    this.toAssig(head.argument, context);
    head.type = 'RestElement';
    return;

  case 'Property':
    this.toAssig(head.value, context);
    return;

  default:
    this.err('not.assignable');
 
  }
};

this.parseAssignment = function(head, context) {
  var o = this.ltraw;
  if (o === '=>')
    return this.parseArrowFunctionExpression(head);

  if (head.type === PAREN_NODE && !this.ensureSimpAssig_soft(head.expr)) {
    this.at = ERR_PAREN_UNBINDABLE;
    this.ae = this.ao = head;
    this.throwTricky('a', this.at, this.ae);
  }

  var right = null;
  if (o === '=') {
    if (context & CTX_PARPAT)
      this.adjustErrors();

    var st = ERR_NONE_YET, se = null, so = null,
        pt = ERR_NONE_YET, pe = null, po = null;

    this.toAssig(core(head), context);
    // TODO: crazy to say, but what about _not_ parsing assignments that are
    // potpat elements, having the container (array or object) take over the parse
    // for assignments.
    // example:
    // [ a = b, e = l] = 12:
    //   elem = nextElem() -> a
    //   if this.lttype == '=': this.toAssig(elem)
    //   <update tricky>
    //   if '=': elem = parsePatAssig(elem) -> a = b
    //   elem = nextElem() -> e
    //   if this.lttype == '=': this.toAssig(elem)
    //   <update tricky>
    //   if '=':  elem = parsePatAssig(elem) -> e = l
    // 
    // the approach above might be a fit replacement for the approach below
    if ((context & CTX_PARAM) && this.pt !== ERR_NONE_YET) {
      pt = this.pt; pe = this.pe; po = this.po; 
    }
    if ((context & CTX_PARPAT) && this.st !== ERR_NONE_YET) {
      st = this.st; se = this.se; so = this.so;
    }

    this.currentExprIsAssig();
    this.next();
    right = this.parseNonSeqExpr(PREC_WITH_NO_OP,
      (context & CTX_FOR)|CTX_PAT|CTX_NO_SIMPLE_ERR);

    if (pt !== ERR_NONE_YET) {
      this.pt = pt; this.pe = pe; this.po = po;
    }
    if (st !== ERR_NONE_YET) {
      this.st = st; this.se = se; this.so = so;
    }
  }
  else {
    // TODO: further scrutiny, like checking for this.at, is necessary (?)
    if (!this.ensureSimpAssig_soft(head))
      this.err('assig.not.simple');

    this.next();
    right = this.parseNonSeqExpr(PREC_WITH_NO_OP,
      (context & CTX_FOR)|CTX_PAT|CTX_NO_SIMPLE_ERR);
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
    }/* ,y:-1*/
  };
};

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
  
  do {
    this.next();
    this.first__proto__ = first__proto__;
    elem = this.parseMem(elemContext, MEM_OBJ);

    if (elem === null)
      break;

    if (!first__proto__ && this.first__proto__)
      first__proto__ = this.first__proto__;

    list.push(core(elem));
    if (!(context & CTX_PARPAT))
      continue;

    if ((context & CTX_PARAM) &&
       !(context & CTX_HAS_A_PARAM_ERR) &&
       this.pt !== ERR_NONE_YET) {
      pt = this.pt; pe = this.pe; po = elem;
    }
    if ((context & CTX_PAT) &&
       !(context & CTX_HAS_AN_ASSIG_ERR) &&
       this.at !== ERR_NONE_YET) {
      at = this.at; ae = this.ae; ao = elem;
    }
    if (!(context & CTX_HAS_A_SIMPLE_ERR) &&
       this.st !== ERR_NONE_YET) {
      st = this.st; se = this.se; so = elem;
    }
  } while (this.lttype === ',');

  if (context & CTX_PARPAT) {
    if ((context & CTX_PARAM) && pt !== ERR_NONE_YET) {
      this.pt = pt; this.pe = pe; this.po = po;
    }
    if ((context & CTX_PAT) && at !== ERR_NONE_YET) {
      this.at = at; this.ae = ae; this.ao = ao;
    }
    if (st !== ERR_NONE_YET) {
      this.st = st; this.se = se; this.so = so;
    }
  }

  n = {
    properties: list,
    type: 'ObjectExpression',
    start: startc,
    end: this.c,
    loc: { start: startLoc, end: this.loc() }/* ,y:-1*/
  };

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
      list = null;
  
  var prevys = this.suspys,
      hasRest = false,
      st = ERR_NONE_YET, se = null, so = null,
      pt = ERR_NONE_YET, pe = null, po = null; 

  if (context & CTX_PAT) {
    this.pt = this.st = ERR_NONE_YET;
    this.pe = this.po =
    this.se = this.so = null;
    this.suspys = null;
    elemContext |= CTX_PARAM;
  }
  else
    context |= CTX_NO_SIMPLE_ERR;

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
          this.err('unexpected.lookahead');
        else 
          hasTailElem = true;
      } 
      else break;
    }

    if (elemContext & CTX_PARAM) {
      // TODO: could be `pt === ERR_NONE_YET`
      if (!(elemContext & CTX_HAS_A_PARAM_ERR)) {
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
          pt = this.pt; pe = this.pe; po = core(elem);
          elemContext |= CTX_HAS_A_PARAM_ERR;
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
          st = this.st; se = this.se; so = elem && core(elem);
          elemContext |= CTX_HAS_A_SIMPLE_ERR;
        }
      }
    }

    if (hasTailElem)
      break;

    if (list) list.push(core(elem));
    if (this.lttype === ',') {
      if (hasRest)
        this.err('unexpected.lookahead');
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
    this.err('unfinished.paren');

  if (context & CTX_PAT) {
    if (elem === null && list === null) {
      st = ERR_EMPTY_LIST_MISSING_ARROW;
      se = so = n;
    }
    if (pt !== ERR_NONE_YET) {
      this.pt = pt; this.pe = pe; this.po = po;
    }
    if (st !== ERR_NONE_YET) {
      this.st = st; this.se = se; this.so = so;
    }
    if (list === null && elem !== null &&
       elem.type === 'Identifier' && elem.name === 'async')
      this.parenAsync = n;
  }

  if (prevys !== null)
    this.suspys = prevys;

  return n;
};


},
function(){
this.parseSpreadElement = function(context) {
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
this.parseNewHead = function () {
  var startc = this.c0, end = this.c, startLoc = this.locBegin(), li = this.li, col = this.col, raw = this.ltraw ;
  this.next () ;
  if ( this.lttype === '.' ) {
     this.next();
     return this.parseMeta(startc ,end,startLoc,{line:li,column:col},raw );
  }

  var head, elem, inner;
  switch (this  .lttype) {
    case 'Identifier':
       head = this.parseIdStatementOrId (CTX_NONE);
       break;

    case '[':
       head = this. parseArrayExpression(CONTEXT_UNASSIGNABLE_CONTAINER);
       break ;

    case '(':
       head = this. parseParen() ;
       break ;

    case '{':
       head = this. parseObjectExpression(CONTEXT_UNASSIGNABLE_CONTAINER) ;
       break ;

    case '/':
       head = this. parseRegExpLiteral () ;
       break ;

    case '`':
       head = this. parseTemplateLiteral () ;
       break ;

    case 'Literal':
       head = this.numstr ();
       break ;

    default:
       this.err('new.head.is.not.valid');
  }


  var inner = core( head ) ;
  while ( true ) {
    switch (this. lttype) {
       case '.':
          this.next();
          if (this.lttype !== 'Identifier')
            this.err('mem.name.not.id');

          elem = this.memberID();
          head =   {  type: 'MemberExpression', property: elem, start: head.start, end: elem.end,
                      loc: { start: head.loc.start, end: elem.loc.end }, object: inner, computed: false/* ,y:-1*/ };
          inner = head;
          continue;

       case '[':
          this.next() ;
          elem = this.parseExpr(CTX_NONE) ;
          head =  { type: 'MemberExpression', property: core(elem), start: head.start, end: this.c,
                    loc: { start : head.loc.start, end: this.loc() }, object: inner, computed: true/* ,y:-1*/ };
          inner = head ;
          if ( !this.expectType_soft (']') ) {
            this.err('mem.unfinished')  ;
          }
 
          continue;

       case '(':
          elem = this. parseArgList();
          inner = { type: 'NewExpression', callee: inner, start: startc, end: this.c,
                    loc: { start: startLoc, end: this.loc() }, arguments: elem /* ,y:-1*/};
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
                tag : inner /* ,y:-1*/
            };
            inner = head;
            continue ;

        default: return { type: 'NewExpression', callee: inner, start: startc, end: head.end,
                 loc: { start: startLoc, end: head.loc.end }, arguments : [] /* ,y:-1*/};

     }
  }
};


},
function(){
this.next = function () {
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
              if ( mustBeAnID === 1 ) return this.err('id.esc.must.be.idhead');
              else return this.err('id.multi.must.be.idhead');
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
                     c ++ ;
                     this.c=c;
                     this.readLineComment () ;
                     if ( noNewLine ) noNewLine = false ;
                     start = c = this.c ;
                     continue ;

                 case CH_MUL:
                   c +=  2 ;
                   this.col += (c-start ) ;
                   this.c = c ;
                   noNewLine = this. readMultiComment () && noNewLine ;
                   start = c = this.c ;
                   continue ;

                 default:
                     c++ ;
                     this.nl = ! noNewLine ;
                     this.col += (c-start ) ;
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
            if ( this.isScript &&
                 l.charCodeAt(c+1) === CH_EXCLAMATION &&
                 l.charCodeAt(c+2) === CH_MIN &&
                 l.charCodeAt(c+ 1 + 2) === CH_MIN ) {
               this.c = c + 4;
               this.readLineComment();
               c = this.c;
               continue;
            }
            this.col += (c-start ) ;
            this.c=c;
            this.nl = !noNewLine ;
            return ;
 
         case CH_MIN:
            if ( (!noNewLine || startOffset === 0) &&
                 this.isScript &&
                 l.charCodeAt(c+1) === CH_MIN && l.charCodeAt(c+2) === CH_GREATER_THAN ) {
               this.c = c + 1 + 2;
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
  if (!(this.lttype === 'Identifier' && this.ltval === n)) 
    this.err('unexpected.id');
  this.next();
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


},
function(){
this.parseExpr = function (context) {
  var head = this.parseNonSeqExpr(PREC_WITH_NO_OP, context);
  var lastExpr = null;

  if ( this.lttype !== ',' )
    return head;

  // TODO: abide to the original context by using `context = context|(CTX_FOR|CTX_PARPAT)` rather than the
  // assignment below
  context = (context & CTX_FOR)|CTX_PARPAT;

  var e = [core(head)];
  do {
    this.next() ;
    lastExpr = this.parseNonSeqExpr(PREC_WITH_NO_OP, context);
    e.push(core(lastExpr));
  } while (this.lttype === ',' );

  return {
    type: 'SequenceExpression', expressions: e,
    start: head.start, end: lastExpr.end,
    loc: { start : head.loc.start, end : lastExpr.loc.end}/* ,y:-1*/
  };
};

this.parseCond = function(cond, context) {
  this.next();
  var seq =
    this.parseNonSeqExpr(PREC_WITH_NO_OP, CTX_NONE);

  if (!this.expectType_soft(':'))
    this.err('cond.colon');

  var alt =
    this.parseNonSeqExpr(PREC_WITH_NO_OP, context & CTX_FOR);

  return {
    type: 'ConditionalExpression', test: core(cond),
    start: cond.start, end: alt.end,
    loc: {
      start: cond.loc.start,
      end: alt.loc.end
    }, consequent: core(seq),
    alternate: core(alt) /* ,y:-1*/
  };
};

this.parseUnaryExpression = function(context) {
  var u = null,
      startLoc = null,  
      startc = 0,
      isVDT = this.isVDT;

  if (isVDT) {
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

  if (this.tight &&
      isVDT === VDT_DELETE &&
      core(arg).type !== 'MemberExpression')
    this.err('delete.arg.not.a.mem');

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

this.parseUpdateExpression = function(arg, context) {
  var c = 0, loc = null, u = this.ltraw;
  if (arg === null) {
    c = this.c-2;
    loc = this.locOn(2);
    this.next() ;
    arg = this.parseExprHead(context & CTX_FOR);

    if (!this.ensureSimpAssig_soft(core(arg)))
      this.err('incdec.pre.not.simple.assig');

    return {
      type: 'UpdateExpression', operator: u,
      start: c, end: arg.end, argument: core(arg),
      loc: { start: loc, end: arg.loc.end },
      prefix: true
    };
  }

  if (!this.ensureSimpAssig_soft(core(arg)))
    this.err('incdec.post.not.simple.assig');

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
    case 'instanceof':
      this.prec = PREC_COMP  ;
      this.ltraw = this.ltval ;
      return true;

    case 'of':
    case 'in':
      if ( context & CTX_FOR ) break ;
      this.prec = PREC_COMP ;
      this.ltraw = this.ltval;
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
     (context & CTX_NO_SIMPLE_ERR))
      this.currentExprIsSimple();
  
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
      right: core(right)/* ,y:-1*/
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
         if (c >= len && this.err('num.with.no.digits') )
           return this.errorHandlerOutput;
         b = src.charCodeAt(c);
         if ( ! isHex(b) && this.err('num.with.first.not.valid')  )
           return this.errorHandlerOutput ;
         c++;
         while ( c < len && isHex( b = src.charCodeAt(c) ) )
             c++ ;
         this.ltval = parseInt( this.ltraw = src.slice(this.c,c) ) ;
         this.c = c;
         break;

      case CH_B: case CH_b:
        ++c;
        if (c >= len && this.err('num.with.no.digits') )
          return this.errorHandlerOutput ;
        b = src.charCodeAt(c);
        if ( b !== CH_0 && b !== CH_1 && this.err('num.with.first.not.valid') )
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
        ++c;
        if (c >= len && this.err('num.with.no.digits') )
          return this.errorHandlerOutput ; 
        b = src.charCodeAt(c);
        if ( (b < CH_0 || b >= CH_8) && this.err('num.with.first.not.valid')  )
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
          if ( this.tight ) this.err('num.legacy.oct');
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

this.parsePattern = function() {
  switch ( this.lttype ) {
    case 'Identifier' :
       var id = this.validateID("");
       this.declare(id);
       if (this.tight && arguments_or_eval(id.name))
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

this. parseArrayPattern = function() {
  var startc = this.c - 1,
      startLoc = this.locOn(1),
      elem = null,
      list = [];

  this.enterComplex();

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
           start: startc, end: this.c, elements : list/* ,y:-1*/};

  if ( !this. expectType_soft ( ']' ) &&
        this.err('pat.array.is.unfinished') )
    return this.errorHandlerOutput ;

  return elem;
};

this.parseObjectPattern  = function() {

    var sh = false;
    var startc = this.c-1;
    var startLoc = this.locOn(1);
    var list = [];
    var val = null;
    var name = null;

    this.enterComplex();
    
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
               method: false, shorthand: sh/* ,y:-1*/ });

    } while ( this.lttype === ',' );

    var n = { type: 'ObjectPattern',
             loc: { start: startLoc, end: this.loc() },
             start: startc,
              end: this.c,
              properties: list/* ,y:-1*/ };

    if ( ! this.expectType_soft ('}') && this.err('pat.obj.is.unfinished') )
      return this.errorHandlerOutput ;

    return n;
};

this .parseAssig = function (head) {
    this.next() ;
    var e = this.parseNonSeqExpr( PREC_WITH_NO_OP, CTX_NONE );
    return { type: 'AssignmentPattern', start: head.start, left: head, end: e.end,
           right: core(e), loc: { start: head.loc.start, end: e.loc.end } /* ,y:-1*/};
};

// TODO: needs reconsideration,
this.parseRestElement = function() {
   var startc = this.c0,
       startLoc = this.locBegin();

   this.next ();
   var e = this.parsePattern();

   if (!e) {
      if (this.err('rest.has.no.arg'))
       return this.errorHandlerOutput ;
   }
   // TODO (cont.): this one in particular -- it need not parse a whole pattern to know
   // whether it is an identifier
   else if ( this.v < 7 && e.type !== 'Identifier' ) {
      this.err('rest.arg.not.id');
   }

   return { type: 'RestElement', loc: { start: startLoc, end: e.loc.end }, start: startc, end: e.end,argument: e };
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
        computed: false /* ,y:-1*/
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
        computed: true /* ,y:-1*/
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
        } /* ,y:-1*/
      };

      if (!this.expectType_soft (')'))
        this.err('call.args.is.unfinished');

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
        }, tag : inner/* ,y:-1*/
      };
      inner = head;
      continue ;

    default: break LOOP;
    }

  }

  return head ;
};

this.parseMeta = function(startc,end,startLoc,endLoc,new_raw ) {
  if (this.ltval !== 'target')
    this.err('meta.new.has.unknown.prop');
  
  if (!(this.scopeFlags & SCOPE_FLAG_FN))
    this.err('meta.new.not.in.function');

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

this.id = function() {
  var id = {
    type: 'Identifier', name: this.ltval,
    start: this.c0, end: this.c,
    loc: { start: this.locBegin(), end: this.loc() }, raw: this.ltraw
  };
  this.next() ;
  return id;
};

this.parseThis = function() {
  var n = {
    type : 'ThisExpression',
    loc: { start: this.locBegin(), end: this.loc() },
    start: this.c0,
    end : this.c
  };
  this.next() ;

  return n;
};

this.parseArgList = function () {
  var parenAsync = this.parenAsync, elem = null, list = [];

  do { 
    this.next();
    elem = this.parseNonSeqExpr(PREC_WITH_NO_OP,CTX_NULLABLE); 
    if (elem)
      list.push(core(elem));
    else if (this.lttype === '...')
      list.push(this.parseSpreadElement(CTX_NONE));
    else {
      if (list.length !== 0) {
        if (this.v < 7)
          this.err('arg.non.tail');
      }
      break;
    }
  } while ( this.lttype === ',' );

  if (parenAsync !== null)
    this.parenAsync = parenAsync;

  return list ;
};

},
function(){
this.parseProgram = function () {
  var startc = this.c, li = this.li, col = this.col;
  var endI = this.c , startLoc = null;
  var globalScope = null;

 
  this.directive = !this.isScipt ? DIR_SCRIPT : DIR_MODULE; 
  this.clearAllStrictErrors();

  this.scope = new Scope(globalScope, ST_SCRIPT);
  this.scope.parser = this;
  this.next();
  this.scopeFlags = SCOPE_FLAG_IN_BLOCK;

  var list = this.blck(); 
 
  var endLoc = null;
  if (list.length) {
    var firstStatement = list[0];
    startc = firstStatement.start;
    startLoc = firstStatement.loc.start;    

    var lastStatement = list[ list.length - 1 ];
    endI = lastStatement.end;
    endLoc = lastStatement.loc.end;
  }
  else {
    endLoc = startLoc = { line: 0, column: 0 };
  }
        
  alwaysResolveInTheParentScope(this.scope);
  var n = { type: 'Program', body: list, start: startc, end: endI, sourceType: !this.isScript ? "module" : "script" ,
           loc: { start: startLoc, end: endLoc } };

  if ( !this.expectType_soft ('eof') &&
        this.err('program.unfinished') )
    return this.errorHandlerOutput ;

  return n;
};

function alwaysResolveInTheParentScope(scope) {
}


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
                  if ( this.err('regex.newline.esc') )
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
           if ( this.err('regex.newline') )
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
                  this.err('regex.flag.is.dup');
                flags |= gRegexFlag; break;
            case CH_u:
                if (flags & uRegexFlag)
                  this.err('regex.flag.is.dup');
                flags |= uRegexFlag; break;
            case CH_y:
                if (flags & yRegexFlag)
                  this.err('regex.flag.is.dup');
                flags |= yRegexFlag; break;
            case CH_m:
                if (flags & mRegexFlag)
                  this.err('regex.flag.is.dup');
                flags |= mRegexFlag; break;
            case CH_i:
                if (flags & iRegexFlag)
                  this.err('regex.flag.is.dup');
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
                   value: val, loc: { start: startLoc, end: this.loc() } };
     this.c = c;
     this.next () ;

     return regex ;
};



},
function(){
this.enterFuncScope = function(decl) { this.scope = this.scope.spawnFunc(decl); };

// TODO: it is no longer needed
this.enterComplex = function() {
   if (this.declMode === DECL_MODE_FUNC_PARAMS ||
       this.declMode & DECL_MODE_CATCH_PARAMS)
     this.makeComplex();
};

this.enterLexicalScope = function(loop) { this.scope = this.scope.spawnLexical(loop); };

this.setDeclModeByName = function(modeName) {
  this.declMode = modeName === 'var' ? DECL_MODE_VAR : DECL_MODE_LET;
};

this.exitScope = function() {
  var scope = this.scope;
  this.scope.finish();
  this.scope = this.scope.parent;
  if (this.scope.synth)
    this.scope = this.scope.parent;
  return scope;
};

this.declare = function(id) {
   ASSERT.call(this, this.declMode !== DECL_NONE, 'Unknown declMode');
   if (this.declMode & DECL_MODE_EITHER) {
     this.declMode |= this.scope.isConcrete() ?
       DECL_MODE_VAR : DECL_MODE_LET;
   }
   else if (this.declMode & DECL_MODE_FCE)
     this.declMode = DECL_MODE_FCE;

   if (this.declMode === DECL_MODE_FUNC_PARAMS) {
     if (!this.addParam(id)) // if it was not added, i.e., it is a duplicate
       return;
   }
   else if (this.declMode === DECL_MODE_LET) {
     // TODO: eliminate it because it must've been verified in somewhere else,
     // most probably in parseVariableDeclaration
     if ( !(this.scopeFlags & SCOPE_FLAG_IN_BLOCK) )
       this.err('let.decl.not.in.block');

     if ( id.name === 'let' )
       this.err('lexical.name.is.let');
   }

   this.scope.declare(id, this.declMode);
};

this.makeComplex = function() {
  // complex params are treated as let by the emitter
  if (this.declMode & DECL_MODE_CATCH_PARAMS) {
    this.declMode |= DECL_MODE_LET; 
    return;
  }

  ASSERT.call(this, this.declMode === DECL_MODE_FUNC_PARAMS);
  var scope = this.scope;
  if (scope.mustNotHaveAnyDupeParams()) return;
  for (var a in scope.definedNames) {
     if (!HAS.call(scope.definedNames, a)) continue;
     if (scope.definedNames[a] & DECL_DUPE)
       this.err('func.args.has.dup');
  }
  scope.isInComplexArgs = true;
};

this.addParam = function(id) {
  ASSERT.call(this, this.declMode === DECL_MODE_FUNC_PARAMS);
  var name = id.name + '%';
  var scope = this.scope;
  if ( HAS.call(scope.definedNames, name) ) {
    if (scope.mustNotHaveAnyDupeParams())
      this.err('func.args.has.dup');

    // TODO: this can be avoided with a dedicated 'dupes' dictionary,
    // but then again, that might be too much.
    if (!(scope.definedNames[name] & DECL_DUPE)) {
      scope.insertID(id);
      scope.definedNames[name] |= DECL_DUPE ;
    }

    return false;
  }

  return true;
};

this.ensureParamIsNotDupe = function(id) {
   var name = id.name + '%';
   var scope = this.scope;
   if (HAS.call(scope.idNames, name) && scope.idNames[name])
     this.err('func.args.has.dup');
};

// TODO: must check whether we are parsing with v > 5, whether we are in an if, etc.
this.canDeclareFunctionsInScope = function(isGen) {
  if (this.scope.isConcrete())
    return true;
  if (this.scopeFlags & SCOPE_FLAG_IN_BLOCK)
    return this.v > 5;
  if (this.tight)
    return false;
  if (this.scopeFlags & SCOPE_FLAG_IN_IF)
    return !isGen;
  
  return false;
};

this.canDeclareClassInScope = function() {
  return this.scopeFlag & SCOPE_FLAG_IN_BLOCK ||
    this.scope.isConcrete();
};

this.canLabelFunctionsInScope = function(isGen) { 
  // TODO: add something like a 'compat' option so as to actually allow it for v <= 5;
  // this is what happens in reality: versions prior to ES2015 don't officially allow it, but it
  // is supported in most browsers.
  if (this.v <= 5)
    return false;
  if (this.tight)
    return false;
  if (isGen)
    return false;

  return (this.scopeFlag & SCOPE_FLAG_IN_BLOCK) ||
          this.scope.isConcrete(); 
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
this.parseStatement = function ( allowNull ) {
  var head = null, l, e , directive = this.directive ;
  switch (this.lttype) {
    case '{': return this.parseBlckStatement();
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

  head = this.parseExpr(CTX_NULLABLE|CTX_PAT|CTX_NO_SIMPLE_ERR) ;
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
      this.directive = directive|DIR_LAST;
    else if (!(this.directive & DIR_HANDLED_BY_NEWLINE))
      this.gotDirective(this.dv, directive);
    if (this.strictError.offset !== -1 && this.strictError.stringNode === null)
      this.strictError.stringNode = head;
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

this . findLabel = function(name) {
    return has.call(this.labels, name) ?this.labels[name]:null;

};

this .parseLabeledStatement = function(label, allowNull) {
   this.next();
   var l = label.name;
   l += '%';
   if ( this.findLabel(l) && this.err('label.is.a.dup') )
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

this .parseEmptyStatement = function() {
  var n = { type: 'EmptyStatement',
           start: this.c - 1,
           loc: { start: this.locOn(1), end: this.loc() },
            end: this.c };
  this.next();
  return n;
};

this.parseIfStatement = function () {
  if ( !this.ensureStmt_soft () && this.err('not.stmt') )
    return this.errorHandlerOutput;

  this.fixupLabels(false);
  this.enterLexicalScope(false); 

  var startc = this.c0,
      startLoc  = this.locBegin();
  this.next () ;
  if ( !this.expectType_soft('(') &&
        this.err('if.has.no.opening.paren') )
    return this.errorHanlerOutput;

  var cond = core( this.parseExpr(CTX_NONE) );
  if ( !this.expectType_soft (')' ) &&
        this.err('if.has.no.closing.paren') )
    return this.errorHandlerOutput ;

  var scopeFlags = this.scopeFlags ;
  this.scopeFlags &= CLEAR_IB;
  this.scopeFlags |= SCOPE_FLAG_IN_IF;
  var nbody = this. parseStatement (false);
  var alt = null;
  if ( this.lttype === 'Identifier' && this.ltval === 'else') {
     this.next() ;
     alt = this.parseStatement(false);
  }
  this.scopeFlags = scopeFlags ;

  var scope = this.exitScope(); 

  this.foundStatement = true;
  return { type: 'IfStatement', test: cond, start: startc, end: (alt||nbody).end,
     loc: { start: startLoc, end: (alt||nbody).loc.end }, consequent: nbody, alternate: alt/*,scope:  scope  ,y:-1*/};
};

this.parseWhileStatement = function () {
   this.enterLexicalScope(true);
   if ( ! this.ensureStmt_soft () &&
          this.err('not.stmt') )
     return this.errorHandlerOutput;

   this.fixupLabels(true);

   var startc = this.c0,
       startLoc = this.locBegin();
   this.next();
   if ( !this.expectType_soft ('(') &&
         this.err('while.has.no.opening.paren') )
     return this.errorHandlerOutput;
 
   var cond = core( this.parseExpr(CTX_NONE) );
   if ( !this.expectType_soft (')') &&
         this.err('while.has.no.closing.paren') )
     return this.errorHandlerOutput;

   var scopeFlags = this.scopeFlags;
   this.scopeFlags &= CLEAR_IB;
   this.scopeFlags |= (SCOPE_FLAG_CONTINUE|SCOPE_FLAG_BREAK );
   var nbody = this.parseStatement(false);
   this.scopeFlags = scopeFlags ;
   this.foundStatement = true;

   var scope = this.exitScope();
   return { type: 'WhileStatement', test: cond, start: startc, end: nbody.end,
       loc: { start: startLoc, end: nbody.loc.end }, body:nbody/*,scope:  scope ,y:-1*/ };
};

this.parseBlckStatement = function () {
  this.fixupLabels(false);

  this.enterLexicalScope(false); 
  var startc = this.c - 1,
      startLoc = this.locOn(1);
  this.next();
  var scopeFlags = this.scopeFlags;
  this.scopeFlags |= SCOPE_FLAG_IN_BLOCK;

  var n = { type: 'BlockStatement', body: this.blck(), start: startc, end: this.c,
        loc: { start: startLoc, end: this.loc() }/*,scope:  this.scope  ,y:-1*/};

  if ( !this.expectType_soft ('}' ) &&
        this.err('block.unfinished') )
    return this.errorHandlerOutput ;

  this.exitScope(); 
  this.scopeFlags = scopeFlags;
  return n;
};

this.parseDoWhileStatement = function () {
  if ( !this.ensureStmt_soft () &&
        this.err('not.stmt') )
    return this.errorHandlerOutput ;

  this.enterLexicalScope(true); 
  this.fixupLabels(true);

  var startc = this.c0,
      startLoc = this.locBegin() ;
  this.next() ;
  var scopeFlags = this.scopeFlags;
  this.scopeFlags &= CLEAR_IB;
  this.scopeFlags |= (SCOPE_FLAG_BREAK| SCOPE_FLAG_CONTINUE);
  var nbody = this.parseStatement (true) ;
  this.scopeFlags = scopeFlags;
  if ( !this.expectID_soft('while') &&
        this.err('do.has.no.while') )
    return this.errorHandlerOutput;

  if ( !this.expectType_soft('(') &&
        this.err('do.has.no.opening.paren') )
    return this.errorHandlerOutput;

  var cond = core(this.parseExpr(CTX_NONE));
  var c = this.c, li = this.li, col = this.col;
  if ( !this.expectType_soft (')') &&
        this.err('do.has.no.closing.paren') )
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
          body: nbody, loc: { start: startLoc, end: { line: li, column: col } } /* ,y:-1*/} ;
};

this.parseContinueStatement = function () {
   if ( ! this.ensureStmt_soft   () &&
          this.err('not.stmt') )
     return this.errorHandlerOutput ;

   this.fixupLabels(false);
   if (!(this.scopeFlags & SCOPE_FLAG_CONTINUE) &&
         this.err('continue.not.in.loop') )
     return this.errorHandlerOutput  ;

   var startc = this.c0, startLoc = this.locBegin();
   var c = this.c, li = this.li, col = this.col;

   this.next() ;

   var name = null, label = null, semi = 0;

   var semiLoc = null;

   if ( !this.nl && this.lttype === 'Identifier' ) {
       label = this.validateID("");
       name = this.findLabel(label.name + '%');
       if (!name) this.err('continue.no.such.label') ;
       if (!name.loop) this.err('continue.not.a.loop.label');

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

this.parseBreakStatement = function () {
   if (! this.ensureStmt_soft   () &&
         this.err('not.stmt') )
     return this.errorHandlerOutput ;

   this.fixupLabels(false);
   var startc = this.c0, startLoc = this.locBegin();
   var c = this.c, li = this.li, col = this.col;

   this.next() ;

   var name = null, label = null, semi = 0;

   var semiLoc = null;

   if ( !this.nl && this.lttype === 'Identifier' ) {
       label = this.validateID("");
       name = this.findLabel(label.name + '%');
       if (!name) this.err('break.no.such.label');
       semi = this.semiI();
       semiLoc = this.semiLoc_soft();
       if ( !semiLoc && !this.nl &&
            this.err('no.semi') )
         return this.errorHandlerOutput;

       this.foundStatement = true;
       return { type: 'BreakStatement', label: label, start: startc, end: semi || label.end,
           loc: { start: startLoc, end: semiLoc || label.loc.end } };
   }
   else if (!(this.scopeFlags & SCOPE_FLAG_BREAK) &&
         this.err('break.not.in.breakable') )
     return this.errorHandlerOutput ;

   semi = this.semiI();
   semiLoc = this.semiLoc_soft();
   if ( !semiLoc && !this.nl &&
        this.err('no.semi') )
     return this.errorHandlerOutput;

   this.foundStatement = true;
   return { type: 'BreakStatement', label: null, start: startc, end: semi || c,
           loc: { start: startLoc, end: semiLoc || { line: li, column : col } } };
};

this.parseSwitchStatement = function () {
  if ( ! this.ensureStmt_soft () &&
         this.err('not.stmt') )
    return this.errorHandlerOutput ;

  this.fixupLabels(false) ;

  var startc = this.c0,
      startLoc = this.locBegin(),
      cases = [],
      hasDefault = false ,
      scopeFlags = this.scopeFlags,
      elem = null;

  this.next() ;
  if ( !this.expectType_soft ('(') &&
       this.err('switch.has.no.opening.paren') )
    return this.errorHandlerOutput;

  var switchExpr = core(this.parseExpr(CTX_NONE));
  if ( !this.expectType_soft (')') &&
        this.err('switch.has.no.closing.paren') )
    return this.errorHandlerOutput ;

  if ( !this.expectType_soft ('{') &&
        this.err('switch.has.no.opening.curly') )
    return this.errorHandlerOutput ;

  this.enterLexicalScope(false); 
  this.scopeFlags |=  (SCOPE_FLAG_BREAK|SCOPE_FLAG_IN_BLOCK);
  while ( elem = this.parseSwitchCase()) {
    if (elem.test === null) {
       if (hasDefault ) this.err('switch.has.a.dup.default');
       hasDefault = true ;
    }
    cases.push(elem);
  }

  this.scopeFlags = scopeFlags ;
  this.foundStatement = true;

  var scope = this.exitScope(); 
  var n = { type: 'SwitchStatement', cases: cases, start: startc, discriminant: switchExpr,
            end: this.c, loc: { start: startLoc, end: this.loc() }/*,scope:  scope  ,y:-1*/};
  if ( !this.expectType_soft ('}' ) &&
        this.err('switch.unfinished') )
    return this.errorHandlerOutput ;

  return n;
};

this.parseSwitchCase = function () {
  var startc,
      startLoc;

  var nbody = null,
      cond  = null;

  if ( this.lttype === 'Identifier' ) switch ( this.ltval ) {
     case 'case':
       startc = this.c0;
       startLoc = this.locBegin();
       this.next();
       cond = core(this.parseExpr(CTX_NONE)) ;
       break;

     case 'default':
       startc = this.c0;
       startLoc = this.locBegin();
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
     loc: { start: startLoc, end: last ? last.loc.end : { line: li, column: col } }, consequent: nbody/* ,y:-1*/ };
};

this.parseReturnStatement = function () {
  if (! this.ensureStmt_soft () &&
       this.err('not.stmt') )
    return this.errorHandlerOutput ;

  this.fixupLabels(false ) ;

  if ( !( this.scopeFlags & SCOPE_FLAG_FN ) &&
          this.err('return.not.in.a.function') )
    return this.errorHandlerOutput ;

  var startc = this.c0,
      startLoc = this.locBegin(),
      retVal = null,
      li = this.li,
      c = this.c,
      col = this.col;

  this.next();

  var semi = 0, semiLoc = null;

  if ( !this.nl )
     retVal = this.parseExpr(CTX_NULLABLE);

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

  retVal = this.parseExpr(CTX_NULLABLE );
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

this. parseBlockStatement_dependent = function(owner) {
    var startc = this.c - 1,
        startLoc = this.locOn(1);

    if (!this.expectType_soft ('{'))
      this.err('block.dependent.no.opening.curly');
    var scopeFlags = this.scopeFlags;
    this.scopeFlags |= SCOPE_FLAG_IN_BLOCK;

    var n = { type: 'BlockStatement', body: this.blck(), start: startc, end: this.c,
        loc: { start: startLoc, end: this.loc() }/*,scope:  this.scope  ,y:-1*/ };
    if ( ! this.expectType_soft ('}') &&
         this.err('block.dependent.is.unfinished')  )
      return this.errorHandlerOutput;

    this.scopeFlags = scopeFlags;
    return n;
};

this.parseTryStatement = function () {
  if ( ! this.ensureStmt_soft () &&
         this.err('not.stmt') )
    return this.errorHandlerOutput ;

  this.fixupLabels(false);
  var startc = this.c0,
      startLoc = this.locBegin();

  this.next() ;

  this.enterLexicalScope(false); 

  var tryBlock = this.parseBlockStatement_dependent('try');
  this.exitScope(); 
  var finBlock = null, catBlock  = null;
  if ( this.lttype === 'Identifier' && this.ltval === 'catch')
    catBlock = this.parseCatchClause();

  if ( this.lttype === 'Identifier' && this.ltval === 'finally') {
     this.next();

     this.enterLexicalScope(false); 
     finBlock = this.parseBlockStatement_dependent('finally');
     this.exitScope(); 
  }

  var finOrCat = finBlock || catBlock;
  if ( ! finOrCat &&
       this.err('try.has.no.tail')  )
    return this.errorHandlerOutput ;

  this.foundStatement = true;
  return  { type: 'TryStatement', block: tryBlock, start: startc, end: finOrCat.end,
            handler: catBlock, finalizer: finBlock, loc: { start: startLoc, end: finOrCat.loc.end } /* ,y:-1*/};
};

this.enterCatchScope = function() {
  this.scope = this.scope.spawnCatch();
};

this. parseCatchClause = function () {
   var startc = this.c0,
       startLoc = this.locBegin();

   this.next();

   this.enterCatchScope();
   if ( !this.expectType_soft ('(') &&
        this.err('catch.has.no.opening.paren') )
     return this.errorHandlerOutput ;

   this.declMode = DECL_MODE_CATCH_PARAMS;
   var catParam = this.parsePattern();
   if (this.lttype === 'op' && this.ltraw === '=')
     this.err('catch.param.has.default.val');

   this.declMode = DECL_NONE;
   if (catParam === null)
     this.err('catch.has.no.param');

   if ( !this.expectType_soft (')') &&
         this.err('catch.has.no.end.paren')  )
     return this.errorHandlerOutput    ;

   var catBlock = this.parseBlockStatement_dependent('catch');

   this.exitScope();
   return {
       type: 'CatchClause',
        loc: { start: startLoc, end: catBlock.loc.end },
       start: startc,
       end: catBlock.end,
       param: catParam ,
       body: catBlock/* ,y:-1*/
   };
};

this . parseWithStatement = function() {
   if ( !this.ensureStmt_soft () &&
         this.err('not.stmt') )
     return this.errorHandlerOutput ;

   if ( this.tight) this.err('with.strict')  ;

   this.enterLexicalScope(false);
   this.fixupLabels(false);

   var startc = this.c0,
       startLoc = this.locBegin();

   this.next();
   if (! this.expectType_soft ('(') &&
         this.err('with.has.no.opening.paren') )
     return this.errorHandlerOutput ;

   var obj = this.parseExpr(CTX_NONE);
   if (! this.expectType_soft (')' ) &&
         this.err('with.has.no.end.paren') )
     return this.errorHandlerOutput ;

   var scopeFlags = this.scopeFlags;

   this.scopeFlags &= CLEAR_IB;
   var nbody = this.parseStatement(true);
   this.scopeFlags = scopeFlags;
   
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

this.blck = function () { // blck ([]stmt)
  var isFunc = false, stmt = null, stmts = [];
  if (this.directive !== DIR_NONE)
    this.parseDirectives(stmts);

  while (stmt = this.parseStatement(true))
    stmts.push(stmt);

  return (stmts);
};

this.checkForStrictError = function() {
  if (this.strictError.stringNode !== null)
    this.err('strict.err.esc.not.valid');
};

this.parseDirectives = function(list) {
  if (this.v < 5)
    return;

  var r = this.directive;

  // TODO: maybe find a way to let the `readStringLiteral` take over this process (partially, at the very least);
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
    if (flags & DIR_FUNC)
      this.makeStrict()
    else {
      this.tight = true;
      this.scope.strict = true;
    }

    this.checkForStrictError();
  }
};

this.clearAllStrictErrors = function() {
  this.strictError.stringNode = null;
  this.strictError.offset = -1;
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
           if ( this.err('str.newline') )
             return this.errorHandlerOutput ;
    }
    c++;
  }

  if ( v_start !== c ) { v += l.slice(v_start,c ) ; }
  if (!(c < e && (l.charCodeAt(c)) === start) &&
       this.err('str.unfinished') ) return this.errorHandlerOutput;

  this.c = c + 1 ;
  this.col += (this. c - startC   )  ;
  this.lttype = 'Literal'  ;
  this.ltraw =  l.slice (this.c0, this.c);
  this.ltval = v ;
};



},
function(){
this . parseTemplateLiteral = function() {
  var li = this.li, col = this.col;
  var startc = this.c - 1, startLoc = this.locOn(1);
  var c = this.c, src = this.src, len = src.length;
  var templStr = [], templExpressions = [];
  var startElemFragment = c, // an element's content might get fragmented by an esc appearing in it, e.g., 'eeeee\nee' has two fragments, 'eeeee' and 'ee'
      startElem = c,
      currentElemContents = "",
      startColIndex = c ,
      ch = 0;
 
  while ( c < len ) {
    ch = src.charCodeAt(c);
    if ( ch === CH_BACKTICK ) break; 
    switch ( ch ) {
       case CH_$ :
          if ( src.charCodeAt(c+1) === CH_LCURLY ) {
              currentElemContents += src.slice(startElemFragment, c) ;
              this.col += ( c - startColIndex );
              templStr.push(
                { type: 'TemplateElement', 
                 start: startElem, end: c, tail: false,
                 loc: { start: { line: li, column: col }, end: { line: this.li, column: this.col } },        
                 value: { raw : src.slice(startElem, c ).replace(/\r\n|\r/g,'\n'), 
                        cooked: currentElemContents   } } );

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

  if ( ch !== CH_BACKTICK ) this.err('templ.lit.is.unfinished') ;
  
  if ( startElem < c ) {
     this.col += ( c - startColIndex );
     if ( startElemFragment < c )
       currentElemContents += src.slice( startElemFragment, c );
  }
  else currentElemContents = "";

  templStr.push({
     type: 'TemplateElement',
     start: startElem,
     loc: { start : { line: li, column: col }, end: { line: this.li, column: this.col } },
     end: startElem < c ? c : startElem ,
     tail: true,
     value: { raw: src.slice(startElem,c).replace(/\r\n|\r/g,'\n'), 
              cooked: currentElemContents }
  }); 

  c++; // backtick  
  this.col ++ ;

  var n = { type: 'TemplateLiteral', start: startc, quasis: templStr, end: c,
       expressions: templExpressions , loc: { start: startLoc, end : this.loc() } /* ,y:-1*/};

  this.c = c;
  this.next(); // prepare the next token  

  return n
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
            if ( this.v <= 5 || !this.tight )
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
//          if (this.tight) return this.err('eval.arguments.in.strict');

         default:
            break SWITCH;
     }
     case 5: switch (n) {
         case 'await':
            if (this.isScript &&
               !(this.scopeFlags & SCOPE_FLAG_ALLOW_AWAIT_EXPR))
              break SWITCH;
            else
              this.errorReservedID(e);
         case 'final':
         case 'float':
         case 'short':
            if ( this. v > 5 ) break SWITCH;
            return this.errorReservedID(e);
    
         case 'yield': 
            if (!this.tight && !(this.scopeFlags & SCOPE_FLAG_GEN)) {
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
             if ( this.v > 5 && !this.tight )
               break SWITCH;
         case 'delete': case 'export': case 'import': case 'return':
         case 'switch': case 'typeof':
            return this.errorReservedID(e) ;

         default: break SWITCH;
     }
     case 7:  switch (n) {
         case 'package':
         case 'private':
            if ( this.tight ) return this.errorReservedID(e);
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
            if ( this.tight )
              return this.errorReservedID (e);
         case 'transient':
            if ( this.v <= 5 )
              return this.errorReservedID(e) ;
//       case 'arguments':
//          if (this.tight) return this.err('eval.arguments.in.strict');

         default: break SWITCH;
     }
     case 10: switch (n) {
         case 'implements':
            if ( this.v > 5 && !this.tight ) break ;
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
    if ( !this.throwReserved ) {
       this.throwReserved = true;
       return null;
    }
    if ( this.err('reserved.id') ) return this.errorHandlerOutput;
}



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
      this.err('decl.label');
  }

  this.next();
  this.declMode = kind === 'var' ? 
    DECL_MODE_VAR : DECL_MODE_LET;
  
  if (kind === 'let' &&
      this.lttype === 'Identifier' &&
      this.ltval === 'in') {
    return null;
  }

  elem = this.parseVariableDeclarator(context);
  if (elem === null) {
    if (kind !== 'let') 
      this.err('var.has.no.declarators');

    return null; 
  }

  var isConst = kind === 'const';
  // TODO: if there is a context flag signifying that an init must be present,
  // this is no longer needed
  if (isConst && !elem.init && !this.missingInit) {
    if (!(context & CTX_FOR))
      this.err('const.has.no.init');
    else this.missingInit = true;
  }

  var list = null;
  if (this.missingInit) {
    if (context & CTX_FOR)
      list = [elem];
    else this.err('var.must.have.init');
  }
  else {
    list = [elem];
    while (this.lttype === ',') {
      this.next();     
      elem = this.parseVariableDeclarator(context);
      if (!elem)
        this.err('var.has.an.empty.declarator');
   
      if (this.missingInit || (isConst && !elem.init))
        this.err('var.init.is.missing');
   
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
    kind: kind /* ,y:-1*/
  };
};

this.parseVariableDeclarator = function(context) {
  var head = this.parsePattern(), init = null;
  if (!head)
    return null;

  if (this.lttype === 'op') {
    if (this.ltraw === '=')  {
       this.next();
       init = this.parseNonSeqExpr(PREC_WITH_NO_OP, context);
    }
    else 
      this.err('var.decl.not.=');
  }
  else if (head.type !== 'Identifier') { // our pattern is an arr or an obj?
    if (!( context & CTX_FOR))  // bail out in case it is not a 'for' loop's init
      this.err('var.decl.neither.of.in');

    this.missingInit = true;
  }

  var initOrHead = init || head;
  return {
    type: 'VariableDeclarator', id: head,
    start: head.start, end: initOrHead.end,
    loc: {
      start: head.loc.start,
      end: initOrHead.loc.end 
    }, init: init && core(init)/* ,y:-1*/
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
           end: endI, loc: { start : startLoc, end: endLoc }/* ,y:-1*/ }
 
  if (this.suspys === null)
    this.suspys = n;

  return n;
};



}]  ],
[Scope.prototype, [function(){


this.declare = function(name, declType) {
  return declare[declType].call(this, name, declType);
};


this.hoistIdToScope = function(id, targetScope, decl) { 
   var scope = this;
   
   while (true) {
     ASSERT.call(this, scope !== null, 'reached the head of scope chain while hoisting name "'+id+'"'); 
     if ( !scope.insertDecl(id, decl) ) {
       this.insertDecl0(id, DECL_MODE_CATCH_PARAMS);
       break;
     }

     if (scope === targetScope)
       break;

     scope = scope.parent;
   }
};
   
var declare = {};

declare[DECL_MODE_CLASS_STMT|DECL_MODE_VAR] = 
declare[DECL_MODE_FUNC_PARAMS] =
declare[DECL_MODE_FUNC_STMT|DECL_MODE_VAR] =
declare[DECL_MODE_VAR] = function(id, declType) {
   var func = this.funcScope;

   this.hoistIdToScope(id, func, declType );
};

declare[DECL_MODE_CATCH_PARAMS|DECL_MODE_LET] = declare[DECL_MODE_FCE] =
declare[DECL_MODE_FUNC_STMT|DECL_MODE_LET] = declare[DECL_MODE_CLASS_STMT|DECL_MODE_LET] =
declare[DECL_MODE_LET] = function(id, declType) {
   this.insertDecl(id, declType);
};

declare[DECL_MODE_CATCH_PARAMS] = function(id, declType) {
  var name = id.name + '%';
  this.insertDecl(id, declType);
};
 
// returns false if the variable was not inserted
// in the current scope because of having
// the same name as a catch var in the scope
// (this implies the scope must be a catch scope for this to happen)
this.insertDecl = function(id, decl) {

  var declType = decl;
  var existingDecl = this.findDeclInScope(id.name);
  var func = this.funcScope;

  if (existingDecl !== DECL_NOT_FOUND) {
    var existingType = existingDecl;

    // if a var name in a catch scope has the same name as a catch var,
    // it will not get hoisted any further
    if ((declType & DECL_MODE_VAR_LIKE) && (existingType & DECL_MODE_CATCH_PARAMS))
       return false;

    // if a var decl is overriding a var decl of the same name, no matter what scope we are in,
    // it's not a problem.
    if ((declType & DECL_MODE_VAR_LIKE) && (existingType & DECL_MODE_VAR_LIKE))
      return true; 
     
    this.err('exists.in.current');
  }

  this.insertDecl0(id, decl);
  this.insertID(id);

  return true;
};

this.insertDecl0 = function(id, declType) {
  var name = id.name + '%';
  this.definedNames[name] = declType;
};

this.findDeclInScope = function(name) {
  name += '%';
  return HAS.call(this.definedNames, name) ? 
     this.definedNames[name] : DECL_NOT_FOUND;
};

this.finish = function() {
};
    

this.isLoop = function() { return this.type & ST_LOOP; };
this.isLexical = function() { return this.type & ST_LEXICAL; };
this.isFunc = function() { return this.type & ST_FN; };
this.isHoisted = function() { return this.type & ST_HOISTED; };
this.isCatch = function() { return this.type & ST_CATCH; };
this.isGlobal = function() { return this.type & ST_GLOBAL; };

// a scope is concrete if a 'var'-declaration gets hoisted to it
this.isConcrete = function() { return this.type & ST_CONCRETE; };


this.err = function(errType, errParams) {
  this.funcScope.parser.err(errType, errParams);
};


},
function(){

this.spawnFunc = function(fundecl) {
  return new Scope(
    this,
    fundecl ?
      ST_FN_STMT :
      ST_FN_EXPR
  );
};

this.spawnLexical = function(loop) {
  return new Scope(
    this,
    !loop ?
     ST_LEXICAL :
     ST_LEXICAL|ST_LOOP);
};

this.spawnCatch = function() {
  return new Scope(
    this,
    ST_LEXICAL|ST_CATCH);
};

this.mustNotHaveAnyDupeParams = function() {
  return this.strict || this.isInComplexArgs;
};

this.hasParam = function(name) {
  return HAS.call(this.idNames, name+'%');
};

this.insertID = function(id) {
  this.idNames[id.name+'%'] = id;
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
this.ErrorString = ErrorString; this.Template = Template;
;}).call (this)