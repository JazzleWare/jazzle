(function(){
"use strict";
;
function BundleScope(globalScope) {
  if (globalScope === null)
    globalScope = new GlobalScope();
  else
    ASSERT.call(this, globalScope.isGlobal(), 'not global');
  ConcreteScope.call(this, globalScope, ST_BUNDLE);
};
;
function Bundler() {
  this.type = '#Bundler';
  this.loaded = {};
  this.main = null;
  this.path = "";
  this.resolver = null;
  this['#scope'] = null;
  this['#y'] = 0;
}
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
function Comments() {
  this.c = [];
  this.n = false;
}
;
function ConcreteScope(parent, type) {
  Scope.call(this, parent, type);

  this.liquidDefs = new SortedObj();
  this.synthNamesUntilNow = null;

  this.spThis = null;
  this.isBooted = false;
}
;
function Decl() {
  this.ref = null;
  this.idx = -1;
  this.name = "";
  this.site = null;
  this.msynth = -1;
  this.hasTZCheck = false;
  this.reached = null;
  this.type = DT_NONE;
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
  this.hasLine = false;

  this.onWrite_fun = null;
  this.onWrite_arg = null;
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
  ConcreteScope.call(this, parent, type|ST_FN);

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
  this.type |= DT_LIQUID;
  this.rsMap = {};
  this.category = category;
}
;
function LiquidGroup(cat, scope) {
  this.category = cat;
  this.scope = scope;
  this.list = [];
  this.hasSeal = false;
  this.length = 0;
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

  this.hasDissolved = false;
  this.ch = [];
}
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

  this.isScript = !o || o.sourceType === 'script';
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

  this.yc= -1; // occasionally used to put yield counts in
  this.ex = DT_NONE;

  this.bundleScope = null;
  this.chkDirective = false;
  this.alreadyApplied = false;
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
function Ref(scope) {
  this.i = 0;
  this.rsList = [];
  this.scope = scope || null;
  this.d = 0;
  this.targetDecl = null;
  this.hasTarget = false;
  this.parentRef = null;
  this.lhs = 0;
}
;
function Scope(sParent, type) {
  this.parent = sParent;
  this.type = type;
  this.refs = new SortedObj();
  this.defs = new SortedObj();
  this.hasTZCheckPoint = false;
  this.scs =
    this.isGlobal() ?
      null :
      this.isConcrete() ?
        this :
        this.parent.scs;

  this.actions = this.determineActions();
  this.flags = this.determineFlags();

  this.scopeID_ref = this.parent ?
    this.parent.scopeID_ref : {v: 0};
  this.scopeID = this.scopeID_ref.v++;

  this.parser = this.parent && this.parent.parser;

  this.di_ref = 
    this.isGlobal() || this.isConcrete() ?
      {v: 0} :
      this.parent.di_ref;
  this.di0 = this.di_ref.v++;

  this.varTargets =
    this.isGlobal() ?
      null :
      this.isConcrete() ?
        {} :
        this.isCatch() ?
          createObj(this.parent.varTargets) :
          this.parent.varTargets;

  this.funLists = new SortedObj();

  if (this.parent && this.parent.isParen())
    this.parent.ch.push(this);
}
;
function ScopeName(name, src) {
  Decl.call(this);

  this.name = name;
  this.source = src;
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
function SourceScope(parent, st) {
  ConcreteScope.call(this, parent, st);
  this.asMod = { mex: new SortedObj(), mim: new SortedObj(), mns: new SortedObj() };
  this.unresolvedExports = { entries: new SortedObj(), count: 0 };
  this.spThis = null;
  this.globals = new SortedObj();
}
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
function Transformer() {
  // TODO: `inGen or `flag for more contextual info (doesn't `cur have all that, anyway?)
  // CRUCIAL SCOPES:
  this.global = null;
  this.script = null;
  this.cur = null;

  // the could be per scope (i.e., a scope attibute),
  this.bundler = null;
  this.tempStack = [];
  this.reachedRef = {v: true};

}
;
function VirtualSourceLoader(fsmap) {
  this.fsmap = fsmap || {}

}
;
 ConcreteScope.prototype = createObj(Scope.prototype);
 GlobalScope.prototype = createObj(Scope.prototype);
 FunScope.prototype = createObj(ConcreteScope.prototype);
 ModuleScope.prototype = createObj(ConcreteScope.prototype);
 ClassScope.prototype = createObj(Scope.prototype);
 CatchScope.prototype = createObj(Scope.prototype);
 ParenScope.prototype = createObj(Scope.prototype);
 ScopeName.prototype = createObj(Decl.prototype);
 Liquid.prototype = createObj(Decl.prototype);
 SourceScope.prototype = createObj(ConcreteScope.prototype);
 BundleScope.prototype = createObj(ConcreteScope.prototype);
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

    CH_VTAB = char2int('\v'),
    CH_BACK = char2int('\b'),
    CH_FORM_FEED   = char2int( '\f') ,
    CH_TAB = char2int('\t'),
    CH_CARRIAGE_RETURN = char2int('\r'),
    CH_LINE_FEED = char2int('\n'),

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
function ASSERT_EQ(val,ex) { ASSERT.call(this, val === ex, 'val must be <'+ex+'>, not <'+val+'>'); }

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
    EC_NON_SEQ = EC_CALL_HEAD << 1,
    EC_IN = EC_NON_SEQ << 1;

var PE_NO_NONVAR = 1,
    PE_NO_LABEL = PE_NO_NONVAR << 1,
    PE_LEXICAL = PE_NO_NONVAR,
    PE_NONE = 0;
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
var ERR_FLAG_LEN = 0;

var ERR_P_SYN = 1 << ERR_FLAG_LEN++,
    ERR_A_SYN = 1 << ERR_FLAG_LEN++,
    ERR_S_SYN = 1 << ERR_FLAG_LEN++,
    ERR_P_SEM = 1 << ERR_FLAG_LEN++,
    ERR_A_SEM = 1 << ERR_FLAG_LEN++,
    ERR_S_SEM = 1 << ERR_FLAG_LEN++,
    ERR_PIN = 1 << ERR_FLAG_LEN++, // looks like it need not have any sub-type yet
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
function errt_top(ctx) {
  return (ctx & CTX_TOP) === CTX_TOP;
}

function errt_pin(err) {
  return err & ERR_PIN;
}

function errt_noLeak(ctx) {
  return errt_top(ctx);
}

function errt_perr(ctx, err) {
  return errt_param(ctx) && err !== ERR_NONE_YET;
}

function errt_param(ctx) {
  return ctx & CTX_PARAM;
}

function errt_aerr(ctx, err) {
  return errt_pat(ctx) && err !== ERR_NONE_YET;
}

function errt_pat(ctx) {
  return ctx & CTX_PAT;
}

function errt_serr(ctx, err) {
  return errt_pat(ctx) && err !== ERR_NONE_YET;
}

function errt_ptrack(ctx) {
  return errt_param(ctx) && !(ctx & CTX_HAS_A_PARAM_ERR);
}

function errt_atrack(ctx) {
  return errt_pat(ctx) && !(ctx & CTX_HAS_AN_ASSIG_ERR);
}

function errt_strack(ctx) {
  return errt_pat(ctx) && !(ctx & CTX_HAS_A_SIMPLE_ERR);
}

function errt_elem_ctx_of(ctx) {
  return errt_pat(ctx) ?
    ctx & (
      CTX_HAS_A_PARAM_ERR|
      CTX_HAS_AN_ASSIG_ERR|
      CTX_HAS_A_SIMPLE_ERR|
      CTX_PARAM|CTX_PAT
    ) : CTX_PAT|CTX_NO_SIMPLE_ERR;
}

function errt_track(ctx) {
  return errt_pat(ctx) || errt_param(ctx);
}

function errt_psyn(err) { return err & ERR_P_SYN; }
function errt_asyn(err) { return err & ERR_A_SYN; }
function errt_ssyn(err) { return err & ERR_S_SYN; }
;
var Emitters = {};
var UntransformedEmitters = {};
var Transformers = {};
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
var TK_ELLIPSIS = TK_YIELD << 1;
var TK_DIV = TK_ELLIPSIS << 1;
var TK_UNBIN = TK_SIMP_BINARY|TK_UNARY;
var TK_ANY_ASSIG = TK_SIMP_ASSIG|TK_OP_ASSIG;
var TK_ANY_BINARY = TK_SIMP_BINARY|TK_ANY_ASSIG;

var BINP = {};

var PREC_NONE = 0; // [<start>]
var PREC_COMMA = nextl(PREC_NONE); // ,
var PREC_ASSIG = nextr(PREC_COMMA); // =, [<op>]=
var PREC_COND = nextl(PREC_ASSIG); // ?:

var PREC_LOG_OR =
BINP['||'] = 
nextl(PREC_COND); // ||

var PREC_LOG_AND = 
BINP['&&'] = 
nextl(PREC_LOG_OR); // &&

var PREC_BIT_OR = 
BINP['|'] = 
nextl(PREC_LOG_AND); // |

var PREC_BIT_XOR = 
BINP['^'] = 
nextl(PREC_BIT_OR); // ^

var PREC_BIT_AND = 
BINP['&'] = 
nextl(PREC_BIT_XOR); // &

var PREC_EQ = 
BINP['!='] = BINP['==='] = BINP['=='] = BINP['!=='] = 
nextl(PREC_BIT_AND); // !=, ===, ==, !==

var PREC_COMP =
BINP['>'] = BINP['<='] = BINP['<'] = BINP['>='] = 
nextl(PREC_EQ); // >, <=, <, >=, instanceof, in

var PREC_SH =
BINP['>>>'] = BINP['>>'] = BINP['<<'] = 
nextl(PREC_COMP); // >>>, >>, <<

var PREC_ADD = BINP['+'] = BINP['-'] = nextl(PREC_SH); // +, -
var PREC_MUL = BINP['*'] = nextl(PREC_ADD); // *, /
var PREC_EX = BINP['**'] = nextl(PREC_MUL); // **

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
  case PREC_LOG_OR:
    return true;
  }
  return false;
}
function bp(o) {
  ASSERT.call(this, HAS.call(BINP, o), 'unknown operator');
  return BINP[o];
}
function isRA(nPrec) { return nPrec&1; }
;

function onW_line(rawStr) { this.l(); } 
;
function ref_arguments_m(mname) {
  return mname === RS_ARGUMENTS;
}

function ref_scall_m(mname) {
  return mname === RS_SCALL;
}

function ref_this_m(mname) {
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
    ST_ACCESSOR = ST_GETTER|ST_SETTER,
    ST_ARROW = ST_GETTER << 1,
    ST_BUNDLE = ST_ARROW << 1,
    ST_GEN = ST_BUNDLE << 1,
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
    SA_NEW_TARGET = SA_CONTINUE << 1,
    SA_CALLSUPER = SA_NEW_TARGET << 1,
    SA_MEMSUPER = SA_CALLSUPER << 1,
    SA_NONE = 0;

var SF_LOOP = 1,
    SF_UNIQUE = SF_LOOP << 1,
    SF_STRICT = SF_UNIQUE << 1,
    SF_ARGS = SF_STRICT << 1,
    SF_INSIDEIF = SF_ARGS << 1,
    SF_COND = SF_INSIDEIF << 1,
    SF_FORINIT = SF_COND << 1,
    SF_WITH_SCALL = SF_FORINIT << 1,
    SF_HERITAGE = SF_WITH_SCALL << 1,
    SF_WITH_SMEM = SF_HERITAGE << 1,
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
    DT_IDEFAULT = DT_CLSNAME << 1,
    DT_IALIASED = DT_IDEFAULT << 1,
    DT_INAMESPACE = DT_IALIASED << 1,
    DT_INFERRED = DT_INAMESPACE << 1,
    DT_GLOBAL = DT_INFERRED << 1,
    DT_FNNAME = DT_GLOBAL << 1,
    DT_EDEFAULT = DT_FNNAME << 1,
    DT_EALIASED = DT_EDEFAULT << 1,
    DT_ESELF = DT_EALIASED << 1,
    DT_EXPORTED = DT_EDEFAULT|DT_EALIASED|DT_ESELF,
    DT_IMPORTED = DT_IDEFAULT|DT_IALIASED|DT_INAMESPACE,
    DT_NONE = 0;

var RS_ARGUMENTS = _m('arguments'),
    RS_SCALL = _m('special:scall'),
    RS_THIS = _m('special:this');

var ATS_DISTINCT = 1,
    ATS_UNSURE = ATS_DISTINCT << 1,
    ATS_SAME = ATS_UNSURE << 1;

;
function _m(name) { return name+'%'; }
function _u(name) {
  ASSERT.call(this, name.charCodeAt(name.length-1) === CH_MODULO,
    'only mangled names are allowed to get unmangled');
  return name.substring(0, name.length-1);
}
function _full(nameSpace, name) { return nameSpace+':'+name; }
;
var D = '.'.charCodeAt(0);

var S = '/'.charCodeAt(0);

function cd(cur, to) {
  var coords = {s: 0, e: 0};

  while (getDirLeft(to, coords))
    cur = joinDirWithSingle(cur, to.substring(coords.s, coords.e));

  return cur;
};

function getDirLeft(to, coords) {
  var s = coords.e;
  if (s >= to.length)
    return null;

  var rootSlash = false, ch = to.charCodeAt(s);
  if (ch === S) {
    if (s > 0) s++;
    else rootSlash = true;
  }

  var e = to.indexOf('/', rootSlash ? s+1 : s);
  if (e === -1)
    e = to.length;

  coords.s = s;
  coords.e = e;

  return coords;
}

function joinDirWithSingle(cur, l) {
  if (l.length === 0 || l === '.')
    return cur;
  if (l.charCodeAt(0) === S)
    return l;
  if (l !== '..')
    return cur.length ? cur + (cur === '/' ? l : '/' + l) : l;

  ASSERT.call(this, cur.length, 'can not go above the start');

  var slash = cur.lastIndexOf('/');
//ASSERT.call(this, slash !== -1, 'can not go above [:'+cur+':]');
  
  if (slash === -1)
    return "";

  if (cur.length === 1) {
    ASSERT.call(this, cur.charCodeAt(0) === S, 'what?');
    ASSERT.call(this, false, 'can not go above base');
  }

  if (slash === 0)
    return '/';

  cur = cur.substring(0, slash);
  return cur;
}

function pathFor(str) {
  var e = str.lastIndexOf('/');
  return e === 0 ? '/' : e === -1 ? "" : str.substring(0, e);
}

function tailFor(str) {
  var e = str.lastIndexOf('/');
  return e === -1 ? str : e+1 >= str.length ? "" : str.substring(e+1);
}
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

function arorev(l) {
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

function getIDName(n) {
  if (n.type === 'Identifier')
    return n.name;
  if (n.type === 'Literal' &&
    typeof n.value === STRING_TYPE &&
    isIDName(n.value))
    return n.value;
  return "";
};

function isIDName(str) {
  var e = 0;
  if (str.length === 0)
    return false;
  var ch = str.charCodeAt(e++), ch2 = -1;
  if (ch >= 0x0d800 && ch <= 0x0dbff) {
    if (e < str.length)
      ch = surrogate(ch, str.charCodeAt(e++));
    else
      return false;
  }
  if (!isIDHead(ch))
    return false;
  while (e < str.length) {
    ch = str.charCodeAt(e++);
    if (ch >= 0x0d800 && ch <= 0x0dbff) {
      if (e < str.length)
        ch = surrogate(ch, str.charCodeAt(e++));
      else
        return false;
    }
    if (!isIDBody(ch))
      return false;
  }
  return true;
}

function isTemp(n) {
  return n.type === '#Untransformed' &&
    n.kind === 'temp';
}

function isResolvedName(n) {
  return n.type === '#Untransformed' &&
    n.kind === 'resolved-name';
}

function findElem(list, t) {
  var e = 0;
  while (e < list.length) {
    var elem = list[e];
    if (elem && elem.type === t)
      return e;
    e++;
  }
  return -1;
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
[BundleScope.prototype, [function(){


}]  ],
[Bundler.prototype, [function(){
this.forProg =
function(n) {
  ASSERT.call(this, this.main === null, 'main');
  ASSERT.call(this, n.type === 'Program', 'program');
  this.main = n;
  return this;
};

this.withPath =
function(url) {
  ASSERT.call(this, this.path === "", 'not');
  ASSERT.call(this, this.main, 'main');
  url = cd("", url);
  this.loaded[_m(url)] = this.main;
  url = pathFor(url);
  this.path = url;
  return this;
};

this.cd =
function(url) {
  var oPath = this.path;
  this.path = cd(oPath, url);
  return oPath;
};

this.has =
function(url) {
  url = cd(this.path, url);
  return HAS.call(this.loaded, _m(url));
};

this.load =
function(url) {
  var normalizedURL = cd(this.path, url);
  ASSERT.call(this, !this.has(normalizedURL));
  var src = this.resolver.load(this.path, url);
  var n = new Parser(src, {sourceType: 'module'}).parseProgram();
  this.loaded[_m(url)] = n;
  var transformer = new Transformer();
  transformer.bundler = this;
  return transformer.tr(n, false);
};

this.get =
function(url) {
  url = cd(this.path, url);
  ASSERT.call(this, this.has(url));
  return this.loaded[_m(url)];
};

}]  ],
null,
[ClassScope.prototype, [function(){
this.hasHeritage =
function() { return this.flags & SF_HERITAGE; };

}]  ],
[Comments.prototype, [function(){
this. push =
function(comment) {
  this.c.push(comment);
  if (!this.n)
    this.n = comment.type === 'Line' ||
      (comment.loc.start.line !== comment.loc.end.line);
};

}]  ],
[ConcreteScope.prototype, [function(){
this.gocLG =
function(gName) {
  var lg = this.getLG(gName);
  return lg || this.createLG(gName);
};

this.getLG =
function(gName) {
  var mname = _m(gName);
  if (this.liquidDefs.has(mname))
    return this.liquidDefs.get(mname);
  return null;
};

this.createLG =
function(gName) {
  var mname = _m(gName);
  ASSERT.call(this, this.getLG(gName) === null, 'LGr exists');
  var group = new LiquidGroup(gName);
  group.scope = this;
//group.newL();
  return this.liquidDefs.set(mname, group );
};

},
function(){


},
function(){
this.synth_boot =
function() {
  ASSERT.call(this, this.isSourceLevel(), 'script m');
  this.synth_boot_init();
  this.synth_externals();
  this.synth_defs_to(this);
};

this.synth_finish =
function() {
  this.synth_liquids_to(this);
};

this.synth_start =
function() {
  ASSERT.call(this, this.isSourceLevel(), 'script m');
  this.isBooted || this.synth_boot();
};

this.synth_liquids_to =
function(targetScope) {
  var list = this.liquidDefs, e = 0, len = list.length();
  while (e < len)
    this.synth_lg_to(list.at(e++), targetScope);
};

this.synth_externals =
function() {
  ASSERT.call(this, this.isSourceLevel(), 'script m');
  var list = this.parent.defs, e = 0, len = list.length()  ;
  while (e < len)
    this.synthGlobal(list.at(e++));
};

this.synth_lg_to =
function(lg, target) {
  var list = lg.list, e = 0;
  while (e < list.length)
    target.synthLiquid(list[e++]);
};

this.synth_boot_init =
function() {
  ASSERT.call(this, this.isBootable(), 'not bootable');
  ASSERT.call(this, !this.isBooted, 'scope has been already booted'); 
  if (this.synthNamesUntilNow === null)
    this.synthNamesUntilNow = new SortedObj();
  this.isBooted = true;
};

this.findSynth_m =
function(mname) {
  var sn = this.synthNamesUntilNow;
  return sn.has(mname) ? sn.get(mname) : null;
};

// can this name escape the current scope anyway?
// there is a difference between 'can' and 'do', of course -- a name could potentially escape a scope but still remain there because of a synth homonym.
// on the other hand, some names never escape a scope -- for example, an `arguments` never escapes an emitted function
this.synth_ref_may_escape_m =
function(mname) {
  ASSERT.call(this, this.isSourceLevel(), 'script m');
  return true;
};

// can this name get bound in the current scope anyway?
// there is a difference between being a valid binding name and being a valid binding -- any name that is not an `eval/arguments` (when strict) and is not reserved
// can be a valid binding name; but even then, they might remain invalid bindings, for example because they may be duplicates of an existing binding
this.synth_name_is_valid_binding_m =
function(mname) { return true; };

this.synth_ref_find_homonym_m =
function(mname) {
  ASSERT.call(this, this.isSourceLevel(), 'script m');
  this.isBooted || this.synth_boot();
  return this.findSynth_m(mname);
};

this.synth_decl_find_homonym_m =
function(mname) {
  ASSERT.call(this, this.isSourceLevel(), 'script m');
  this.isBooted || this.synth_boot();
  return this.findSynth_m(mname);
};

this.insertSynth_m =
function(mname, synth) {
  var sn = this.synthNamesUntilNow || (this.synthNamesUntilNow = new SortedObj());
  ASSERT.call(this, !sn.has(mname), '"'+mname+'" exists');
  return sn.set(mname, synth);
};

this.synthDecl =
function(decl) {
  ASSERT.call(this,
    decl.isFn() ||
    decl.isLet() ||
    decl.isConst() ||
    decl.isVar() ||
    decl.isFnArg(),
    'fun/let/const/var/fnarg'
  );

  ASSERT.call(this, decl.synthName === "", 'has synth');

  var rsList = decl.ref.rsList;
  var num = 0;
  var baseName = decl.name;
  var mname = "";
  var synthName = baseName;

  RENAME:
  do {
    mname = _m(synthName); 
    var l = 0;
    var synth = null;

    while (l < rsList.length) {
      var scope = rsList[l++];
      if (!scope.synth_ref_may_escape_m(mname))
        continue RENAME;

      synth = scope.synth_ref_find_homonym_m(mname);
      if (synth) {
        if (synth.isName() && synth.getAS() !== ATS_DISTINCT)
          synth = synth.source;
        if (synth !== decl)
          continue RENAME;
      }
    }

    if (num === 0 && !this.synth_name_is_valid_binding_m(mname)) // shortcut: num === 0 (because currently no invalid name contains a number)
      continue RENAME;

    synth = this.synth_decl_find_homonym_m(mname);
    if (synth) {
      if (synth.isName() && synth.getAS() !== ATS_DISTINCT)
        synth = synth.source;
      if (synth !== decl)
        continue RENAME;
    }

    break;
  } while (synthName = baseName + "" + (num+=1), true);

  decl.synthName = synthName;
  this.insertSynth_m(mname, decl);
};

this.synthGlobal =
function(global) {
  ASSERT.call(this, this.isSourceLevel(), 'script m');
  ASSERT.call(this, global.isGlobal(), 'not g');
  if (!global.mustSynth()) {
    ASSERT.call(this, global.synthName === "", 'synth name');
    global.synthName = global.name;
    return;
  }
  var rsList = global.ref.rsList;
  var num = 0;
  var name = global.name;
  var synthNames = [name, ""];

  var m = 0, mname = "";

  RENAME:
  do {
    while (m < synthNames.length) {
      mname = _m(synthNames[m++]);
      if (mname === _m("")) {
        ASSERT.call(this, num === 0, 'num');
        break RENAME;
      }
      var l = 0;
      while (l < rsList.length) {
        var scope = rsList[l++];
        if (!scope.synth_ref_may_escape_m(mname))
          continue RENAME;
        var synth = scope.synth_ref_find_homonym_m(mname);
        if (synth) {
          if (synth.isName() && synth.getAS() !== ATS_DISTINCT)
            synth = synth.source;
          if (synth !== global)
            continue RENAME;
        }
      }
    }

    break;
  } while (
    ++num,
    synthNames[0] = name + "" + num,
    synthNames[1] = name + "" + num + "u",
    true
  );

  global.synthName = synthNames[0];

  this.insertSynth_m(_m(synthNames[0]), global);
  if (num > 0)
    this.insertSynth_m(_m(synthNames[1]), global /* TODO: s/global/null/ */);
};

this.synthLiquid =
function(liquid) {
  ASSERT.call(this, liquid.isLiquid(), 'not liquid');
  ASSERT.call(this, liquid.synthName === "", 'has init');

  var rsList = liquid.ref.rsList;
  var num = 0;
  var baseName = liquid.name;
  var mname = "";
  var synthName = baseName;

  RENAME:
  do {
    mname = _m(synthName);
    var l = 0;

    while (l < rsList.length) {
      var scope = rsList[l++ ];
      if (!scope.synth_ref_may_escape_m(mname))
        continue RENAME;

      if (scope.synth_ref_find_homonym_m(mname))
        continue RENAME;
    }

    if (!this.synth_name_is_valid_binding_m(mname))
      continue RENAME;

    if (this.synth_decl_find_homonym_m(mname))
      continue RENAME;

     break;
  } while (synthName = baseName + "" + (num+=1), true);

  liquid.synthName = synthName;
  this.insertSynth_m(mname, liquid );
};

}]  ],
[Decl.prototype, [function(){
this.mustSynth =
function() {
  if (this.msynth !== -1)
    return this.msynth;

  var list = this.ref.rsList, e = 0, scope = null, msynth = 0;
  while (e < list.length) {
    scope = list[e++ ];
    if (scope.isAnyFn() && scope.scopeName) {
      var sn = scope.scopeName;
      if (sn.getAS() !== ATS_DISTINCT)
        sn = sn.source;
      if (this !== sn) {
        msynth = 1;
        break;
      }
    }
  }

  if (msynth === 0) {
    var mname = _m(this.name);
    e = 0;
    while (e < list.length)
      list[e++].insertSynth_m(mname, this);
  }

  return this.msynth = msynth;
};

},
function(){
this.s =
function(s) {
  ASSERT_EQ.call(this, this.site, null);
  this.site = s;
  return this;
};

this.r =
function(r) {
  ASSERT_EQ.call(this, this.ref, null);
  ASSERT_EQ.call(this, r.targetDecl, null);
  ASSERT_EQ.call(this, r.hasTarget, false);
  this.ref = r;
  r.targetDecl = this;
  r.hasTarget = true;
  return this;
};

this.n =
function(n) {
  ASSERT_EQ.call(this, this.name, "");
  this.name = n;
  return this;
};

this.t =
function(t) {
  ASSERT_EQ.call(this, this.type, DT_NONE);
  this.type = t;
  return this;
};

this.referTo =
function(target) {
  var ref = this.ref;
  ASSERT.call(this, this.ref.scope.isSourceLevel(), 'source level');
  ASSERT.call(this, this !== target.ref.getDecl(), 'not itself');
  ref.cut();
  target.ref.updateRSList(ref.rsList);
  target.ref.updateStats(ref.i, ref.d );
  target.ref.rsList.push(ref.scope);
  ref.hasTarget = false;
  ref.targetDecl = null;
  this.ref.parentRef = target.ref;
  return this;
};

this.activateTZ =
function() {
  if (this.hasTZCheck)
    return false;
  this.hasTZCheck = true;
  this.ref.scope.activateTZ();
  return true;
};

this.isReached =
function() {
  return this.reached && this.reached.v;
};

},
function(){
this.isLet =
function() { return this.type & DT_LET; };

this.isVar =
function() { return this.type & DT_VAR; };

this.isConst =
function() { return this.type & DT_CONST; };

this.isGlobal =
function() { return this.type & DT_GLOBAL; };

this.isFn =
function() { return this.type & DT_FN; };

this.isFnArg =
function() { return this.type & DT_FNARG; };

this.isCls =
function() { return this.type & DT_CLS; };

this.isCatchArg =
function() { return this.type & DT_CATCHARG; };

this.isTemporal =
function() {
  if (this.isFnArg())
    return !this.ref.scope.inBody;
  if (this.isCatchArg())
    return !this.ref.scope.inBody;
  if (this.isFn())
    return false;

  return this.isCls() || this.isLexicalLike();
};

this.isLLINOSA =
function() {
  return this.isLexicalLike() &&
    this.ref.scope.insideLoop() &&
    this.ref.i;
};

this.isLiquid =
function() { return this.type & DT_LIQUID; };

var _HOISTED = DT_FN|DT_VAR;
this.isHoisted =
function() { return this.type & _HOISTED; };

var _ARG = DT_FNARG|DT_CATCHARG;
this.isArg =
function() { return this.type & _ARG; };

var _LEXICAL = DT_CLS|DT_LET|DT_CONST;
this.isLexicalLike =
function() {
  if (this.isFn())
    return this.ref.scope.isLexicalLike();
  return this.type & _LEXICAL;
};

// TODO: CATCHARG
var _VARLIKE = DT_FNARG|DT_VAR;
this.isVarLike =
function() {
  if (this.isFn())
    return !this.ref.scope.isLexical();
  return this.type & _VARLIKE;
};

var _OVERRIDABLE = DT_CATCHARG|_VARLIKE;
this.isOverridableByVar =
function() { return this.type & _OVERRIDABLE; };

this.isIDefault =
function() { return this.type & DT_IDEFAULT; };

this.isIAliased =
function() { return this.type & DT_IALIASED; };

this.isINamespace =
function() { return this.type & DT_INAMESPACE; };

this.isImported =
function() {
  return this.isIDefault() || this.isIAliased() || this.isINamespace();
};

this.isEDefault =
function() { return this.type & DT_EDEFAULT; };

this.isEAliased =
function() { return this.type & DT_EALIASED; };

this.isESelf =
function() { return this.type & DT_ESELF; };

this.isExported =
function() {
  return this.isEDefault() || this.isEAliased() || this.isESelf();
};

this.isName =
function() { return this.type & (DT_FNNAME|DT_CLSNAME); };

this.isInsignificant =
function() { return this.type & DT_INFERRED; };

this.isImmutable =
function() {
  return this.isConst() || this.isName();
};

// renamed global
this.isRG =
function() {
  return this.isGlobal() && this.name !== this.synthName;
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
function(n, flags, isStmt) {
  return this.emitAny(n, flags|EC_EXPR_HEAD|EC_NON_SEQ, isStmt);
};

this.eH = function(n, flags, isStmt) {
  this.emitHead(n, flags, isStmt);
  return this;
};

this.emitAny = function(n, flags, isStmt) {
  if (HAS.call(Emitters, n.type))
    return Emitters[n.type].call(this, n, flags, isStmt);
  this.err('unknow.node');
};

this.eA = function(n, flags, isStmt) {
  this.emitAny(n, flags, isStmt); 
  return this; 
};

this.emitNonSeq = function(n, flags, isStmt) {
  this.emitAny(n, flags|EC_NON_SEQ, isStmt);
};

this.eN = function(n, flags, isStmt) {
  this.emitNonSeq(n, flags, isStmt);
  return this;
};

this.write = function(rawStr) {
  ASSERT.call(this, rawStr !== "",
    'not allowed to write empty strings to output');

  if (this.hasOnW()) {
    this.invW(rawStr);
    this.clearOnW();
  }

  if (this.hasLine) {
    this.hasLine = false;
    this.l();
  }

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
    while (indentLen >= cache.length)
      cache.push(cache[cache.length-1] + this.spaceString);
  }
  return cache[indentLen];
};

// swap code
this.sc =
function(c) {
  var c0 = this.code;
  this.code = c;
  return c0;
};

this.startLine = function() {
  this.insertNL();
  this.lineStarted = true;
};

this.ac =
function(c) {
  this.code += c;
  return this;
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

this.emitCallHead = function(n, flags) {
  return this.eH(n, flags|EC_CALL_HEAD, false);
};

this.emitNewHead = function(n) {
  return this.eH(n, EC_NEW_HEAD, false);
};

// write shadow line; differs from `l() in that a newline is only inserted if something comes after it
this.wsl =
function() {
  if (!this.hasLine)
    this.hasLine = true;
  return this;
};

this.csl =
function() {
  if (this.hasLine) {
    this.hasLine = false;
    return true;
  }
  return false;
};

},
function(){
// write a string value as an ECMAScript string, but without quotes
this.writeStringValue =
function(sv) {
  var ch = -1, len = sv.length, o = 0, luo = o;
  while (o<len) {
    ch = sv.charCodeAt(o);
    if (!this.isStringCh(ch)) {
      if (luo<o)
        this.w(sv.substring(luo,o));

      this.w(this.stringEscapeFor(ch));
      luo=o+1  ;
    }
    o++;
  }

  if (luo<o)
    this.w(sv.substring(luo,o));

  return this;
};

this.isStringCh =
function(ch) {
  switch (ch) {
  case CH_BACK_SLASH:
  case CH_SINGLE_QUOTE:
  case CH_MULTI_QUOTE:
    return false;
  }

  return ch <= CH_COMPLEMENT && ch >= CH_WHITESPACE;
};

this.stringEscapeFor =
function(ch) {
  switch (ch) {
  case CH_BACK_SLASH: return '\\\\';
  case CH_SINGLE_QUOTE: return '\\\'';
  case CH_MULTI_QUOTE: return '\\\"';
  case CH_VTAB: return '\\v';
  case CH_BACK: return '\\b';
  case CH_FORM_FEED: return '\\f';
  case CH_TAB: return '\\t';
  case CH_CARRIAGE_RETURN: return '\\r';
  case CH_LINE_FEED: return '\\n';
  default:
    if (ch<=0xFF)
      return '\\x'+hex2(ch);

    ASSERT.call(this, ch <= 0xFFFF, 'ch not a 16bit');
    return '\\u'+hex(ch);
  }
};

this.writeIDName =
function(nameStr) {
  return this.w(nameStr);
};

this.wsndl =
function(list) {
  var e = 0;
  while (e < list.length) {
    e && this.wm(',',' ');
    this.writeIDName(list[e].synthName);
    ++e ;
  }
  return true;
};

this.writeMemName =
function(memName, asStr) {
  switch (memName.type) {
  case 'Literal':
    return this.eA(memName, EC_NONE, false);
  case 'Identifier':
    return asStr ?
      this.w("'").writeStringValue(memName.name).w("'") :
      this.writeIDName(memName.name);
  }
  ASSERT.call(this, false, 'unknown name');
};

this.emitCommaList =
function(list, flags) {
  var e = 0;
  while (e < list.length) {
    if (e) this.wm(',',' ');
    this.eN(list[e], flags, false);
    if (e === 0) flags &= EC_IN;
    e++;
  }
  return this;
};

this.emitBody =
function(stmt) {
  switch (stmt.type) {
  case 'BlockStatement':
    this.s();
  case 'EmptyStatement':
    this.eA(stmt, EC_START_STMT, true);
    return true;
  }
  this.l().i();
  var em = this.emitAny(stmt, EC_START_STMT, true);
  this.u();
  if (em)
    return true;
  this.w(';'); // TODO: else; rather than else[:newline:]  ;
  return false;
};

this.emitStmtList =
function(list) {
  var emittedSoFar = 0, e = 0;
  var em = 0, hasOnW = this.hasOnW();
  while (e < list.length) {
    this.eA(list[e++], EC_START_STMT, true);
    if (hasOnW && !this.hasOnW()) {
      ++em;
      this.onW(onW_line);
      hasOnW = this.hasOnW();
    }
  }

  em && this.hasOnW() && this.clearOnW();
  return emittedSoFar;
};

this.emitSAT =
function(n, flags) {
  if (n.type === 'MemberExpression')
    return this.emitSAT_mem(n, flags);
  if (isResolvedName(n))
    return this.emitRName_SAT(n, flags);

  ASSERT.call(this, false, 'got <'+n.type+'>');
};

this.emitWrappedInV =
function(n) {
  this.wm('{','v',':').s().eN(n, EC_NONE, false).w('}');
  return true;
};

this.v =
function() {
  return this.wm('.','v');
};

this.emitSpread =
function(n) { this.jz('sp').w('(').eN(n.argument, EC_NONE, false).w(')'); };

// a, b, e, ...l -> [a,b,e],sp(l)
// a, b, e, l -> a,b,e,l
this.emitElems =
function(list, selem /* i.e., it contains a spread element */) {
  var e = 0, em = 0;
  while (e < list.length) {
    em && this.w(',').s();
    var elem = list[e];
    if (elem && elem.type === 'SpreadElement') {
      this.emitSpread(elem);
      e++;
    }
    else {
      var br = selem || em;
      br && this.w('[');
      e = this.emitElems_toRest(list, e);
      br && this.w(']');
    }
    ++em;
  }
  return true;
};

this.emitElems_toRest =
function(list, s) {
  var e = s;
  while (e < list.length) {
    var elem = list[e];
    if (elem && elem.type === 'SpreadElement')
        break;
    e > s && this.w(',').s();
    if (elem)
      this.eN(elem, EC_NONE, false);
    else
      this.w('void').s().w('0');
    ++e; 
  }
  return e;
};

this.emitAccessChk_tz =
function(nd) {
  ASSERT.call(this, nd.hasTZCheck, 'unnecessary tz');
  var scope = nd.ref.scope;
  ASSERT.call(this, scope.hasTZCheckPoint, 'could not find any tz');
  var tz = scope.scs.getLG('tz').getL(0);
  this.wm(tz.synthName,'<',nd.idx,'&&').jz('tz').wm('(','\'').writeStringValue(nd.name).wm('\'',')');
  return true;
};

this.emitAccessChk_invalidSAT =
function(nd) {
  this.jz('cc').wm('(','\'').writeStringValue(nd.name).wm('\'',')');
  return true;
};

},
function(){
this.emitHead_temps =
function(scope, isScript) {
  var temps = scope.getLG('<t>'), e = 0, len = temps.length();
  while (e < len) {
    this.w(e ? ',' : 'var').s();
    this.w(temps.at(e++).synthName);
  }
  e && this.w(';');
  return this;
};

this.emitHead_vars =
function(scope, isScript) {
  var vars = scope.defs, e = 0, len = vars.length(); 
  var em = 0, v = null;
  while (e < len) {
    v = vars.at(e++);
    if (v.isVar() && v.isFn()) {
      this.w(em ? ',' : 'var').s().w(v.synthName);
      em++;
    }
  }
  em && this.w(';');
};

this.emitHead_fns =
function(scope, isScript) {
  var list = scope.funLists, e = 0, len = list.length();
  var onw = this.hasOnW(), em = 0;
  while (e < len) {
    this.emitFunList(list.at(e++));
    if (onw && !this.hasOnW()) {
      ++em;
      this.onW(onW_line);
      onw = this.hasOnW();
    }
  }
  em && this.hasOnW() && this.clearOnW();
};

this.emitHead_llinosa =
function(scope, isScript) {
  var list = scope.defs, e = 0, len = list.length();
  var em = 0, item = null;
  while (e < len) {
    item = list.at(e++ );
    if (item.isLLINOSA()) {
      this
        .w(em ? ',' : 'var').s().w(item.synthName)
        .s().w('=').s()
        .wm('{','v',':','void',' ','0','}');
      ++em
    }
  }
  if (e > 0) this.w(';');
};

},
function(){
Emitters['ArrayExpression'] =
function(n, flags, isStmt) {
  var si = n['#si'];
  var hasParen = false;
  if (si >= 0) {
    hasParen = flags & EC_NEW_HEAD;
    hasParen && this.w('(');
    this.jz('arr').w('(');
  }

  this.emitElems(n.elements, true);

  si >= 0 && this.w(')');
  hasParen && this.w(')');

  isStmt && this.w(';');
  return true;
};

},
function(){
this.emitAssignment_ex =
function(n, flags, isStmt) {
  var hasParen = flags & EC_EXPR_HEAD;
  var cc = false;
  var left = n.left;
  var tz = false;
  var target = null;

  if (isResolvedName(left)) {
    target = left.target;
    tz = left.tz;
    cc = target.isImmutable()
    if (!hasParen)
      hasParen = tz || cc;
  }
  if (hasParen) { this.w('('); flags = EC_NONE; }

  tz && (this.emitAccessChk_tz(target), this.w(',').s());
  cc && (this.emitAccessChk_invalidSAT(target), this.w(',').s());

  this.emitSAT(left, flags);

  this.s();
  if (n.operator === '**=') {
    ASSERT.call(this, isResolvedName(n.left), 'not rn');
    this.w('=').s().jz('ex')
        .w('(').eN(n.left, EC_NONE, false)
        .w(',').s().eN(n.right, flags & EC_IN, false)
        .w(')');
  }
  else {
    this.w(n.operator).s().eN(n.right, flags & EC_IN, false);
  }

  hasParen && this.w(')');
  isStmt && this.w(';');
  return true;
};

Emitters['AssignmentExpression'] = this.emitAssignment_ex;

Emitters['#SynthAssig'] =
function(n, flags, isStmt) {
  if (n.binding && !n.left.target.isVar() && !n.left.target.isLLINOSA())
    return this.emitAssignment_binding(n, flags, isStmt);
  return this.emitAssignment_ex(n, flags, isStmt);
};

this.emitAssignment_binding =
function(n, flags, isStmt) {
  this.w('var').s().emitRName_binding(n.left);
  this.s().w('=').s();
  if (n.left.target.isLLINOSA())
    this.emitWrappedInV(n.right);
  else
    this.eN(n.right, flags, false);

  this.w(';');
};

},
function(){
this.emitBLE =
Emitters['LogicalExpression'] =
Emitters['BinaryExpression'] =
function(n, flags, isStmt) {
  var hasParen = flags & EC_EXPR_HEAD;
  if (hasParen) { this.w('('); flags = EC_NONE; }
  var o = n.operator;
  if (o === '**')
    return this.emitPow(n, flags, isStmt);

  var left = n.left, right = n.right;
  if (isBLE(left))
    this.emitLeft(left, o, flags);
  else
    this.emitBLEP(left, flags);

  this.wm(' ',o,' ');

  if (isBLE(right))
    this.emitRight(right, o, EC_NONE);
  else
    this.emitBLEP(right, EC_NONE);

  hasParen && this.w(')');
  isStmt && this.w(';');
  return true; // something was actually emitted
};

this.emitRight = 
function(n, o, flags) {
  var hasParen = false;
  var rp = bp(n.operator), lp = bp(o);

  if (lp>rp)
    hasParen = true;
  else if (lp === rp)
    hasParen = isLA(rp);

  if (hasParen) { this.w('('); flags = EC_NONE; }
  this.emitBLE(n, flags, false);
  hasParen && this.w(')');
};

this.emitLeft =
function(n, o, flags) {
  var hasParen = false;
  var rp = bp(o), lp = bp(n.operator);

  if (lp<rp)
    hasParen = true;
  else if (lp === rp)
    hasParen = isRA(lp) ;

  if (hasParen) { this.w('('); flags = EC_NONE; }
  this.emitBLE(n, flags, false);
  hasParen && this.w(')');
};

this.emitBLEP =
function(n, flags) {
  switch (n.type) {
  case 'UnaryExpression': // it has a higher pr than any other op
  case 'UpdateExpression':
    return this.emitAny(n, flags, false);
  }
  return this.emitHead(n, flags, false);
};

this.emitPow =
function(n, flags, isStmt) {
  var hasParen = flags & EC_NEW_HEAD;
  if (hasParen) { this.w('('); flags = EC_NONE; }
  this.jz('ex').w('(').eN(n.left).w(',').s().eN(n.right).w(')');
  hasParen && this.w(')');
  isStmt && this.w(';');
  return true;
};

function isBLE(n) {
  switch (n.type) {
  case 'BinaryExpression':
  case 'LogicalExpression':
    return true;
  default:
    return false;
  }
}

},
function(){
Emitters['BlockStatement'] =
function(n, flags, isStmt) {
  ASSERT_EQ.call(this, isStmt, true);
  this.w('{');
  this.i().onW(onW_line);
  this.emitStmtList(n.body);
  this.u();
  this.hasOnW() ? this.clearOnW() : this.l();
  this.w('}');
  return true;
};

},
function(){
Emitters['CallExpression'] =
function(n, flags, isStmt) {
  var hasParen = flags & EC_NEW_HEAD;
  if (hasParen) { this.w('('); flags = EC_NONE; }
  this.emitCallHead(n.callee, flags);
  this.w('(').emitCommaList(n.arguments);
  this.w(')');

  hasParen && this.w(')');
  isStmt && this.w(';');
};

},
function(){
Emitters['ConditionalExpression'] =
function(n, flags, isStmt) {
  var hasParen = flags & EC_EXPR_HEAD;
  if (hasParen) { this.w('('); flags = EC_NONE; }
  this.emitCondTest(n.test, flags);
  this.wm(' ','?',' ').eN(n.consequent, EC_NONE, false);
  this.wm(' ',':',' ').eN(n.alternate, EC_NONE, false);
  hasParen && this.w(')');
  isStmt && this.w(';');
};

this.emitCondTest = function(n, prec, flags) {
  var hasParen = false;
  switch (n.type) {
  case 'AssignmentExpression':
  case 'ConditionalExpression':
    hasParen = true;
  }

  if (hasParen) { this.w('('); flags = EC_NONE; }
  this.eN(n, false, flags);
  if (hasParen) this.w(')');
};

},
function(){
Emitters['EmptyStatement'] =
function(n, flags, isStmt) {
  ASSERT_EQ.call(this, isStmt, true);
  this.w(';');
  return true;
};

},
function(){
Emitters['ExpressionStatement'] =
function(n, flags, isStmt) {
  ASSERT_EQ.call(this, isStmt, true);
  ASSERT.call(this, flags & EC_START_STMT, 'must be in stmt context');
  return this.emitAny(n.expression, flags, true);
};

},
function(){
Emitters['IfStatement'] =
function(n, flags, isStmt) {
  ASSERT_EQ.call(this, isStmt, true);
  this.wm('if',' ','(').eA(n.test, EC_NONE, false).w(')').emitIfBody(n.consequent);
  n.alternate && this.l().w('else').emitElseBody(n.alternate);
  return true;
};

this.emitIfBody =
function(stmt) {
  switch (stmt.type) {
  case 'BlockStatement':
    this.s();
  case 'EmptyStatement':
    return this.emitAny(stmt, EC_START_STMT, true);
  }
  if (stmt.type === 'ExpressionStatement') {
    this.i();
    var em = this.l().emitAny(stmt, EC_START_STMT, true);
    this.u();
    return em;
  }
  this.s().w('{').i().wsl();
  this.emitAny(stmt, EC_START_STMT, true) ? this.wsl() : this.csl();
  this.u().w('}');
  return true;
};

this.emitElseBody =
function(stmt) {
  if (stmt.type === 'IfStatement')
    return this.s().emitAny(stmt, EC_START_STMT, true);
  return this.emitBody(stmt);
};

},
function(){
Emitters['Literal'] =
function(n, flags, isStmt) {
  switch (typeof n.value) {
  case STRING_TYPE: 
    this.w("'").writeStringValue(n.value).w("'");
    break;
  case BOOL_TYPE: 
    this.w(n.value ? 'true' : 'false');
    break;
  case NUMBER_TYPE:
    this.w(n.value+"");
    break;
  default:
    ASSERT.call(this, false, 'unknown value');
    break;
  }
  isStmt && this.w(';');
  return true;
};

},
function(){
Emitters['MemberExpression'] =
function(n, flags, isStmt) {
  this.eH(n.object, flags, false);
  if (n.computed)
    this.w('[').eA(n.property, EC_NONE, false).w(']');
  else
    this.dot().writeIdName(n.property);
  return true;
};

this.emitSAT_mem = Emitters['MemberExpression'];

},
function(){
Emitters['NewExpression'] =
function(n, flags, isStmt) {
  var si = findElem(n.arguments, 'SpreadElement');
  if (si === -1) {
    this.w('new').s().emitNewHead(n.callee);
    this.w('(').emitCommaList(n.arguments).w(')');
  } else {
    var hasParen = flags & EC_NEW_HEAD;
    if (hasParen) { this.w('('); flags = EC_NONE; }
    this.jz('n').w('(').eN(n.callee, EC_NONE, false).wm(',',' ')
      .jz('arr').w('(').emitElems(n.arguments, si >= 0);

    this.w(')').w(')');
    hasParen && this.w(')');
  }

  isStmt && this.w(';');
  return true;
};

},
function(){
Emitters['ObjectExpression'] =
function(n, flags, isStmt) {
  var list = n.properties, ci = n['#ci'], e = 0;
  var hasParen = false;
  if (ci >= 0) {
    hasParen = flags & EC_NEW_HEAD;
    hasParen && this.w('(');
    this.jz('obj').w('(');
  } else {
    hasParen = flags & EC_START_STMT;
    hasParen && this.w('(');
  }
  this.w('{');

  var item = null, last = ci >= 0 ? ci : list.length;
  while (e < last) {
    item = list[e];
    if (e) this.w(',').s();
    this.writeMemName(item.key, false).w(':').s().eN(item.value, EC_NONE, false);
    e++;
  }

  this.w('}');

  if (ci >= 0) {
    while (e < list.length) {
      this.w(',').s();
      item = list[e];
      if (item.computed)
        this.eN(item.key, EC_NONE, false);
      else
        this.w("'")
            .writeMemName(item.key, true).w("'");
      this.w(',').s().eN(item.value, EC_NONE, false);
      e++;
    }
    this.w(')');
  }

  hasParen && this.w(')');

  isStmt && this.w(';');
  return true;
};

},
function(){
Emitters['SequenceExpression'] =
function(n, flags, isStmt) {
  var hasParen = flags & (EC_EXPR_HEAD|EC_NON_SEQ);
  if (hasParen) { this.w('('); flags = EC_NONE; }
  this.emitCommaList(n.expressions, flags);
  hasParen && this.w(')');
  isStmt && this.w(';');
  return true;
};

},
function(){
Emitters['SwitchStatement'] =
function(n, flags, isStmt) {
  this.wm('switch',' ','(').eA(n.discriminant, EC_NONE, false).wm(')',' ','{');
  this.onW(onW_line);
  this.emitStmtList(n.cases);
  this.hasOnW() ? this.clearOnW() : this.l();
  this.w('}');
  return true;
};

Emitters['SwitchCase'] =
function(n, flags, isStmt) {
  n.test === null ? this.w('default') : this.wm('case',' ').eA(n.test, EC_NONE, false);
  this.w(':').i().onW(onW_line);
  this.emitStmtList(n.consequent);
  this.u();
  this.hasOnW() && this.clearOnW();
  return true;
};

},
function(){
Emitters['UnaryExpression'] = 
function(n, flags, isStmt) {
  var o = n.operator;
  var hasParen = flags & EC_EXPR_HEAD;
  if (hasParen) { this.w('('); flags = EC_NONE; }
  var lastChar = this.code.charAt(this.code.length-1) ;
  lastChar === o && this.s();
  this.w(o);

  switch (o) {
  case 'void': case 'delete': case 'typeof':
    this.s();
  }

  this.emitUA(n.argument);
  hasParen && this.w(')');
  isStmt && this.w(';');
  return true;
};

this.emitUA = function(n) {
  switch (n.type) {
  case 'UnaryExpression':
  case 'UpdateExpression':
    return this.emitAny(n, EC_NONE, false);
  }
  return this.emitHead(n, EC_NONE, false);
};

},
function(){
Emitters['#Untransformed'] = 
function(n, flags, isStmt) {
  return UntransformedEmitters[n.kind].call(this, n, flags, isStmt);
};

},
function(){
Emitters['UpdateExpression'] =
function(n, flags, isStmt) {
  var hasParen = flags & EC_EXPR_HEAD;
  if (hasParen) { this.w('('); flags = EC_NONE; }
  var o = n.operator;
  if (n.prefix) {
    if (this.code.charCodeAt(this.code.length-1) === o.charCodeAt(0))
      this.s();
    this.w(o);
    flags = EC_NONE;
  }
  this.emitSAT(n.argument, flags);
  if (!n.prefix)
    this.w(o);
  hasParen && this.w(')');
  isStmt && this.w(';');
  return true;
};

},
function(){
Emitters['WhileStatement'] =
function(n, flags, isStmt) {
  this.wm('while',' ','(').eA(n.test, EC_NONE, false).w(')').emitBody(n.body);
  return true;
};

},
function(){
this.emitExprFn =
function(n, flags, isStmt) {
  var hasParen = flags & EC_START_STMT;
  var raw = n.fun;
  var scope = raw['#scope'];
  var scopeName = scope.scopeName;
  var lonll = scope.getNonLocalLoopLexicals();
  var isRenamed = scopeName && scopeName.name !== scopeName.synthName;
  var hasWrapper = isRenamed || lonll;
  if (hasWrapper) {
    if (!hasParen)
      hasParen = flags & EC_NEW_HEAD;
  }

  if (hasParen) { this.w('('); flags = EC_NONE; }
  if (hasWrapper) {
    this.wm('function','(');
    lonll && this.wsndl(lonll);
    this.w(')').s().w('{').i().l();
    if (isRenamed)
      this.wm('var',' ',scopeName.synthName,' ','=',' ');
    else
      this.wm('return').noWrap().s();
  }
  this.emitTransformedFn(n);
  if (hasWrapper) {
    this.w(';');
    if (isRenamed)
      this.l().w('return').noWrap().s().w(scopeName.synthName).w(';');
    this.u().l().wm('}','(');
    lonll && this.wsndl(lonll);
    this.w(')');
  }
  hasParen && this.w(')');
  isStmt && this.w(';');
};

},
function(){
Emitters['DoWhileStatement'] =
function(n, flags, isStmt) {
  ASSERT_EQ.call(this, isStmt, true);
  this.wm('do',' ','{').i().wsl();
  this.emitAny(n.body, EC_START_STMT, true ) ?
    this.wsl() : this.csl();
  this.u().wm('}',' ','while',' ','(').eA(n.test, EC_NONE, false).wm(')',';');
  return true;
};

},
function(){
Emitters['Program'] =
function(n, flags, isStmt) {
  this.emitStmtList(n.body);
  return true;
};

},
function(){
UntransformedEmitters['arg-at'] =
function(n, flags, isStmt) {
  ASSERT_EQ.call(this, isStmt, false);
  this.wm('arguments','[');
  this.wm(n.idx+"",']');

  return true;
};

UntransformedEmitters['arg-rest'] =
function(n, flags, isStmt) {
  ASSERT_EQ.call(this, isStmt, true);

  var l = n.left;
  ASSERT.call(this, isResolvedName(l) || isTemp(l), 'neither id nor temp');
  this.eA(l, EC_NONE, false)
    .wm(' ','=',' ','[',']',';').l()
    .wm('while',' ','(').eA(l, EC_NONE, false)
    .wm('.','length')
    .wm('+',n.idx+"",' ','<',' ','arguments','.','length',')').i().l()
    .eA(l, EC_NONE, false).w('[').eA(l, EC_NONE, false).wm('.','length')
    .w(']')
    .wm(' ','=',' ','arguments','[','arguments','.','length','+',n.idx,']',';').u();
  return true;
};

},
function(){


},
function(){


},
function(){
UntransformedEmitters['arr-iter-get'] =
function(n, flags, isStmt) {
  this.eA(n.iter, EC_NONE, false).wm('.','get');
  this.wm('(',')');
  isStmt && this.w(';');
  return true;
};

UntransformedEmitters['arr-iter-end'] =
function(n, flags, isStmt) {
  this.eA(n.iter).wm('.','end');
  this.wm('(',')');
  isStmt && this.w(';');
  return true;
};

UntransformedEmitters['arr-iter'] =
function(n, flags, isStmt) {
  this.jz('arrIter').w('(').eN(n.iter).w(')');
  return true;
};

UntransformedEmitters['arr-iter-get-rest'] =
function(n, flags, isStmt) {
  return this.eA(n.iter).wm('.','rest').wm('(',')'), true;
};

},
function(){
UntransformedEmitters['assig-list'] =
function(n, flags, isStmt) {
  if (isStmt)
    return this.emitStmtList(n.list);

  var hasParen = flags & (EC_EXPR_HEAD|EC_NON_SEQ);
  if (hasParen) { this.w('('); flags &= EC_IN; }
  this.emitCommaList(n.list, flags);
  hasParen && this.w(')');
  return true;
};

},
function(){
UntransformedEmitters['call'] = 
function(n, flags, isStmt) {
  var hasParen = flags & EC_NEW_HEAD;
  if (hasParen) { this.w('('); } 
  if (n.mem !== null)
    this.jz('cm').w('(').eN(n.head, EC_NONE, false)
      .w(',').s().eN(n.mem, EC_NONE, false);
  else
    this.jz('c').w('(').eN(n.head, EC_NONE, false);

  this.w(',').s();
  this.jz('arr').w('(').emitElems(n.list, true);
  this.w(')').w(')');
  
  hasParen && this.w(')');
  isStmt && this.w(';');

  return true;
};

},
function(){
UntransformedEmitters['global-update'] =
function(n, flags, isStmt) {
  var hasParen = flags & EC_NEW_HEAD;
  var td = (n.isU ? n.assig.argument : n.assig.left).target;
  hasParen && this.w('(');
  this.wm(td.synthName+'u','(').eN(n.assig, EC_NONE, false).w(')');
  hasParen && this.w(')');
  isStmt && this.w(';');
  return true;
};

},
function(){
UntransformedEmitters['obj-iter'] =
function(n, flags, isStmt) {
  this.jz('objIter').w('(').eN(n.iter).w(')');
  return true;
};

UntransformedEmitters['obj-iter-end'] =
function(n, flags, isStmt) {
  ASSERT_EQ.call(this, isStmt, false);
  this.eH(n.iter);
  this.wm('.','val');
  return true;
};

UntransformedEmitters['obj-iter-get'] =
function(n, flags, isStmt) {
  this.eH(n.iter).wm('.','get','(');
  if (n.computed)
    this.eN(n.idx);
  else
    this.writeMemName(n.idx, true);
  this.w(')');
  return true;

};

},
function(){
if (false)
UntransformedEmitters['resolved-name'] =
function(n, flags, isStmt) {
  var str = n.target.ref.scope.scopeID+':'+n.target.name;
  str += '#['+n.target.synthName+']';
  if (n.tz) str += '::tz';
  this.w(str);
  isStmt && this.w(';');
  return true;
};

var bes = {};
UntransformedEmitters['resolved-name'] =
function(n, flags, isStmt) {
  return bes[n.bes].call(this, n, flags, isStmt);
};

bes['ex'] = this.emitRName_ex =
bes['sat'] = this.emitRName_SAT =
function(n, flags, isStmt) {
  var hasParen = false;
  var hasZero = false;
  var tv = n.target.isLLINOSA(); // tail v
  if (tv)
    hasZero = hasParen = flags & EC_CALL_HEAD;
  if (hasParen) { this.w('('); flags = EC_NONE; }
  hasZero && this.wm('0',',');
  this.w(n.target.synthName);
  tv && this.v();
  hasParen && this.w(')');
  isStmt && this.w(';');
  return true;
};

bes['binding'] = this.emitRName_binding =
function(n, flags, isStmt) {
  ASSERT.call(this, isResolvedName(n), 'rn');
  return this.w(n.target.synthName), true;
};

},
function(){
UntransformedEmitters['synth-name'] =
function(n, flags, isStmt) {
  this.w(n.liq.synthName);
  return true;
};

},
function(){


},
function(){
UntransformedEmitters['temp'] =
function(n, flags, isStmt) {
  this.w(n.liq.name+n.liq.idx);
  return true;
};

UntransformedEmitters['temp-save'] =
function(n, flags, isStmt) {
  var hasParen = flags & EC_EXPR_HEAD;
  if (hasParen) { this.w('('); flags &= EC_IN; }
  this.eA(n.left, flags, false).s().w('=').s().eN(n.right, flags & EC_IN, false);
  hasParen && this.w(')');
  isStmt && this.w(';');
  return true;
};

},
function(){
UntransformedEmitters['transformed-fn'] =
function(n, flags, isStmt) {
  return n.target ?
    this.emitDeclFn(n, flags, isStmt) :
    this.emitExprFn(n, flags, isStmt);
};

this.emitTransformedFn =
function(n, flags, isStmt) {
  this.wm('function');
  var raw = n.fun;
  var scopeName = raw['#scope'].scopeName;
  if (scopeName) {
    this.s();
    this.writeIDName(scopeName.name);
  }
  this.w('(');

  if (raw.params)
    this.emitCommaList(raw.params);
  this.wm(')',' ','{').i().onW(onW_line);

  if (n.argsPrologue)
    this.eA(n.argsPrologue, EC_START_STMT, true);

  var em = 0;
  this.hasOnW() ? this.clearOnW() : em++;

  this.onW(onW_line);
  this.emitStmtList(raw.body.body);

  this.u();
  this.hasOnW() ? this.clearOnW() : em++;

  em && this.l();

  this.w('}');
};

},
function(){
UntransformedEmitters['u'] =
function(n, flags, isStmt) {
  this.jz('u').w('(').eN(n.value).w(')');
  return true;
};

},
function(){
UntransformedEmitters['ucond'] =
function(n, flags, isStmt) {
  return Emitters['ConditionalExpression'].call(this, n, flags, isStmt);
};

},
function(){

},
function(){
this.onW =
function() {
  ASSERT.call(this, arguments.length >= 1, 'arguments');
  ASSERT.call(this, this.onWrite_fun === null, 'onWrite_fun');
  this.onWrite_fun = arguments[0];
  this.onWrite_arg = arguments.length > 1 ? arguments[1] : null;
};

this.hasOnW =
function() { return this.onWrite_fun ; };

this.clearOnW =
function() {
  ASSERT.call(this, this.hasOnW(), 'hasOnW');
  this.onWrite_fun = null;
  this.onWrite_arg = null;
};

this.invW =
function(rawStr) { return this.onWrite_fun(); };

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

this.exitUniqueArgs =
function() {
  ASSERT.call(this, !this.inBody,
    'must be in args');
  ASSERT.call(this, this.insideUniqueArgs(),
    'must be in unique args');
  this.flags &= ~SF_UNIQUE;
};

this.enterUniqueArgs =
function() {
  if (!this.canDup())
    return;

  this.verifyUniqueArgs();
  this.flags |= SF_UNIQUE;
};

this.verifyUniqueArgs =
function() { this.firstDup && this.parser.err('argsdup'); };

},
function(){
this.canDup =
function() {
  ASSERT.call(this, !this.inBody,
    'canDup allowed in args only');
  return !this.insideUniqueArgs() &&
         !this.insideStrict();
};

},
function(){
this.setRefsAndArgRefs =
function(refs) {
  ASSERT.call(this, !this.inBody, 'sraar must be in args');
  this.argRefs = refs;
  this.refs = this.argRefs;
};

this.getNonLocalLoopLexicals =
function() {
  var argRefs = this.argRefs, e = 0, len = argRefs.length(), target = null;
  var list = null;
  while (e < len) {
    var ref = argRefs.at(e++);
    if (ref === null)
      continue;

    target = ref.getDecl();
    if (target === this.scopeName)
      continue;
    if (target === this.spArguments)
      continue;
    if (target === this.spThis)
      continue;

    ASSERT.call(this, !target.isLiquid(), 'got liquid');
    ASSERT.call(this, !this.owns(target), 'local');

    if (target.isLexicalLike() && target.ref.scope.insideLoop())
      (list || (list = [])).push(target);
  }

  return list;
};

},
function(){
this.handOver_m =
function(mname, ref) {
  if (!this.isArrow()) {
    if (ref_arguments_m(mname))
      return this.spCreate_arguments(ref);

    if (this.isExpr() &&
      this.scopeName &&
      this.scopeName.hasName_m(mname))
      return this.scopeName.ref.absorbDirect(ref);
  }

  return this.parent.refIndirect_m(mname, ref);
};

this.refInHead =
function(mname, ref) {
  if (!this.isArrow()) {
    if (ref_this_m(mname))
      return this.spCreate_this(ref);
    if (ref_scall_m(mname)) {
      ASSERT.call(this, this.isCtor(),
        'a scall ref must only come in a ctor scope');
      return this.spCreate_scall(ref);
    }
  }

  return this.focRefAny_m(mname).absorbDirect(ref);
};

},
function(){


},
function(){
this.spCreate_arguments =
function(ref) {
  ASSERT.call(this, ref,
    'ref must be provided to create an argumentsSP');

  var spArguments = new Liquid('<arguments>')
    .r(ref)
    .n('arguments');

  return this.spArguments = spArguments;
};

this.spCreate_scall =
function(ref) {
  ASSERT.call(this, this.isCtor(),
    'only ctor scopes are allowed to create scall');
  ASSERT.call(this, ref,
    'ref must be provided to create a scallSP');

  var spSuperCall = new Liquid('<scall>')
    .r(ref)
    .n('s');

  return this.spSuperCall = spSuperCall;
};

},
function(){
this.verifyForStrictness =
function() {
  this.verifyUniqueArgs();
  var list = this.argList, i = 0;
  while (i < list.length) {
    var elem = list[i++];
    if (arorev(elem.name))
      this.parser.err('binding.to.arguments.or.eval');
    if (this.parser.isResv(elem.name))
      this.parser.err('invalid.argument.in.strict.mode');
  }
};

},
function(){
this.synth_ref_may_escape_m =
function(mname) { return !ref_arguments_m(mname); };

this.synth_name_is_valid_binding_m =
function(mname) { return true; };

this.synth_ref_find_homonym_m =
function(mname) {
  this.isBooted || this.synth_boot();
  var synth = this.findSynth_m(mname)
  if (synth === null && this.scopeName && this.scopeName.hasName_m(mname))
    synth = this.scopeName;
  return synth;
};

this.synth_decl_find_homonym_m =
function(mname) {
  this.isBooted || this.synth_boot();
  return this.findSynth_m(mname);
};

this.synth_boot =
function() {
  this.synth_boot_init();
  ASSERT.call(this, !this.inBody, 'inBody');
  this.synth_args();
  this.activateBody();
  this.synth_defs_to(this);
  this.deactivateBody();
};

this.synth_start =
function() {
  this.isBooted || this.synth_boot();
  this.synth_externals();
};

this.synth_externals =
function() {
  ASSERT.call(this, !this.inBody, 'inBody');
  var list = this.argRefs, e = 0, len = list.length();
  while (e < len) {
    var item = list.at(e++);
    if (item) {
      var target = item.getDecl(), mname = "";
      ASSERT.call(this, target.synthName !== "" || target.isGlobal(), 'synth');

      mname = _m(target.synthName);
      var synth = this.findSynth_m(mname);
      if (synth !== target) {
        ASSERT.call(this, synth === null, 'override');
        this.insertSynth_m(mname, target);
      }
    }
  }
};

this.synth_args =
function() {
  var list = this.argList, nmap = {}, e = list.length - 1;
  while (e >= 0) {
    var arg = list[e], mname = _m(arg.name);
    if (!HAS.call(nmap, mname)) {
      nmap[mname] = arg;
      this.synthDecl(arg);
    }
    e--;
  }
};

}]  ],
[GlobalScope.prototype, [function(){


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
[Liquid.prototype, [function(){
// TODO: liquids leave no signs in any scope the don't belong to --
//       they record it in their list of referencing scopes if they
//       contain any significant names, but they are not recorded in the lsi
//       of the scope's unresolved references; nothing looks actually wrong with this approach,
//       except that it is in total contrast to the one taken in the previous version
this.track =
function(scope) {
  var cur = scope, root = this.ref.scope ;
  while (true) {
    if (cur.hasSignificantNames()) {
      if (HAS.call(this.rsMap, cur.scopeID))
        break;
      this.rsMap[cur.scopeID] = true;
      this.ref.rsList.push(cur);
    }
    if (cur === root)
      break;
    cur = cur.parent;
    ASSERT.call(this, cur,
      'reached topmost while pulling up a liquid');
  }
  return this;
};

}]  ],
[LiquidGroup.prototype, [function(){
this.getL =
function(idx) {
  return idx < this.list.length ?
    this.list[idx] : null;
};

this.seal = function() {
  ASSERT.call(this, !this.hasSeal, 'has seal');
  this.hasSeal = true;
  return this;
};

this.newL =
function() {
  ASSERT.call(this, !this.hasSeal, 'has seal');

  var liq = new Liquid(this.category);
  liq.r(new Ref(this.scope));
  liq.idx = this.length;
  this.list.push(liq);
  this.length = this.list.length;
  return liq;
};

}]  ],
null,
[ParenScope.prototype, [function(){
this.finish = 
function() {};

this.makeParams =
function(paramScope) {
  paramScope.setRefsAndArgRefs(this.refs);
  this.updateParentForSubScopesTo(paramScope);
  this.hasDissolved = true;
};

this.makeSimple =
function() {
  var list = this.refs;
  var i = 0;
  var len = list.length();

  var p = this.parent;
  while (i<len) {
    var mname = list.keys[i], ref = p.findRefAny_m(mname);
    var elem = list.get(mname);
    if (ref) ref.absorbDirect(elem);
    else { elem.scope = p; p.insertRef_m(mname, elem); }
    i++;
  }

  this.updateParentForSubScopesTo(p);
  this.hasDissolved = true;
};

this.updateParentForSubScopesTo =
function(sParent) {
  var list = this.ch, i = 0;
  while (i<list.length) {
    var elem = list[i];
    if (elem.isParen()) {
      ASSERT.call(this, elem.hasDissolved,
        'paren sub-scopes are not allowed to have remained intact -- they must have dissolved earlier');
      elem.updateParentForSubScopesTo(sParent);
    }
    else {
      ASSERT.call(this, elem.isAnyFn() || elem.isClass(),
        'current fn scopes are the only scope allowed '+
       'to come in a paren');
      elem.parent = sParent;
    }
    i++;
  }
};

}]  ],
[Parser.prototype, [function(){
this.ensureSpreadToRestArgument_soft = function(head) {
  return head.type !== 'AssignmentExpression';
};

},
function(){
this.cc =
function() { // cuts comments
  var commentBuf = this.commentBuf;
  this.commentBuf = null;
  return commentBuf;
};

this.suc =
function(cb, i) {
  cb[i] = this.cc();
};

this.spc =
function(n, i) { n['#c'][i] = this.cc(); };

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
  if (arg.type !== 'Identifier')
    this.scope.firstNonSimple = arg;

  switch  ( arg.type ) {
  case 'Identifier':
    if (this.scope.canAwait() &&
       arg.name === 'await')
      this.err('arrow.param.is.await.in.an.async',{tn:arg});
     
    // TODO: this can also get checked in the scope manager rather than below
    if (this.scope.insideStrict() && arorev(arg.name))
      this.err('binding.to.arguments.or.eval',{tn:arg});

    this.scope.findRefU_m(_m(arg.name)).d--; // one ref is a decl
    this.scope.decl_m(_m(arg.name), DT_FNARG);
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
    if (this.scope.insideStrict() && arorev(head.name)) {
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
this.inferName =
function(left, right, isComputed) {
  if (isComputed && left.type === 'Identifier')
    return null;
  if (right.type !== 'FunctionDeclaration' &&
    right.type !== 'FunctionExpression')
    return null;
  if (right.id)
    return null;

  var scope = right['#scope'];
  var t = DT_FN|DT_INFERRED;
  var name = "";

  name = getIDName(left);
  if (name === "")
    return null;

  var scopeName = null;
  scopeName = scope.setName(name, null).t(t);
  scopeName.synthName = scopeName.name;
  
  return scopeName;
};

this.cutEx =
function() {
  var ex = this.ex;
  this.ex = DT_NONE;
  return ex;
};

},
function(){
function base_Y0(n) {
  if (!this.scope.canYield() || n === null)
    return 0;
  switch (n.type) {
  case 'Identifier':
  case 'TemplateElement':
  case 'Literal':
  case 'DebuggerStatement':
  case 'Super':
  case 'ThisExpression':
    return 0; 
  }

  if (n.type === PAREN)
    return base_Y0.call(this, core(n));

  if (!HAS.call(n, '#y')) {
    console.error(n);
    throw new Error(n.type+'[#y]');
  }

  return n['#y'];
};

function base_Y(n) {
  ASSERT.call(this, n !== null, 'n');
  return base_Y0.call(this, n);
}

this.Y0 = function() {
  var yc = 0, e = 0;
  while (e < arguments.length)
    yc += base_Y0.call(this, arguments[e++]);
  return yc;
};

this.Y = function() {
  var yc = 0, e = 0;
  while (e < arguments.length)
    yc += base_Y.call(this, arguments[e++]);
  return yc;
};

},
function(){
this.enterPrologue =
function() {
  this.scope.enterPrologue();
};

this.exitPrologue =
function() {
  this.scope.exitPrologue();
  this.clearPendingStrictErrors();
};

this.applyDirective =
function(directiveLiteral) {
  if (this.alreadyApplied) {
    this.alreadyApplied = false;
    return;
  }
  var raw = directiveLiteral.raw;
  // TODO: which one should apply first?
  if (raw.substring(1,raw.length-1) === 'use strict') {
    this.scope.makeStrict();
    this.strict_esc_chk(); // for now it is the sole possible error
  }
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

this.ga = function() { this.err('gen.async'); };

},
function(){
this.expectT =
function(lttype) {
  if (this.lttype === lttype) {
    this.next();
    return true;
  }
  return false;
};

},
function(){
this.loc = function() { return { line: this.li, column: this.col }; };
this.loc0 = function() { return  { line: this.li0, column: this.col0 }; };

},
function(){
this.next =
function() {

  this.skipWS();
  if (this.c >= this.src.length) {
    this.lttype = TK_EOF;
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

  var c0 = this.c0, loc0 = this.loc0();
  var c = this.c, li = this.li, col = this.col;

  var cb = {};
  this.suc(cb, 'bef');
  this.next();
  var label = null;
  if (!this.nl && this.lttype === TK_ID) {
    this.validate(this.ltval);
    label = this.id();
    var target = this.findLabel_m(_m(label.name));
    if (target === null)
      this.err('break.no.such.label');
  }
  else if (!this.scope.canBreak())
    this.err('break.not.in.breakable');

  label && this.spc(label, 'aft');
  this.semi() || this.err('no.semi');

  var ec = this.semiC || (label && label.end) || c;
  var eloc = this.semiLoc ||
    (label && label.loc.end) ||
    { line: li, column: col };

  this.foundStatement = true;
  return {
    type: 'BreakStatement',
    label: label,
    start: c0,
    end: ec,
    loc: { start: loc0, end: eloc },
    '#y': 0,
    '#c': cb
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

  var c0 = this.c0, loc0 = this.loc0();
  var c = this.c, li = this.li, col = this.col;

  var cb = {};
  this.suc(cb, 'bef');
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

  label && this.spc(label, 'aft');
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
    loc: { start: loc0, end: eloc },
    '#y': 0,
    '#c': cb
  };
};

},
function(){
this.parseStatement =
function(allowNull) {
  var head = null;
  switch (this.lttype) {
  case CH_LCURLY:
    head = this.parseBlock();
    break;
  case CH_SEMI:
    head = this.parseEmptyStatement();
    break;
  case TK_ID:
    this.canBeStatement = true;
    // TODO: CTX.PAT|CTX.NO_SIMP
    head = this.parseIDExprHead(CTX_PAT);
    if (!this.foundStatement) {
      this.canBeStatement = false;
      this.exprHead = head;
      head = null;
    }
    break;

  case CH_SINGLE_QUOTE:
  case CH_MULTI_QUOTE:
    if (this.scope.insidePrologue())
      this.chkDirective = true;
    this.exprHead = this.parseString(this.lttype);
    break;

  case TK_EOF:
    if (!allowNull)
      this.err('stmt.null');
    break;
  }

  var finishPrologue = this.scope.insidePrologue();
  if (this.foundStatement) {
    if (head === null)
      allowNull || this.err('stmt.null');
    this.foundStatement = false;
  }
  else if (head === null) {
    head = this.parseExpr(CTX_NULLABLE|CTX_TOP);
    if (head === null)
      allowNull || this.err('stmt.null');
    else if (head.type === 'Identifier' &&
      this.lttype === CH_COLON)
      head = this.parseLabel(head, allowNull);
    else {
      this.fixupLabels(false);
      if (finishPrologue && isDirective(head)) {
        finishPrologue = false;
        this.applyDirective(head);
      }
      this.semi() || this.err('no.semi');
      head = {
        type: 'ExpressionStatement',
        expression: core(head),
        start: head.start,
        end: this.semiC || head.end,
        loc: {
          start: head.loc.start,
          end: this.semiLoc || head.loc.end },
        '#y': this.Y(head), '#c': {}
      };
    }
  }

  if (finishPrologue)
    this.scope.exitPrologue();

  return head;
};

},
function(){
this.parseThis = function() {
  this.resvchk();
  var cb = {}; this.suc(cb, 'bef' );

  var n = {
    type : 'ThisExpression',
    loc: { start: this.loc0(), end: this.loc() },
    start: this.c0,
    end : this.c, '#c': cb
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
    this.semiLoc = this.loc0();
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
      return this.v<=5;
    case 'let' :
      return this.scope.insideStrict();
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
  default: return false;
  }
};

this.validate =
function(name) {
  this.isResv(name) && this.ri();
};

},
function(){
this.setsimpoff =
function(offset) {
  this.col += (this.c = offset) - this.luo;
  // TODO: will luo remain relevant even if
  // we only use this.c at the start and end of a lexer routine
  this.luo = offset;
};

this.setzoff =
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
this.parseProgram = function () {
  var c0 = this.c, li0 = this.li, col0 = this.col;
  var ec = -1, eloc = null;

  this.scope = new SourceScope(new GlobalScope(), ST_SCRIPT);

  this.scope.parser = this;
  if (!this.isScript)
    this.scope.makeStrict();

  this.next();

  this.enterPrologue();
  var list = this.stmtList(); 

  this.scope.finish();

  var cb = {};
  list.length || this.suc(cb, 'inner');

  var n = {
    type: 'Program',
    body: list,
    start: 0,
    end: this.src.length,
    sourceType: !this.isScript ? "module" : "script" ,
    loc: {
      start: {line: li0, column: col0},
      end: {line: this.li, column: this.col}
    }, 
    '#scope': this.scope,
    '#c': cb,
    '#y': 0, 
    '#imports': null
  };

  if (!this.expectT(TK_EOF))
    this.err('program.unfinished');

  return n;
};

},
function(){
this.parseExpr =
function(ctx) {
  var head = this.parseNonSeq(PREC_NONE, ctx);
  var latestExpr = null;

  if (this.lttype !== CH_COMMA)
    return head;

  ctx &= CTX_FOR;
  ctx |= CTX_TOP;

  var e = [core(head)];
  var y = this.Y(head);
  do {
    latestExpr && this.spc(latestExpr, 'aft');
    this.next();
    latestExpr = this.parseNonSeq(PREC_NONE, ctx);
    y += this.Y(latestExpr);
    e.push(core(latestExpr));
  } while (this.lttype === CH_COMMA);

  latestExpr && this.spc(latestExpr, 'aft');

  return {
    type: 'SequenceExpression',
    expressions: e,
    start: head.start,
    end: latestExpr.end,
    loc: {
      start: head.loc.start,
      end: latestExpr.loc.end
    },
    '#y': y, '#c': {}
  };
};

},
function(){
this.peekMul =
function() { 
  return this.lttype === TK_SIMP_BINARY && this.ltraw === '*';
};

this.peekID =
function(name) {
  return this.lttype === TK_ID && this.ltval === name;
};

this.peekEq =
function() {
  return this.lttype === TK_SIMP_ASSIG && this.ltraw === '=';
};

this.peekStr =
function() {

  switch (this.lttype) {
  case CH_SINGLE_QUOTE:
  case CH_MULTI_QUOTE:
    return true;
  }

  return false;
};

},
function(){
this.getOp = 
function(ctx) {
  switch ( this. lttype ) {
  case TK_SIMP_BINARY:
  case TK_AA_MM:
    return true;
  case TK_UNBIN:
    this.prec = PREC_ADD;
    return true;
  case CH_DIV:
    if (this.scat(this.c) === CH_EQUALITY_SIGN) {
      this.lttype = TK_OP_ASSIG;
      this.ltraw = '/=';
      this.setsimpoff(this.c+1);
    }
    else {
      this.lttype = TK_SIMP_BINARY; // unnecessary
      this.ltraw = '/';
      this.prec = PREC_MUL; 
    }
    return true;

  case TK_ID:
    switch (this.ltval) {
    case 'in':
      this.resvchk();
    case 'of':
      if (ctx & CTX_FOR) break;

      this.prec = PREC_COMP;
      this.ltraw = this.ltval;
      return true;

    case 'instanceof':
      this.resvchk();
      this.prec = PREC_COMP;
      this.ltraw = this.ltval ;
      return true;
    }
    return false;

  case CH_QUESTION:
    this.prec = PREC_COND;
    return true;

  default: return false;
  }

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
    var t = (val<<4)|b;
    if (t <= 1114111)
      val = t
    else {
      this.setsimpoff(c);
      this.err('curly.big');
    }
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
      this.setzoff(c);
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
    this.commentBuf = new Comments();
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
    return this.read_ellipsis();
  
  if (isNum(ch)) {
    this.readNum_tail(FL_HEADLESS_FLOAT);
    this.ltval = parseFloat(this.ltraw = this.c0_to_c());
    this.lttype = TK_NUM;
  }
  else {
    this.setsimpoff(this.c+1);
    this.lttype = CH_SINGLEDOT;
  }
};

},
function(){
this.read_ellipsis =
function() {
  var c = this.c+2, s = this.src;
  if (c>=s.length || s.charCodeAt(c) !== CH_SINGLEDOT) {
    this.setsimpoff(c);
    this.err('unexpected.dot');
  }

  this.setsimpoff(c+1);
  this.lttype = TK_ELLIPSIS;
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
  case CH_BACK_SLASH: c+=2; v = '\\'; break;
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
      c+2<l &&
      s.charCodeAt(c+2) === CH_LINE_FEED
    ) c++;
  case CH_LINE_FEED:
  case 0x2028: case 0x2029:
    c++;
    this.setzoff(c+1);
    v = '';
    setoff = false;
    break;

  default:
    v = s.charAt(c+1);
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

  if (this.scope.insidePrologue() &&
    this.ct === ERR_NONE_YET) {
    this.ct = ERR_PIN_OCTAL_IN_STRICT;
    this.pin_ct(this.c,this.li,this.col);
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
    c++;
  }

  this.setsimpoff(c);

  return String.fromCharCode(v);
};

},
function(){
this.readID_bs =
function() {
  if (this.ct === ERR_NONE_YET) {
    this.ct = ERR_PIN_UNICODE_IN_RESV;
    this.pin_ct(this.c,this.li,this.col);
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
        this.pin_ct(this.c,this.li,this.col);
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
  c = this.c;
  if (c<l) {
    ch = s.charCodeAt(c);
    if (isIDHead(ch))
      this.err('id.head.is.num.tail');
    if (ch === CH_BACK_SLASH || (ch >= 0x0D800 && ch <= 0x0DBFF))
      this.err('unexpected.char.is.num.tail');
  }
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

    this.setsimpoff(this.c+1);
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
  if (this.scope.insideStrict())
    this.err('oct.legacy.num.in.strict');

  var c = this.c+1, s = this.src, l = s.length, dec = false;
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
    c++;
  }

  this.setsimpoff(c);
  this.ltraw = this.c0_to_c();
  this.ltval = v;
};

},
function(){
this.readOp_add =
function() {
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

  if (ch === CH_EQUALITY_SIGN) {
    c++; this.lttype = TK_OP_ASSIG;
    this.ltraw = '&=';
  }
  else {
    this.lttype = TK_SIMP_BINARY;
    if (ch === CH_AND) {
      c++; this.prec = PREC_LOG_AND;
      this.ltraw = '&&';
    }
    else {
      this.prec = PREC_BIT_AND;
      this.ltraw = '&';
    }
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

  if (ch === CH_EQUALITY_SIGN) {
    this.lttype = TK_SIMP_BINARY;
    c++; this.prec = PREC_EQ;
    ch = this.scat(c);
    if (ch === CH_EQUALITY_SIGN) {
      c++;
      this.ltraw = '===';
    }
    else this.ltraw = '==';
  }
  else if (ch === CH_GREATER_THAN) {
    this.lttype = TK_SIMP_ASSIG;
    c++;
    this.ltraw = '=>';
  }
  else {
    this.lttype = TK_SIMP_ASSIG;
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

  if (ch === CH_EQUALITY_SIGN) {
    c++;
    this.prec = PREC_COMP;
    this.lttype = TK_SIMP_BINARY;
    this.ltraw = '>=';
  }
  else if (ch === CH_GREATER_THAN) {
    c++;
    ch = this.scat(c);
    if (ch === CH_EQUALITY_SIGN) {
      c++;
      this.lttype = TK_OP_ASSIG;
      this.ltraw = '>>=';
    }
    else if (ch === CH_GREATER_THAN) {
      c++;
      ch = this.scat(c);
      if (ch === CH_EQUALITY_SIGN) {
        c++;
        this.lttype = TK_OP_ASSIG;
        this.ltraw = '>>>=';
      }
      else {
        this.lttype = TK_SIMP_BINARY;
        this.prec = PREC_SH;
        this.ltraw = '>>>';
      }
    }
    else {
      this.lttype = TK_SIMP_BINARY;
      this.prec = PREC_SH;
      this.ltraw = '>>';
    }
  }
  else {
    this.lttype = TK_SIMP_BINARY;
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

  if (ch === CH_EQUALITY_SIGN) {
    c++;
    this.prec = PREC_COMP;
    this.lttype = TK_SIMP_BINARY;
    this.ltraw = '<=';
  }
  else if (ch === CH_LESS_THAN) {
    c++;
    ch = this.scat(c);
    if (ch === CH_EQUALITY_SIGN) {
      c++;
      this.lttype = TK_OP_ASSIG;
      this.ltraw = '<<=';
    }
    else {
      this.lttype = TK_SIMP_BINARY;
      this.prec = PREC_SH;
      this.ltraw = '<<';
    }
  }
  else {
    this.lttype = TK_SIMP_BINARY;
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
    this.lttype = TK_OP_ASSIG;
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

  if (ch === CH_EQUALITY_SIGN) {
    this.lttype = TK_OP_ASSIG;
    c++;
    this.ltraw = '%=';
  }
  else {
    this.lttype = TK_SIMP_BINARY;
    this.prec = PREC_MUL;
    this.ltraw = '%';
  }

  this.setsimpoff(c);
};

},
function(){
this.readOp_mul =
function() {
  var c = this.c; c++; // '*'
  var ch = this.scat(c);

  if (ch === CH_EQUALITY_SIGN) {
    c++;
    this.lttype = TK_OP_ASSIG;
    this.ltraw = '*=';
  }
  else if (ch === CH_MUL) {
    c++; ch = this.scat(c);
    if (ch === CH_EQUALITY_SIGN) {
      c++;
      this.lttype = TK_OP_ASSIG;
      this.ltraw = '**=';
    }
    else {
      this.prec = PREC_EX;
      this.lttype = TK_SIMP_BINARY;
      this.ltraw = '**';
    }
  }
  else {
    this.prec = PREC_MUL;
    this.lttype = TK_SIMP_BINARY;
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

  if (ch === CH_EQUALITY_SIGN) {
    c++;
    this.lttype = TK_OP_ASSIG;
    this.ltraw = '|=';
  }
  else {
    this.lttype = TK_SIMP_BINARY;
    if (ch === CH_OR) {
      c++; this.prec = PREC_LOG_OR;
      this.ltraw = '||';
    }
    else {
      this.prec = PREC_BIT_OR;
      this.ltraw = '|';
    }
  }

  this.setsimpoff(c);
};

},
function(){
this.readOp_xor =
function() {
  var c = this.c; c++; // '^'
  var ch = this.scat(c);

  if (ch === CH_EQUALITY_SIGN) {
    c++;
    this.lttype = TK_OP_ASSIG;
    this.ltraw = '^=';
  }
  else {
    this.prec = PREC_BIT_XOR;
    this.lttype = TK_SIMP_BINARY;
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
this.declare = function(id) {
   ASSERT.call(this, this.declMode !== DT_NONE, 'Unknown declMode');
   if (this.declMode & (DT_LET|DT_CONST)) {
     if (id.name === 'let')
       this.err('lexical.name.is.let');
   }

   var decl = this.scope.decl_m(_m(id.name), this.declMode);
   !decl.site && decl.s(id);
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
  this.scope.actions |= allowedActions;
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
      c++;
      this.setzoff(c);
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
        if (this.readComment_multi() && !nl)
          nl = true;
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
        s.charCodeAt(c+1) === CH_EXCLAMATION &&
        s.charCodeAt(c+2) === CH_MIN &&
        s.charCodeAt(c+3) === CH_MIN
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
      nl = true;
      c++;
      this.setzoff(c);
      continue;

    default: break SKIPLOOP;
    }

  this.setsimpoff(c);
  this.nl = nl;
};

},
function(){
this.findLabel_m = 
function(mname) {
  return HAS.call(this.labels, mname) ?
    this.labels[mname] : null;
};

this.testStmt = 
function() {
  if (this.canBeStatement) {
    this.canBeStatement = false;
    return true;
  }
  return false;
};

// NOTE: great care has to be taken to use this.unsatisfiedLabel such that it won't get overwritten.
// the recommended way is to use fixupLabels at the very beginning of relevant parse routine, or at least before calling
// any parse routine that might overwrite this.unsatisfiedLabel
this.fixupLabels =
function(isLoop) {
  if (this.unsatisfiedLabel) {
    this.unsatisfiedLabel.loop = isLoop;
    this.unsatisfiedLabel = null;
  }
};

this.stmtList =
function () {
  var stmt = null, y = 0, list = [];
  var last = null;
  while (stmt = this.parseStatement(true)) {
    last && this.spc(last, 'aft');
    y += this.Y0(stmt);
    list.push(stmt);
    last = stmt;
  }  
  last && this.spc(last, 'aft');

  this.yc = y;
  return list;
};

// TODO: eliminate
this.fixupLabel =
function(label, isLoop) {
  label.loop = isLoop;
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

},
function(){
this.ensureSAT =
function(left) {

  switch (left.type) {
  case 'Identifier':
    if (this.scope.insideStrict() &&
      arorev(left.name))
      this.err('assig.to.arguments.or.eval');
  case 'MemberExpression':
    return true;
  }

  return false;
};

this.patErrCheck =
function() {
  ASSERT.call(this, this.vpatCheck,
    'PEC msut have vpatCheck hold');
  this.vpatCheck = false;
  if (!this.scope.canDeclareLexical())
    this.vpatErr = PE_NO_NONVAR;
  else if (this.unsatisfiedLabel)
    this.vpatErr = PE_NO_LABEL;
  else return false;

  return true;
};

this.setPatCheck =
function(shouldCheck) {
  if (shouldCheck) {
    this.vpatCheck = true;
    this.vpatErr = PE_NONE;
  }
};

}]  ],
[Ref.prototype, [function(){
this.absorbDirect =
function(ref) { return this.absorb(ref, true); };

this.absorbIndirect =
function(ref) { return this.absorb(ref, false); };

this.absorb =
function(childRef, refD) {
  ASSERT.call(this, !childRef.hasTarget,
    'resolved ref are not allowed to get absorbed by another ref');
  ASSERT.call(this, !childRef.parentRef,
    'a ref with a parent is not allowed to get absorbed by another ref');

  if (refD) {
    this.d += childRef.d;
    this.i += childRef.i;
  } else
    this.i += childRef.d + childRef.i

  if (childRef.rsList.length)
    this.rsList = childRef.rsList.concat(this.rsList);

  if (childRef.scope.hasSignificantNames())
    this.rsList.push(childRef.scope);

  childRef.parentRef = this;
};

this.updateStats =
function(d, i) { this.d += d; this.i += i; };

this.getDecl =
function() {
  if (this.targetDecl !== null)
    return this.targetDecl;
  var ref = this.parentRef;
  while (ref) {
    if (ref.targetDecl)
      return this.targetDecl = ref.targetDecl;
    ref = ref.parentRef;
  }
  ASSERT.call(this, false, 'ref unresolved');
};

this.assigned =
function() {
  var targetRef = this.getDecl().ref;
  if (targetRef.lhs < 0)
    targetRef.lhs = 0;
  return targetRef.lhs++;
};

this.cut =
function() {
  ASSERT.call(this, this.hasTarget, 'cut');
  this.hasTarget = false;
  this.targetDecl = null;

  return this;
};

this.getLHS =
function() {
  var targetRef = this.getDecl().ref;
  return targetRef.lhs < 0 ? 0 : targetRef.lhs;
};

this.updateRSList =
function(rsList) {
  var rsMap = {};
  var e = 0;
  var list = this.rsList;
  while (e < list.length)
    rsMap[list[e++].scopeID] = true;

  e = 0;
  list = rsList;
  while (e < list.length) {
    var elem = list[e++];
    if (!HAS.call(rsMap, elem.scopeID)) {
      this.rsList.push(elem);
      rsMap[elem.scopeID] = true
    }
  }

  return this;
};

}]  ],
[Scope.prototype, [function(){
this.canSmem =
function() { return this.actions & SA_MEMSUPER; };

this.canAwait = 
function() { return this.actions & SA_AWAIT; };

this.canBreak = 
function() { return this.actions & SA_BREAK; };

this.canDeclareLexical =
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
function() { return this.actions & SA_CALLSUPER; };

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
function() { return this.actions & SA_YIELD; };

this.canMakeThis =
function() {
  if (this.isAnyFn())
    return !this.isArrow();
  return this.isSourceLevel();
};

this.canReturn = 
function() { return this.actions & SA_RETURN; };

this.canContinue = 
function() { return this.actions & SA_CONTINUE; };

this.canAccessNewTarget =
function() { return this.actions & SA_NEW_TARGET; };

this.canHaveName =
function() { return this.isAnyFn() || this.isClass(); };

},
function(){
this.enterForInit =
function() { this.flags |= SF_FORINIT; };

this.enterPrologue =
function() { this.flags |= SF_INSIDEPROLOGUE; };

this.exitForInit =
function() {
  ASSERT.call(this, this.insideForInit(),
    'must be in a for');
  this.flags &= ~SF_FORINIT;
};

this.exitPrologue =
function() {
  this.flags &= ~SF_INSIDEPROLOGUE;
};

},
function(){
this.finish =
function() {
  if (this.isAnyFn() || this.isCatch())
    this.finishBody();

  return this.handOverRefList(this.refs);
};

this.finishBody =
function() {
  ASSERT.call(this, this.inBody, 'finish must be in body');
  var list = this.refs, len = list.length();
  var e = 0, mname = "", ref = null;

  var isCatch = this.isCatch();
  this.deactivateBody();
  this.inBody = true;
  while (e<len) {
    ref = list.at(e);
    mname = list.keys[e];
    if (isCatch)
      this.refDirect_m(mname, ref);
    else
      this.refInHead(mname, ref);
    e++;
  }
  this.inBody = false;
};

},
function(){
this.handOverRefList =
function(list) {
  var len = list.length(), i = 0;
  while (i<len) {
    var ref = list.at(i), mname = list.keys[i];
    if (ref && (ref.d || ref.i)) {
      ASSERT.call(this, !ref.hasTarget, 'touched ref can not be bound');
      this.handOver_m(mname, ref);
    }
    i++;
  }
};

this.handOver_m =
function(mname, ref) {
  if (this.isBlock() || this.isBare())
    return this.parent.refDirect_m(mname, ref);

  if (this.isCatch()) {
    ASSERT.call(this, !this.inBody,
      'the body has to finish() before the handover begins');
    return this.parent.refDirect_m(mname, ref);
  }

  if (this.isClass()) {
    if (this.isExpr() &&
    this.scopeName && this.scopeName.hasName_m(mname))
      return this.scopeName.ref.absorbDirect(ref);

    return this.parent.refDirect_m(mname, ref);
  }

  ASSERT.call(this, this.isScript(),
    'a script scope was expected');

  ASSERT.call(this, this.parent.isGlobal(),
    'script must have a parent scope with type global');

  if (ref_this_m(mname))
    return this.spCreate_this(ref);

  return this.spCreate_global(mname, ref);
};

},
function(){
this.hasNewTarget =
function() { return this.allowed & SA_NEW_TARGET; };

this.hasHead =
function() {
  return this.isAnyFn() || this.isCatch();
};

this.hasSignificantNames =
function() {
  if (this.isModule() ||
    this.isScript())
    return true;

  if (this.isAnyFn())
    return !this.inBody;
  if (this.isCatch())
    return !this.inBody && this.argIsSimple && this.argIsSimple;

  return false;
};

},
function(){
this.activateBody =
function() {
  ASSERT.call(this, this.hasHead(),
    'a scope with a head was expected');

  ASSERT_EQ.call(this, this.inBody, false);
  this.inBody = true;
  this.refs = this.bodyRefs;
};

this.deactivateBody =
function() {
  ASSERT.call(this, this.hasHead(),
    'a scope with a head was expected');

  ASSERT_EQ.call(this, this.inBody, true);
  this.inBody = false;
  this.refs = this.argRefs;
};

},
function(){
this.insideIf =
function() { return this.flags & SF_INSIDEIF; };

this.insideLoop =
function() { return this.flags & SF_LOOP; };

this.insideStrict = 
function() { return this.flags & SF_STRICT; };

this.insidePrologue =
function() { return this.flags & SF_INSIDEPROLOGUE; };

this.insideForInit =
function() { return this.flags & SF_FORINIT; };

this.insideArgs =
function() { return this.isAnyFn() && !this.inBody; };

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

this.isMem =
function() { return this.isClassMem() || this.isStaticMem() || this.isObjMem(); };

this.isArrow = 
function() { return this.type & ST_ARROW; };

this.isBlock =
function() { return this.type & ST_BLOCK; };

this.isBare =
function() { return this.type & ST_BARE; };

this.isCtor = 
function() { return this.type & ST_CTOR; };

this.isLexicalLike =
function() {
  return this.isBlock() || this.isCatch();
};

this.isDecl = 
function() { return this.type & ST_DECL; };

this.isParen =
function() { return this.type & ST_PAREN; };

this.isHoisted =
function() { return this.isAnyFn() && this.isDecl(); };

this.isExpr = 
function() { return this.type & ST_EXPR; };

this.isBootable =
function() {
  return this.isScript() || this.isAnyFn() || this.isCatch() || this.isModule();
};

this.isSourceLevel = 
function() { return this.isScript() || this.isModule(); };

this.isSimpleFn =
function() { return this.type & (ST_EXPR|ST_DECL); };

this.isBundle =
function() { return this.type & ST_BUNDLE; };

this.isGlobal =
function() { return this.type & ST_GLOBAL; };

this.isConditional = 
function() { return this.flags & ST_COND; };

this.isConcrete =
function() { return this.isModule() || this.isAnyFn() || this.isScript() || this.isBundle(); };

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
this.determineActions =
function() {
  if (this.isParen())
    return this.parent.actions;

  var a = SA_NONE;
  if (this.isSoft())
    a |= this.parent.actions;
  else if (this.isAnyFn()) {
    a |= SA_RETURN;
    if (this.isArrow())
      a |= (this.parent.actions & (SA_CALLSUPER|SA_NEW_TARGET|SA_MEMSUPER));
    else {
      a |= SA_NEW_TARGET;
      if (this.isCtor()) {
        ASSERT.call(this, this.parent.isClass(),
          'a ctor can only descend from a class');
        if (this.parent.hasHeritage())
          a |= SA_CALLSUPER;
      }
      if (this.isGen())
        a |= SA_YIELD;
      if (this.isMem())
        a |= SA_MEMSUPER;
    }
    if (this.isAsync())
      a |= SA_AWAIT;
  }

  return a;
};

this.activateTZ =
function() {
  var scope = this.scs;
  if (scope.hasTZCheckPoint)
    return false;
  return this.hasTZCheckPoint = true;
};

this.setName =
function(name, source) {
  ASSERT.call(this, this.canHaveName(),
    'only cls/fn can have a name');
  ASSERT_EQ.call(this, this.scopeName, null);
  this.scopeName = 
    new ScopeName(name, source).r(new Ref(this));

  return this.scopeName;
};

this.pushFun =
function(name, transformedFn) {
  ASSERT.call(
    this,
    transformedFn.type === '#Untransformed' && transformedFn.kind === 'transformed-fn', 'transformed-fn');
  var mname = _m(name);
  var list = this.funLists.has(mname) ?
    this.funLists.get(mname) :
    this.funLists.set(mname, []);
  list.push(transformedFn);
};

this.owns =
function(nd) {
  return nd.ref.scope === this && (!nd.isImported());
};

this.determineFlags =
function() {
  if (this.isParen())
    return this.parent.flags;

  var fl = SF_NONE;
  if (!this.parent) {
    ASSERT.call(this, this.isGlobal(),
      'global scope is the only scope that ' +
      'can have a null parent');
    return fl;
  }

  if (this.isClass() || this.isModule() ||
    this.parent.insideStrict())
    fl |= SF_STRICT;

  if (!this.isAnyFn() && this.parent.insideLoop())
    fl |= SF_LOOP;

  if (this.isAnyFn() && !this.isSimpleFn())
    fl |= SF_UNIQUE;

  return fl;
};

this.spCreate_this =
function(ref) {
  ASSERT.call(this, this.canMakeThis(), 'this');

  if (!ref)
    ref = new Ref(this);

  ASSERT.call(this, this.spThis === null,
    'this scope has already got a this liquid');

  // TODO: tz check is also needed for 'this' (in some cases)
  var spThis = new Liquid('<this>')
    .r(ref)
    .n('this_');

  return this.spThis = spThis;
};

},
function(){
this.declareHoisted_m =
function(mname, t) {
  var tdecl = this.findDeclAny_m(mname);

  if (tdecl) {
    if (tdecl.isOverridableByVar())
      return tdecl;
    this.err('var.can.not.override.existing');
  }

  var tscope = null;
  var isNew = false;

  tdecl = this.findVarTarget_m(mname);
  if (!tdecl) {
    tscope = this.scs;
    tdecl = new Decl().t(t).n(_u(mname)).r(tscope.rocRefU_m(mname));
    ASSERT.call(this, !tscope.findDeclAny_m(mname), 'override is not allowed');
    isNew = true;

  }
  else { tscope = tdecl.ref.scope; }

  this.insertDecl_m(mname, tdecl);

  if (this !== tscope)
    this.parent.hoistName_m(mname, tdecl, tscope);

  isNew && tscope.addVarTarget_m(mname, tdecl);

  return tdecl;
};

this.findDeclOwn_m =
function(mname) {
  var tdecl = this.findDeclAny_m(mname);
  if (tdecl && this.owns(tdecl))
    return tdecl;

  return null;
};

this.findDeclAny_m = 
function(mname) {
  if (this.isAnyFn() && !this.inBody )
    return this.findParam_m(mname);

  if (this.isCatch() && !this.inBody )
    return this.args.has(mname) ?
      this.args.get(mname) : null;

  return this.defs.has(mname) ?
    this.defs.get(mname) : null;
};

this.hoistName_m =
function(mname, tdecl, tscope, isNew) {
  var cur = this;
  while (true) {
    var existing = cur.findDeclAny_m(mname);
    if (existing) {
      if (existing.isOverridableByVar())
        return;
      this.err('var.can.not.override.existing');
    }

    cur.insertDecl_m(mname, tdecl);
    if (cur === tscope) { break; }

    cur = cur.parent;
    ASSERT.call(this, cur !== null,
      'reached topmost before reaching target');
  }
};

this.findParam_m =
function(mname) {
  ASSERT.call(this, this.isAnyFn() || this.isCatch(),
    'this scope is not an fn/catch, and has no params');
  return HAS.call(this.argMap, mname) ?
    this.argMap[mname] : null;
};

this.declareLexical_m =
function(mname, t) {
  var existing = this.findDeclAny_m(mname);
  if (!existing) {
    if (this.isAnyFn() || this.isCatch())
      existing = this.findParam_m(mname);
  }
  if (existing)
    this.err('lexical.can.not.override.existing');

  var newDecl = null;
  newDecl = new Decl().t(t).n(_u(mname)).r(this.rocRefU_m(mname));
  this.insertDecl_m(mname, newDecl);

  return newDecl;
};

this.decl_m = function(mname, dt) {
  var decl = null;
  switch (dt & ~DT_EXPORTED) {
  case DT_LET:
    decl = this.decl_let_m(mname, dt);
    break;
  case DT_FN:
    decl = this.decl_fn_m(mname, dt);
    break;
  case DT_CONST:
    decl = this.decl_const_m(mname, dt);
    break;
  case DT_VAR:
    decl = this.decl_var_m(mname, dt);
    break;
  case DT_CLS:
    decl = this.decl_cls_m(mname, dt);
    break;
  case DT_CATCHARG:
    decl = this.decl_catchArg_m(mname, dt);
    break;
  case DT_FNARG:
    decl = this.decl_fnArg_m(mname, dt);
    break;
  default: 
    ASSERT.call(this, false, 'unknown decltype');

  }

  decl.idx = decl.ref.scope.di_ref.v++;

  var entry = null;
  if (decl.isExported()) {
    entry = this.attachExportedEntry(decl.name);
    entry.target = decl;
  } else if (decl.ref.scope.isSourceLevel()) {
    var sourceScope = decl.ref.scope ;
    entry = sourceScope.findUnresolvedExportedEntry_m(mname);
    if (entry) {
      entry.target = decl;
      sourceScope.insertUnresolvedExportedEntry_m(mname, null);
      sourceScope.unresolvedExports.count--;
    }
  }

  return decl;
};

this.decl_let_m =
function(mname, t) {
  return this.declareLexical_m(mname, t);
};

this.decl_fn_m =
function(mname, t) {
  return this.isLexicalLike() ?
    this.declareLexical_m(mname, t) :
    this.declareHoisted_m(mname, t);
};

this.decl_const_m =
function(mname, t) {
  return this.declareLexical_m(mname, t);
};

this.decl_var_m =
function(mname, t) {
  return this.declareHoisted_m(mname, t);
};

this.decl_cls_m =
function(mname, t) {
  return this.declareLexical_m(mname, t);
};

this.decl_catchArg_m =
function(mname, t) {
  ASSERT.call(this, this.isCatch() && !this.inBody,
    'only catch heads are allowed to declare args');

  var existing = this.findDeclAny_m(mname);
  if (existing)
    this.err('var.catch.is.duplicate');

  var newDecl = null;

  newDecl = new Decl().t(t).n(_u(mname)).r(this.rocRefU_m(mname));

  this.insertDecl_m(mname, newDecl);
  this.addVarTarget_m(mname, newDecl);

  return newDecl;
};

this.decl_fnArg_m =
function(mname, t) {
  ASSERT.call(this, this.isAnyFn() && !this.inBody,
    'only fn heads are allowed to declare args');

  var ref = this.findRefAny_m(mname),
      newDecl = new Decl().t(t).n(_u(mname));

  var existing = HAS.call(this.argMap, mname) ?
    this.argMap[mname] : null;

  if (existing) {
    this.canDup() || this.err('var.fn.is.dup.arg');
    if (!this.firstDup)
      this.firstDup = existing;
    newDecl.ref = ref; // unnecessary; also, no  Decl::`r() is not needed -- `ref.hasTarget` holds
  }
  else {
    ref = this.rocRefU_m(mname);
    newDecl.r(ref);
    this.argMap[mname] = newDecl;
    this.addVarTarget_m(mname, newDecl);
  }

  this.argList.push(newDecl);
  return newDecl;
};

this.insertDecl_m =
function(mname, newDecl) {
  this.defs.set(mname, newDecl);
};

},
function(){
this.addVarTarget_m =
function(mname, newDecl) {
  ASSERT.call(this, !HAS.call(this.varTargets, mname),
    'var target is not unique: <'+mname+'>');
  this.varTargets[mname] = newDecl;
};

this.findVarTarget_m =
function(mname) {
  return this.varTargets[mname];
};

},
function(){
this.refDirect_m = 
function(mname, childRef) {
  var ref = this.focRefAny_m(mname);
  if (childRef === null) {
    ref.d++;
    return ref;
  }

  ref.absorbDirect(childRef);
  return ref;
};

this.findRefU_m = this.fRo_m =
function(mname) {
  return this.refs.has(mname) ? 
    this.refs.get(mname) : null;
};

this.findRefAny_m = this.fRa_m =
function(mname) {
  var ref = this.findRefU_m(mname);
  if (ref)
    return ref;

  var tdecl = this.findDeclOwn_m(mname); // exclude inner vars
  if (tdecl === null) {
    if (this.isAnyFn())
      tdecl = this.findParam_m(mname);
    else if (this.isCatch() && this.args.has(mname))
      tdecl = this.args.get(mname);
  }

  if (tdecl)
    return tdecl.ref;

  return null;
};

this.removeRefU_m =
function(mname) {
  var ref = this.findRefU_m(mname);
  if (ref)
    this.insertRef_m(mname, null);
  else
    ASSERT.call(this, !this.findDeclOwn_m(mname), 'unresolved ref has a decl with the same name?!');

  return ref;
};

this.rocRefU_m =
function(mname) {
  var ref = this.removeRefU_m(mname);
  if (!ref)
    ref = new Ref(this);

  return ref;
};

this.focRefAny_m = this.focRa_m =
function(mname) {
  var ref = this.findRefAny_m(mname);
  if (!ref) {
    ref = new Ref(this);
    this.insertRef_m(mname, ref);
  }
  return ref;
};

this.insertRef_m =
function(mname, ref) {
  this.refs.set(mname, ref);
};

this.refIndirect_m =
function(mname, childRef) {
  var ref = this.focRefAny_m(mname);
  ASSERT.call(this, childRef !== null,
    'childRef is not allowed to be null when in refIndirect');

  ref.absorbIndirect(childRef);
  return ref;
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

},
function(){
this.synth_defs_to =
function(targetScope) {
  var list = this.defs, e = 0, len = list.length();
  while (e < len) {
    var tdclr = list.at(e++);
    this.owns(tdclr) && !tdclr.isFnArg() && targetScope.synthDecl(tdclr);
  }
};

}]  ],
[ScopeName.prototype, [function(){
this.hasName_m =
function(mname) {
  return _m(this.name) === mname;
};

// attachment state:
// src null or not an fn decl -> unattached
// otherwise:
//   src lexical-like -> unattached
//   otherwise:
//     src has no synthName -> uncertain
//     otherwise:
//       src has non-matching synthName -> unattached
//       otherwise -> attached
this.getAS =
function() {
  var src = this.source;
  if (src === null || src.isLexicalLike())
    return ATS_DISTINCT;
  if (src.synthName === "")
    return ATS_UNSURE; // semi-attached
  if (src.synthName === src.name)
    return ATS_SAME;
  return ATS_DISTINCT;
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
[SourceScope.prototype, [function(){
this.declareImportedName =
function(id, t) {
  ASSERT.call(this, (t & DT_IMPORTED), 'not im');
  var mname = _m(id.name);
  var decl = this.declareLexical_m(mname, t);
  return decl.s(id );
};

this.trackImports =
function(src, list) {
  // TODO: src might have to get a normalization
  var mname = _m(src);
  var im = this.asMod.mim.has(mname) ?
    this.asMod.mim.get(mname) : null;

  if (im === null)
    im = this.asMod.mim.set(mname, new SortedObj());

  var e = 0;

  while (e < list.length) {
    var sp = list[e++], decl = sp['#decl'];
    mname = _m(
      decl.isIDefault() ? '*default*' :
      decl.isIAliased() ? sp.imported.name :
      (ASSERT.call(this, decl.isINamespace(), 'namespace'), '*')
    ); 

    if (!im.has(mname))
      im.set(mname, decl);
    else if (im.get(mname) !== null) { // if it is not just a forwarded name (i.e., an `export ... from ...`)
      ASSERT.call(this, decl.ref.scope === this, 'scope');
      // a;
      // import {a} from 'e'
      // b;
      // import {a as b} from 'e'
      var existing = im.get(mname);
      decl.referTo(existing);
    }
  }
};

this.attachExportedEntry =
function(name) {
  var mname = _m(name);
  var entry = this.findExportedEntry_m(mname);
  if (entry)
    this.parser.err('existing.export');
  entry = {site: null, target: null, value: null};
  this.insertExportedEntry_m(mname, entry);
  return entry;
};

this.insertExportedEntry_m =
function(mname, entry) {
  return this.asMod.mex.set(mname, entry);
};

this.findExportedEntry_m =
function(mname) {
  var ex = this.asMod.mex;
  return ex.has(mname) ? ex.get(mname) : null;
};

this.attachFWNamespace =
function(src) {
  var mns = this.asMod.mns;
  var mname = _m(src);
  mns.has(mname) || mns.set(mname, null);
  if (!this.asMod.mim.has(mname))
    this.asMod.mim.set(mname, null);
};

this.trackExports = 
function(src, list) {
  var isFW = src.length > 0, e = 0;
  while (e < list.length) {
    var sp = list[e++], mname = _m(sp.local.name), entry = sp['#entry'];
    var target = isFW ?
      this.gocImportedName(src, sp.local) :
      this.findDeclAny_m(mname);
    if (target === null)
      this.insertUnresolvedExportedEntry_m(mname, entry);
    else
      entry.target = target;
  }
};

this.gocImportedName =
function(src, id) {
  var mname = _m(src), im = this.asMod.mim;
  im = im.has(mname) ? im.get(mname) : im.set(mname, new SortedObj());
  mname = _m(id.name);
  if (im.has(mname))
    return im.get(mname);
  var nd = new Decl().t(DT_EALIASED).n(id.name).s(id).r(new Ref(this));
  return im.set(mname, nd );
};

this.insertUnresolvedExportedEntry_m =
function(mname, entry) {
  this.unresolvedExports.entries.set(mname, entry);
  this.unresolvedExports.count++;
};

this.findUnresolvedExportedEntry_m =
function(mname) {
  var uentries = this.unresolvedExports.entries;
  return uentries.has(mname) ? uentries.get(mname) : null;
};

},
function(){
this.satisfyWith =
function(bundler) {
  var loni = [], e = 0; // list of new imports
  var mim = this.asMod.mim, m = null;
  var len = mim.length(), name = "";
  while (e < len) {
    name = _u(mim.keys[e]);
    var oPath = bundler.cd(pathFor(name));
    var curName = tailFor(name);
    if (bundler.has(curName))
      m = bundler.get(curName);
    else {
      m = bundler.load(curName);
      loni.push(m);
    }

    if (this.asMod.mns.has(_m(name)))
      this.asMod.mns.set(_m(name), m['#scope']);

    var im = mim.at(e);
    if (im === null)
      ASSERT.call(this, this.asMod.mns.has(_m(name)), 'if im is null there has to be an entry for it in mns');
    else
      m['#scope'].satisfyAll(this, mim.at(e), loni, bundler);

    bundler.path = oPath;
    e++;
  }

  return loni;
};

this.satisfyAll =
function(origin, list, loni, bundler) {
  var mns = this.asMod.mns, e = 0, len = list.length();
  while (e < len) {
    var mname = list.keys[e];
    var entry = this.findExportedEntry_m(mname);
    if (entry === null)
      entry = this.findInForwardEntries_m(origin, mname, loni, bundler);
    if (entry === null)
      this.err('unsatisfied.import');
    var im = list.at(e);
    im === entry.target /* a.js: import {e as a} from './a.js'; export let e = 5; */ || im.referTo(entry.target);
    e++;
  }
};

this.findInForwardEntries_m =
function(origin, mname, loni, bundler) {
  var mns = this.asMod.mns, e = 0, len = mns.length();
  while (e < len) {
    var satisfierNamespace = mns.at(e);
    if (satisfierNamespace === null) {
      var name = _u(mns.keys[e]);
      var oPath = bundler.cd(pathFor(name));
      var curName = tailFor(name)
      if (bundler.has(curName))
        satisfierNamespace = bundler.get(curName);
      else {
        satisfierNamespace = bundler.load(curName);
        loni.push(satisfierNamespace);
      }
      satisfierNamespace = satisfierNamespace['#scope'];
      mns.set(mns.keys[e], satisfierNamespace );
    }
    var entry = satisfierNamespace.findExportedEntry_m(mname);

    // a.js: export * from './a.js'; import {l} // will blow the stack if the satisfier scope is the same as the origin
    if (entry === null && origin !== satisfierNamespace)
      entry = satisfierNamespace.findInForwardEntries_m(origin, mname, loni, bundler);
    if (entry)
      return entry;
    e++;
  }
  return null;
};

},
function(){
this.spCreate_global =
function(mname, ref) {
  var newDecl = this.findGlobal_m(mname);
  ASSERT.call(this, !newDecl && !this.findDeclAny_m(mname),
    'global scope has already got this name: <'+_u(mname)+'>');

  ref.scope = this.parent;
  newDecl = new Decl().t(DT_GLOBAL).r(ref).n(_u(mname));
  this.insertGlobal_m(mname, newDecl);

  return newDecl;
};

this.insertGlobal_m =
function(mname, global) {
  ASSERT.call(this, global.isGlobal(), 'global');
  return this.parent.defs.set(mname, global);
};

this.findGlobal_m =
function(mname) {
  return this.parent.defs.has(mname) ?
    this.parent.defs.get(mname) : null;
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
this.setTS =
function(ts) {
  var ts0 = this.tempStack;
  this.tempStack = ts;
  return ts0;
};

this.setRR =
function(reachedRef) {
  var reachedRef = this.reachedRef;
  this.reachedRef = reachedRef;
  return reachedRef;
};

this.setScope =
function(scope) {
  var cur = this.cur;
  this.cur = scope ;
  return cur;
};

this.tr =
function(n, ownerBody, isVal) {
  var ntype = n.type;
  switch (ntype) {
  case 'EmptyStatement':
  case '#Untransformed':
  case 'Literal':
    return n;
  }

  var transformer = null;
  if (HAS.call(Transformers, ntype))
    transformer = Transformers[ntype];

  if (transformer === null)
    throw new Error('could not find <'+ntype+'>-transformer');

  return transformer.call(this, n, ownerBody, isVal);
};

},
function(){
this.makeReached =
function(target) {
  ASSERT.call(this, target.reached === null, 'reached used');
  target.reached = this.reachedRef;
};

this.needsTZ =
function(decl) {
  if (!decl.isTemporal())
    return false;

  if (!decl.isReached())
    return true;

  var ownerScope = decl.ref.scope, cur = this.cur;
  if (ownerScope === cur)
    return false;

  while (cur.parent !== ownerScope) {
    cur = cur.parent;
    ASSERT.call(this, cur, 'reached top before decl owner is reached -- tz test is only allowed in scopes that '+
      'can access the decl');
  }
  return cur.isHoisted();
};

this.toResolvedName =
function(id, bes) {
  var name = id.name, target = null;
  var isB = bes === 'binding';
  if (isB)
    target = this.cur.findDeclAny_m(_m(name));
  else {
    var ref = this.cur.findRefAny_m(_m(name));
    ASSERT.call(this, ref, 'name is not used in the current scope: <'+name+'>');
    target = ref.getDecl();
  }

  ASSERT.call(this, target, 'unresolved <'+name+'>');
  var hasTZ = !isB && this.needsTZ(target);
  
  if (hasTZ) {
    target.activateTZ();
    this.accessTZ(target.ref.scope);
  }

  return {
    target: target,
    bes: bes,
    id: id,
    tz: hasTZ,
    type: '#Untransformed' ,
    kind: 'resolved-name'
  };
};

},
function(){
Transformers['ArrayExpression'] =
function(n, isVal) {
  this.trList(n.elements, true );
  return n;
};

},
function(){
var TransformByLeft = {};
TransformByLeft['ArrayPattern'] =
function(n, isVal, isB) {
  n.right = this.tr(n.right, true);
  var s = [],
      t = this.saveInTemp(this.synth_ArrIter(n.right), s),
      list = n.left.elements,
      idx = 0,
      tElem = null;

  while (idx < list.length) {
    tElem = this.trArrayElem(list[idx], t, idx, isB);
    tElem && s.push(tElem);
    idx++;
  }

  tElem = this.synth_ArrIterEnd(t);
  tElem && s.push(tElem);

  this.releaseTemp(t);
  return this.synth_AssigList(s);
};

TransformByLeft['ObjectPattern'] =
function(n, isVal, isB) {
  n.right = this.tr(n.right, true);
  var s = [],
      t = this.saveInTemp(this.synth_ObjIter(n.right), s),
      l = n.left.properties,
      i = 0,
      tElem = null;

  while (i < l.length) {
    tElem = this.trObjElem(l[i], t, isB);
    tElem && s.push(tElem);
    i++;
  }

  isVal && s.push(this.synth_ObjIterEnd(t));

  this.releaseTemp(t);
  return this.synth_AssigList(s);
};

TransformByLeft['AssignmentPattern'] =
function(n, isVal, isB) {
  var l = n.left.left;
  var d = n.left.right;
  var r = n.right;

  ASSERT.call(this, r.type === '#Untransformed',
    'assignment pattern can not have a transformable right');

  var t = this.allocTemp();

  var test = this.synth_U(this.synth_TempSave(t, r));
  this.releaseTemp(t);

  var consequent = this.tr(d, true);
  var assig = this.synth_SynthAssig(
    l,
    this.synth_UCond(test, consequent, t),
    isB
  );

  return this.tr(assig, isVal);
};

TransformByLeft['MemberExpression'] =
function(n, isVal, isB) {
  ASSERT_EQ.call(this, isB, false);
  if (n.operator === '**=') {
    var mem = n.left;
    mem.object = this.tr(mem.object, true );
    var t1 = this.allocTemp();
    mem.object = this.synth_TempSave(t1, mem.object);
    mem.property = this.tr(mem.property, true);
    var t2 = this.allocTemp();
    mem.property = this.synth_TempSave(t2, mem.property);
    this.releaseTemp(t2);
    this.releaseTemp(t1);
    var r = this.tr(n.right, true );

    n.left = mem;
    n.operator = '=';
    n.right = this.synth_node_BinaryExpression(
      this.synth_node_MemberExpression(t1,t2), '**', r);
  } else {
    n.left = this.trSAT(n.left);
    n.right = this.tr(n.right, true);
  }
  return n;
};

TransformByLeft['Identifier'] =
function(n, isVal, isB) {
  n.left = this.toResolvedName(n.left, isB ? 'binding' : 'sat');
  n.right = this.tr(n.right, true);
  if (isB) {
    var target = n.left.target;
    if (!target.isReached())
      this.makeReached(target);
  } 
  else {
    n.left.target.ref.assigned();
    if (n.left.target.isRG())
      n = this.synth_GlobalUpdate(n, false);
  }
  return n;
};

Transformers['AssignmentExpression'] =
function(n, isVal, isB) {
  return TransformByLeft[n.left.type].call(this, n, isVal, false);
};

Transformers['#SynthAssig'] =
function(n, isVal) {
  ASSERT_EQ.call(this, isVal, false);
  return TransformByLeft[n.left.type].call(this, n, isVal, n.binding);
};

this.trArrayElem =
function(left, iter, at, isB) {
  var right = null;
  if (left && left.type === 'RestElement') {
    right = this.synth_ArrIterGetRest(iter, at);
    left = left.argument;
  }
  else
    right = this.synth_ArrIterGet(iter, at);

  if (left === null)
    return right;

  var assig = this.synth_SynthAssig(left, right, isB);
  return this.tr(assig, false);
};

this.trObjElem =
function(elem, iter, isB) {
  var name = elem.key;
  if (elem.computed)
    name = elem.key = this.tr(name, true );

  var right = this.synth_ObjIterGet(iter, name, elem.computed);
  var left = elem.value;

  return this.tr(this.synth_SynthAssig(left, right), false, isB);
};

},
function(){
Transformers['LogicalExpression'] = Transformers['BinaryExpression'] =
function(n, ownerList, isVal) {
  n.left = this.tr(n.left, true);
  n.right = this.tr(n.right, true);
  return n;
};

},
function(){
Transformers['BlockStatement'] =
function(n, isVal) {
  ASSERT_EQ.call(this, isVal, false);
  var e = this.setScope(n['#scope']);
  this.cur.synth_defs_to(this.cur.scs);
  this.trList(n.body, isVal);
  this.setScope(e);
  return n;
};

},
function(){
Transformers['CallExpression'] =
function(n, isVal) {
  var si = findElem(n.arguments, 'SpreadElement');
  if (si === -1) {
    n.callee = this.tr(n.callee, true );
    this.trList(n.arguments, true );
    return n;
  }

  var head = n.callee, mem = null;
  if ( head.type === 'MemberExpression') {
    var t = this.allocTemp();
    var h0 = head;
    head = this.synth_TempSave(t, head.object);
    h0.object = t;
    this.releaseTemp(t);
    h0.property = this.tr(h0.property, true );
    mem = h0;
  }
  else
    head = this.tr(head, true );

  this.trList(n.arguments, true );

  return this.synth_Call(head, mem, n.arguments);
};

},
function(){
Transformers['ConditionalExpression'] =
function(n, isVal) {
  n.test = this.tr(n.test, true);
  n.consequent = this.tr(n.consequent, isVal);
  n.alternate = this.tr(n.alternate, isVal);

  return n;
};

},
function(){
Transformers['ExpressionStatement'] =
function(n, isVal) {
  ASSERT_EQ.call(this, isVal, false);
  n.expression = this.tr(n.expression, false);
  return n;
};

},
function(){
Transformers['Identifier'] =
function(n, isVal) {
  n = this.toResolvedName(n, 'ex');
  return n;
};

this.trSAT_name =
function(n, isVal) {
  n = this.toResolvedName(n, 'sat');
  return n;
};

},
function(){
Transformers['IfStatement'] =
function(n, isVal) {
  ASSERT_EQ.call(this, isVal, false);
  n.test = this.tr(n.test, true);
  n.consequent = this.tr(n.consequent, false);
  if (n.alternate)
    n.alternate = this.tr(n.alternate, false);
  return n;
};

},
function(){
Transformers['MemberExpression'] =
function(n, isVal) {
  n.object = this.tr(n.object, true);
  if (n.computed) n.property = this.tr(n.property, true);
  return n;
};

this.trSAT_mem = Transformers['MemberExpression'];

},
function(){
Transformers['NewExpression'] =
function(n, isVal) {
  n.callee = this.tr(n.callee, true);
  this.trList(n.arguments, true);

  return n;
};

},
function(){
Transformers['ObjectExpression'] =
function(n, isVal) {
  var list = n.properties, e = 0;
  while (e < list.length) {
    var elem = list[e++];
    if (elem.computed)
      elem.key = this.tr(elem.key, true);
    elem.value = this.tr(elem.value, true);
  }
  return n;
};

},
function(){
Transformers['SequenceExpression'] =
function(n, isVal) {
  this.trList(n.expressions, isVal);
  return n;
};

},
function(){
Transformers['SpreadElement'] =
function(n, isVal) {
  ASSERT_EQ.call(this, isVal, true);
  n.argument = this.tr(n.argument, isVal);
  return n;
};

},
function(){
Transformers['SwitchStatement'] =
function(n, isVal) {
  ASSERT_EQ.call(this, isVal, false);
  var s = this.setScope(n['#scope']);
  n. discriminant = this.tr(n.discriminant, true);
  this.trList(n.cases, false);
  this.setScope(s);
  return n;
};

Transformers['SwitchCase'] =
function(n, isVal) {
  ASSERT_EQ.call(this, isVal, false);
  if (n.test !== null)
    n.test = this.tr(n.test, true);
  var rr = this.setRR({v: true});
  this.trList(n.consequent, false);
  rr = this.setRR(rr);
  rr .v = false;
  return n;
};

},
function(){
Transformers['UnaryExpression'] =
function(n, ownerList, isVal) {
  n.argument = this.tr(n.argument, ownerList, true);
  return n;
};

},
function(){
Transformers['UpdateExpression'] =
function(n, isVal) {
  var arg = this.trSAT(n.argument);
  n.argument = arg;
  if (isResolvedName(arg)) {
    arg.target.ref.assigned();
    if (arg.target.isRG())
      n = this.synth_GlobalUpdate(n, true);
  }

  return n;
};

},
function(){
Transformers['VariableDeclaration'] =
function(n, isVal) {
  ASSERT_EQ.call(this, isVal, false);
  var list = n.declarations, kind = n.kind, l = 0, tr = null;
  var s = [];
  while (l < list.length) {
    tr = this.transformDtor(list[l++], kind );
    tr && s.push(tr);
  }
  return this.synth_AssigList(s);
};

this.transformDtor =
function(n, kind) {
  var assig = null, left = n.id, right = n.init;
  if (right === null) {
    if (kind === 'var')
      return null;
    right = this.synth_Void0();
  }

  assig = this.synth_SynthAssig(left, right, true);
  return this.tr(assig, false);
};

},
function(){
Transformers['WhileStatement'] =
function(n, isVal) {
  n.test = this.tr(n.test, true);
  n.body = this.tr(n.body, false);
  return n;
};

},
function(){
Transformers['ExportNamedDeclaration'] = 
Transformers['ExportDefaultDeclaration'] =
Transformers['ExportAllDeclaration'] = function(n, isVal) { return null; };
Transformers['ImportDeclaration'] =
function(n, isVal) { return null; };

},
function(){
this.transformRawFn =
function(n, isVal) {
  var s = this.setScope(n['#scope'] );
  this.cur.synth_start();
  ASSERT.call(this, !this.cur.inBody, 'inBody');
  var argsPrologue = this.transformParams(n.params);
  if (argsPrologue) n.params = null;
  this.cur.activateBody();
  var fnBody = n.body.body;
  this.trList(fnBody, false);
  this.cur.deactivateBody();
  this.cur.synth_finish();
  this.setScope(s);
  return this.synth_TransformedFn(n, argsPrologue);
};

this.transformDeclFn =
function(n) {
  var target = this.cur.findDeclOwn_m(_m(n.id.name));
  ASSERT.call(this, target, 'unresolved ('+name+')');
  n = this.transformRawFn(n, false);
  n.target = target;
  return n;
};

this.transformExprFn =
function(n) {
  n.id && this.synthFnExprName(n['#scope'].scopeName);
  n = this.transformRawFn(n, true);
  return n;
};

this.transformParams =
function(list) {
  if (this.cur.firstNonSimple)
    return this.transformParamsToArgumentsPrologue(list);

  var argd = null, argsmap = {}, e = list.length - 1;
  while (e >= 0) {
    var a = list[e];
    var mname = _m(a.name);
    if (HAS.call(argsmap, mname)) {
      if (argd === null) {
        var lg = this.cur.gocLG('argd');
        argd = lg.getL(0);
        if (argd === null) {
          argd = lg.newL();
          argd.name = '_';
          lg.seal();
        }
        argd.type |= DT_FNARG;
      }
      list[e] = this.synth_SynthName(argd );
    }
    else {
      a = this.toResolvedName(a, 'binding');
      argsmap[mname] = list[e] = a;
    }
    e--;
  }

  return null;
};

Transformers['FunctionDeclaration'] =
function(n, isVal) {
  ASSERT_EQ.call(this, isVal, false);
  this.cur.pushFun(n.id.name, this.transformDeclFn(n));
  return null;
};

Transformers['FunctionExpression'] =
function(n, isVal) {
  return this.transformExprFn(n);
};

this.transformParamsToArgumentsPrologue =
function(list) {
  var a = null, t = null, e = 0;
  var prologue = [];
  while (e < list.length) {
    var left = list[e];
    if (left.type === 'RestElement') {
      left = left.argument;
      if (left.type === 'Identifier') {
        left = this.toResolvedName(left, 'binding');
        prologue.push(this.synth_ArgRest(left, e));
      }
      else {
        var t = this.allocTemp();
        prologue.push(this.synth_ArgRest(t, e));
        this.releaseTemp(t);
        a = this.synth_SynthAssig(left, t, true);
        a = this.tr(a, false);
        if (a)
          prologue.push(a);
      }
      ASSERT.call(this, e === list.length - 1, 'not last');
    }
    else {
      a = this.synth_SynthAssig(left, this.synth_ArgAt(e), true);
      a = this.tr(a, false)
      if (a)
        prologue.push(a);
    }
    e++;
  }

  return this.synth_AssigList(prologue);
};

this.synthFnExprName =
function(fnName) {
  ASSERT.call(this, fnName.synthName === "", 'synth');
  ASSERT.call(this, fnName.ref.scope.isExpr(), 'fn not an expr');
  var baseName = fnName.name, mname = "", synthName = baseName, num = 0;
  var rsList = fnName.ref.rsList;

  RENAME:
  do {
    mname = _m(synthName);
    var synth = null;
    var l = 0;

    while (l < rsList.length) {
      var scope = rsList[l++ ];
      if (!scope.synth_ref_may_escape_m(mname))
        continue RENAME;

      synth = scope.synth_ref_find_homonym_m(mname);
      if (synth && synth !== fnName)
        continue RENAME;
    }

    break;
  } while (synthName = baseName + "" + (num+=1), true);

  fnName.synthName = synthName;
};

},
function(){
Transformers['#Bundler'] =
function(n, isVal) {
  ASSERT.call(this, this.bundler === null, 'bundler');
  this.bundler = n;
  n.main = this.tr(n.main, false);
  return n;
};

},
function(){
Transformers['DoWhileStatement'] =
function(n, isVal) {
  n.body = this.tr(n.body, false);
  n.test = this.tr(n.test, true);
  return n;
};

},
function(){
Transformers['Program'] =
function(n, isVal) {
  ASSERT_EQ.call(this, isVal, false);
  this.script = n['#scope'];
  if (this.bundler)
    n['#imports'] = n['#scope'].satisfyWith(this.bundler);

  this.global = this.script.parent;
  ASSERT.call(this, this.global.isGlobal(), 'script can not have a non-global parent');
  var ps = this.setScope(this.script);
  var ts = this.setTS([]);

  this.cur.synth_start();
  this.trList(n.body, isVal);
  this.cur.synth_finish();

  return n;
};

},
function(){
this.synth_Temp =
function(liq) {
  return {
    kind: 'temp',
    occupied: 0,
    liq: liq,
    type: '#Untransformed'
  };
};

this.synth_TempSave =
function(t, expr) {
  ASSERT.call(this, isTemp(t), 't is not temp');
  if (t === expr)
    return null;
  return {
    kind: 'temp-save',
    right: expr,
    left: t,
    type: '#Untransformed'
  };
};

this.synth_AssigList =
function(list) {
  return {
    kind: 'assig-list',
    type: '#Untransformed' ,
    list: list
  };
};

this.synth_UCond =
function(t,c,a) {
  return {
    kind: 'ucond' ,
    test: t,
    consequent: c,
    type: '#Untransformed' ,
    alternate: a
  };
};

this.synth_ArrIterEnd =
function(iterVal) {
  return {
    kind: 'arr-iter-end' ,
    type: '#Untransformed' ,
    iter: iterVal
  };
};

this.synth_ArrIter =
function(iterVal) {
  this.accessJZ();
  return {
    kind: 'arr-iter',
    type: '#Untransformed' ,
    iter: iterVal
  };
};

this.synth_ArrIterGet =
function(iterVal, at) {
  return {
    kind: 'arr-iter-get',
    type: '#Untransformed',
    iter: iterVal,
    idx: at
  };
};

this.synth_SynthAssig =
function(left, right, isB) {
  return {
    binding: isB || false,
    right: right,
    left: left,
    type: '#SynthAssig',
    operator: '='
  };
};

this.synth_Call =
function(head, mem, list) {
  return {
    head: head,
    mem: mem,
    list: list,
    type: '#Untransformed' ,
    kind: 'call'
  };
};

this.synth_U =
function(expr) {
  this.accessJZ();
  return {
    kind: 'u',
    type: '#Untransformed' ,
    value: expr
  };
};

this.synth_ArrIterGetRest =
function(iter, at) {
  return {
    kind: 'arr-iter-get-rest',
    type: '#Untransformed' ,
    iter: iter,
    idx: at
  };
};

this.synth_ObjIter =
function(iterVal) {
  return {
    kind: 'obj-iter',
    type: '#Untransformed' ,
    iter: iterVal
  };
};

this.synth_ObjIterEnd =
function(iterVal) {
  return {
    kind: 'obj-iter-end' ,
    type: '#Untransformed' ,
    iter: iterVal
  };
};

this.synth_ObjIterGet =
function(iter, at, isC) {
  return {
    kind: 'obj-iter-get',
    type: '#Untransformed' ,
    iter: iter,
    idx: at,
    computed: isC
  };
};

this.synth_ArgAt =
function(at) {
  return {
    type: '#Untransformed' ,
    idx: at,
    kind: 'arg-at'
  };
};

this.synth_ArgRest =
function(ex, at) {
  return {
    idx: at,
    left: ex,
    kind: 'arg-rest',
    type: '#Untransformed'
  };
};

var SYNTH_VOID0 = {
  type: 'UnaryExpression',
  operator: 'void',
  argument: {
    type: 'Literal',
    value: 0,
    raw: '0',
  },
  '#y': 0
};

this.synth_node_BinaryExpression =
function(left,o,right,y) {
  return {
    left: left,
    operator: o,
    right: right,
    type: 'BinaryExpression',
    '#y': y || 0
  };
};

this.synth_Void0 = function() { return SYNTH_VOID0; };

this.synth_SynthName =
function(liq) {
  return {
    type: '#Untransformed' ,
    kind: 'synth-name',
    liq: liq
  };
};

this.synth_node_MemberExpression =
function(n,v) {
  return {
    type: 'MemberExpression',
    computed: true,
    object: n,
    property: v,
    '#y': 0
  };
};

this.synth_TransformedFn =
function(n, a) {
  return {
    type: '#Untransformed' ,
    kind: 'transformed-fn' ,
    fun: n,
    argsPrologue: a,
    target: null
  };
};

this.synth_GlobalUpdate =
function(assig, isU) {
  return {
    isU: isU,
    kind: 'global-update',
    assig: assig,
    type: '#Untransformed'
  };
};


},
function(){
this.releaseTemp =
function(t) {
  ASSERT.call(this, t.occupied, 'unoccupied temp');
  t.occupied = 0;

  this.tempStack.push(t);
  return t;
};
 
this.saveInTemp =
function(expr, list) {
  var t = this.allocTemp();
  var tsave = this.synth_TempSave(t, expr);
  tsave && list.push(tsave);
  return t;
};

this.createTemp =
function() {
  var liq = this.cur.scs.gocLG('<t>').newL();
  liq.name = 't';
  return this.synth_Temp(liq);
};

this.allocTemp =
function() { 
  var t = null;
  if (this.tempStack.length !== 0)
    t = this.tempStack.pop();
  else 
    t = this.createTemp();

  ASSERT.call(this, t.occupied === 0, 'occupied temp');
  t.occupied = 1;

  t.liq.track(this.cur);

  return t;
};

},
function(){
this.trListChunk =
function(list, isVal, s, e) {
  while (s<=e) {
    list[s] = this.tr(list[s], isVal);
    s++ ; 
  }
};

this.trSAT =
function(n, isVal) {
  switch (n.type) {
  case 'Identifier':
    return this.toResolvedName(n, 'sat');
  case 'MemberExpression':
    return this.trSAT_mem(n);
  }
  ASSERT.call(this, false, 'SAT !== <'+n.type+'>');
};

this.accessTZ =
function(scope) {
  var lg = scope.scs.gocLG('tz');
  var l = lg.getL(0);
  if (!l) {
    l = lg.newL();
    l.name = 'tz';
    lg.seal();
  }
  return l.track(this.cur);
};

this.accessJZ =
function() {
  return;
  var lg = this.scriptScope.gocLG('jz');
  var l = lg.getL(0);
  if (!l) {
    l = lg.newL();
    lg.seal();
  }
  return l.track(this.cur);
};

this.trList =
function(list, isVal) {
  return this.trListChunk(list, isVal, 0, list.length-1) ;
};

}]  ],
[VirtualSourceLoader.prototype, [function(){
this.has =
function(base, sub) {
  base = cd("", base);
  sub = cd(base, sub);
  return HAS.call(this.fsmap, _m(sub));
};

this.load =
function(base, sub) {
  base = cd("", base);
  ASSERT.call(this, this.has(base, sub), '[:'+sub+':]');
  sub = cd(base, sub);
  return this.fsmap[_m(sub)];
};

this.set =
function(base, sub, src) {
  base = cd("", base);
  sub = cd(base, sub);
  this.fsmap[_m(sub)] = src;
  return this;
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
null]);
this.parse = function(src, isModule ) {
  var newp = new Parser(src, isModule);
  return newp.parseProgram();
};

this.Parser = Parser;  
// this.ErrorString = ErrorString;
// this.Template = Template;
this.Emitter = Emitter;
this.Transformer = Transformer;
// this.Scope = Scope;
// this.Hitmap = Hitmap;
// this.GlobalScope = GlobalScope;

this.transpile = function(src, options) {
  var p = new Parser(src, options);
  return new Emitter().eA(
    new Transformer().tr(p.parseProgram()),
    EC_NONE,
    false).code ;
};

this.Scope = Scope; 
this.FunScope = FunScope; 
this.CatchScope = CatchScope; 
this.GlobalScope = GlobalScope; 
this.ConcreteScope = ConcreteScope; 

this.ST_GLOBAL = 1,
this.ST_MODULE = ST_GLOBAL << 1,
this.ST_SCRIPT = ST_MODULE << 1,
this.ST_EXPR = ST_SCRIPT << 1,
this.ST_DECL = ST_EXPR << 1,
this.ST_OBJ = ST_DECL << 1,
this.ST_FN = ST_OBJ << 1,
this.ST_CLS = ST_FN << 1,
this.ST_CLSMEM = ST_CLS << 1,
this.ST_STATICMEM = ST_CLSMEM << 1,
this.ST_OBJMEM = ST_STATICMEM << 1,
this.ST_METH = ST_OBJMEM << 1,
this.ST_CTOR = ST_METH << 1,
this.ST_SETTER = ST_CTOR << 1,
this.ST_GETTER = ST_SETTER << 1,
this.ST_ACCESSOR = ST_GETTER|ST_SETTER,
this.ST_ARROW = ST_GETTER << 1,
this.ST_GEN = ST_ARROW << 1,
this.ST_ASYNC = ST_GEN << 1,
this.ST_BLOCK = ST_ASYNC << 1,
this.ST_BARE = ST_BLOCK << 1,
this.ST_CATCH = ST_BARE << 1,
this.ST_PAREN = ST_CATCH << 1,
this.ST_NONE = 0; 

this. VirtualSourceLoader = VirtualSourceLoader;
this. Bundler = Bundler;

this.cd = cd;
this.pathFor = pathFor;
this.tailFor = tailFor;
;}).call (function(){try{return module.exports;}catch(e){return this;}}.call(this))