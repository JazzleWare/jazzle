(function(){
"use strict";
;
function Actix(role) { // activity ctx
  ASSERT.call(this, arguments.length === 1, 'len' );
  this.ai = activeID_new();
  this.activeIf = null;
  this.activeness = ANESS_UNKNOWN;
  this.ns = 0;
  this.role = role;
  this.inactiveIf = null;
}
;
function AutoImex() {
  this.Parser = null;
  this.Emitter = null;
  this.sources = new SortedObj();
  this.unresolvedNames = new SortedObj();
  this.bundleBindings = new SortedObj();
  this.clsUriList = {};
}
;
function BundleScope() { ConcreteScope.call(this, null, ST_BUNDLE); }
;
function Bundler(pathMan) {
  this.type = '#Bundler';
  this.pathMan = pathMan;
  this.curDir = "";
  this.curURI = "";
  this.resolver = null;
  this.freshSources = [];
  this['#scope'] = null;
  this.rootNode = null;
  this.bundleScope = new BundleScope();
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

  this.catchVar = null;
  this.isBooted = false;
  
  this.synthNamesUntilNow = null;
  this.renamer = null;
}
;
function ClassScope(sParent, sType) {
  Scope.call(this, sParent, sType|ST_CLS);  
  this.scopeName = null;
}
;
function Comments() {
  this.c = [];
  this.n = false;
  this.firstLen = 0;
}
;
function ConcreteScope(parent, type) {
  Scope.call(this, parent, type);

  this.liquidDefs = new SortedObj();
  this.synthNamesUntilNow = null;

  this.spThis = null;
  this.isBooted = false;

  this.renamer = null;
}
;
function Decl() {
  Actix.call(this, ACT_DECL );
  this.ref = null;
  this.idx = -1;
  this.name = "";
  this.site = null;
  this.msynth = -1;
  this.hasTZCheck = false;
  this.reached = null;
  this.type = DT_NONE;
  this.synthName = "";
  this.rsMap = null;
  this.realTarget = null;
}
;
function Emitter() {
  this.indentCache = [""];
  this.indentString = '  ';
  this.indentLevel = 0;

  this.wrapLimit = 0;

  this.curLineIndent = 0;
  this.curLineHasLineBreakBefore = false;
  this.curLine = "";

  this.pendingSpace = SP_NONE;

  this.nextLineIndent = 0;
  this.nextLineHasLineBreakBefore = false;

  this.finishingLine = false;

  this.guard = null;
  this.guardArg = null;
  this.guardListener = null;
  this.defaultGuardListener = {v: false};
  this.runningGuard = false;

  this.ttype = ETK_NONE;

  // <sourcemap-related>
  this.emcol_cur = 0;
  this.emcol_latestRec = 0;

  this.emline_cur = 0;
  this.emline_latestRec = 0;

  this.srci_cur = 0; // -1;
  this.srci_latestRec = 0; // -1;

  this.namei_cur = -1;
  this.namei_latestRec = -1;

  this.loc_latestRec = {line: 1, column: 0};

  this.sm = "";
  this.lm = "";

  this.ln_vlq_tail = "";
  this.ln_emcol_cur = 0;
  this.ln_emcol_latestRec = 0;

  this.pendingSrcLoc = null;

  this.hasRecorded_SMLinkpoint = false;
  this.hasRecorded_emcol_latestRec = false;

  this.smNameList = new SortedObj();
  this.smSrcList = new SortedObj();
  // </sourcemap-related>

  this.smLen = 0;
  this.smLineStart = false;

  this.outLen = 0;

  this.emitters = createObj(Emitters);
  this.allow = { space: true, nl: true, comments: { l: true, m: true }, elemShake: false };
  this.out = "";
  this.outActive = false;

  this.jzcalls = new SortedObj();
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
// TODO: inBody makes the logic brittle
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

  this.closureLLINOSA = null;

  this.refs = this.argRefs;

  this.spArguments = null;
  this.spSuperCall = null;

}
;
function GlobalScope() {
  ConcreteScope.call(this, null, ST_GLOBAL);  
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
function Liquid(category) {
  Decl.call(this);
  this.type |= DT_LIQUID;
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

  this.bundler = null;
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

  this.cb = null;
  this.parenAsync = null; // so that things like (async)(a,b)=>12 will not get to parse.
  this.commentBuf = null;
  this.errorListener = this; // any object with an `onErr(errType "string", errParams {*})` will do
  this.parenScope = null;  

  this.regPendingBQ = null;
  this.regPendingCQ = false;
  this.regLastBareElem = null;
  this.regErr = null;
  this.regIsQuantifiable = false;
  this.regSemiRange = null;
  this.regCurlyChar = false;
  this.regLastOffset = -1;
  this.regNC = -1;

  this.regexFlags = this.rf = {};

  this.commentCallback = null;

  this.argploc = null;

  this.pure = false; // pure-ness
};
;
function PathMan() {}
;
function Ref(scope) {
  this.i = 0;
  this.rsList = [];
  this.scope = scope || null;
  this.d = 0;
  this.targetDecl_nearest = null;
  this.hasTarget = false;
  this.parentRef = null;
  this.lhs = 0;
}
;
function ResourceResolver() {
  this.savedNodes = {}; 
  this.bundleScope = null;
}
;
function Scope(sParent, type) {
  Actix.call(this, ACT_SCOPE);
  this.parent = sParent;
  this.parent && ASSERT.call(this, this.parent.reached, 'not reached');
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

  this.synthBase = 
    this.isSourceLevel() ? null : this.isConcrete() ? this.scs :
    this.isBundle() || this.isGlobal() ? this : this.parent.synthBase;

  this.sourceScope = null;

  this.reached = true;
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
  this.spThis = null;

  this.allSourcesImported = this.asi = new SortedObj();
  this.allNamesExported = this.ane = new SortedObj();
  this.allSourcesForwarded = this.asf = new SortedObj();

  this.latestUnresolvedExportTarget = null;
  this.allUnresolvedExports = this.aue = new SortedObj();
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

  // this could be per scope (i.e., a scope attibute),
  this.tempStack = [];

  this.reachedRef = {v: true};
  this.cvtz = {};
  this.thisState = THS_NONE;

  // name.activeIf[`cur.scopeID] = `cur if set
  this.activeIfScope = false;

  // for var n in.ls `activeIfNames: name.activeIf[n#getID] = n
  this.activeIfNames = null; // TODO: should rename to activeIfOther, because it can actually contain name-, scope-, or bare actices (actixes)

  this.curNS = 0; // sinde-effencts
  this.curAT = null; // activation target in use (mostly, it is just the same thing as this.cur)

  this.renamer = renamer_incremental;
}
;
function VirtualResourceResolver(pathMan) {
  ResourceResolver.call(this, pathMan);
  this.fsMap = {};
}
;
 Scope.prototype = createObj(Actix.prototype);
 ConcreteScope.prototype = createObj(Scope.prototype);
 GlobalScope.prototype = createObj(ConcreteScope.prototype);
   Decl.prototype = createObj(Actix.prototype);
 FunScope.prototype = createObj(ConcreteScope.prototype);
 ModuleScope.prototype = createObj(ConcreteScope.prototype);
 ClassScope.prototype = createObj(Scope.prototype);
 CatchScope.prototype = createObj(Scope.prototype);
 ParenScope.prototype = createObj(Scope.prototype);
 ScopeName.prototype = createObj(Decl.prototype);
 Liquid.prototype = createObj(Decl.prototype);
 SourceScope.prototype = createObj(ConcreteScope.prototype);
 BundleScope.prototype = createObj(ConcreteScope.prototype);
 VirtualResourceResolver.prototype = createObj(ResourceResolver.prototype);
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
    CH_d = char2int('d'), CH_D = char2int('D'),
    CH_g = char2int('g'),
    CH_f = char2int('f'), CH_F = char2int('F'),
    CH_c = char2int('c'),
    CH_i = char2int('i'),
    CH_m = char2int('m'),
    CH_n = char2int('n'),
    CH_o = char2int('o'), CH_O = char2int('O'),
    CH_r = char2int('r'),
    CH_s = char2int('s'), CH_S = char2int('S'),
    CH_t = char2int('t'),
    CH_u = char2int('u'), CH_U = char2int('U'),
    CH_v = char2int('v'),
    CH_w = char2int('w'), CH_W = char2int('W'),
    CH_x = char2int('x'), CH_X = char2int('X'),
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

var B = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
var I_31 = allOnes(31);

function allOnes(len) { var n = 0, s = 0; while (s < len) n += (1 << s++); return n; }


function ASSERT(cond, message) { if (!cond) throw new Error(message); }
function ASSERT_EQ(val,ex) { ASSERT.call(this, val === ex, 'val must be <'+ex+'>, not <'+val+'>'); }

var ACTIVE_ID = 0;
function activeID_new() { return ++ACTIVE_ID; }

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
    EC_IN = EC_NON_SEQ << 1,
    EC_ATTACHED = EC_IN << 1,
    EC_JZ = EC_ATTACHED << 1;

var EST_BREAKABLE = 1,
    EST_OMITTABLE = EST_BREAKABLE << 1,
    EST_NONE = 0;

var SP_BREAKABLE = 1, SP_OMITTABLE = SP_BREAKABLE << 1, SP_NONE = 0;

var ETK_NONE = 0,
    ETK_ID = 1,
    ETK_MIN = ETK_ID << 1,
    ETK_DIV = ETK_MIN << 1,
    ETK_ADD = ETK_DIV << 1,
    ETK_NUM = ETK_ADD << 1,
    ETK_STR = ETK_NUM << 1,
    ETK_NL = ETK_STR << 1,
    ETK_COMMENT = ETK_NL << 1;

var PE_NO_NONVAR = 1,
    PE_NO_LABEL = PE_NO_NONVAR << 1,
    PE_LEXICAL = PE_NO_NONVAR,
    PE_NONE = 0;

var CHK_T = 1,
    CHK_V = CHK_T << 1,
    CHK_NONE = 0;

// `this` state
var THS_NEEDS_CHK = 1,
    THS_IS_REACHED = THS_NEEDS_CHK << 1,
    THS_NONE = 0;

var ANESS_UNKNOWN = -2,
    ANESS_CHECKING = -1,
    ANESS_INACTIVE = 0,
    ANESS_ACTIVE = 1;

var ACT_BARE = 0,
    ACT_DECL = 1,
    ACT_SCOPE = 2;

var CVTZ_T = 1,
    CVTZ_C = CVTZ_T << 1,
    CVTZ_NONE = 0;

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
var TransformByLeft = {};
var Transformers = {}; 
var UntransformedEmitters = {};
;
var defaultJZ = '\
function er(str) { throw new Error(err) }\n\
function tz(str) { er("\'"+str+"\' is in its tz") }\n\
function cv(str) { er("\'"+str+"\' is immutable") }\n\
function r(v) { if (v) er("returned without calling super constructor") }\n\
function n(b,l) {\n\
  var str = "new b(", e = 0;\n\
  while (e < l.length) {\n\
    if (e) str += ",";\n\
    str += "l["+e+"]";\n\
    e++\n\
  }\n\
  return eval(str)\n\
}\n\
function c(c,l) { return c.apply(void 0, l) }\n\
function ex(a,b) { return Math.pow(a,b) }\n\
function obj() {\n\
  var r = arguments[0], e = 1;\n\
  while (e < arguments.length) {\n\
    r[arguments[e]] = r[arguments[e+1]];\n\
    e += 2\n\
  }\n\
  return r\n\
}\n\
function u(v) { return v === void 0 }\n\
function cm(t,m,l) { return m.apply(t, l) }\n\
function cr(o) { var mkr = (0,function() {}); mkr.prototype = o; return new mkr }\n\
var HAS = {}.hasOwnProperty;\n\
function has(o,n) { return HAS.call(o,n) }\n\
function cls() {\n\
  var b = arguments[0], p;\n\
  if (arguments.length === 2) {\n\
    var h = arguments[1];\n\
    b.prototype = p = cr(h.prototype);\n\
    for (var name in h)\n\
      if (has(h,name)) b[name] = h[name];\n\
  } else \n\
    p = b.prototype;\n\
  p.constructor = b;\n\
  return b;\n\
}\n\
\n\
var arrIter = function() {\n\
 function arrIter0(v) { this.v = v; this.i = 0; }\n\
 var e = arrIter0.prototype;\n\
 e.get = function() { return this.v[this.i++] };\n\
 e.end = function() { return this.v };\n\
 return function(v) { return new arrIter0(v); }\n\
}();\n\
\n\
function arr() {}\n\
function sp(){ }\n\
function h(cls) {}\n\
'
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
var PREC_MUL = BINP['/'] = BINP['%'] = BINP['*'] =  nextl(PREC_ADD); // *, /
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
function isSurroComp(n) {
  return n.type === '#Regex.SurrogateComponent';
}

function isLead(n) {
  return isSurroComp(n) && n.kind === 'lead' ;
}

function isTrail(n) {
  return isSurroComp(n) && n.kind === 'trail';
}

function uAkin(a,b) {
  ASSERT.call(this, isSurroComp(a), 'a');
  ASSERT.call(this, isSurroComp(b), 'b');
  return a.escape === b.escape;
}
;
function renamer_incremental(base, i) {
  if (i === 0) return base;
  return base + "" + i;
}

var HEAD = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_$', TAIL = HEAD + '1234567890',
    HEADLEN = HEAD.length, TAILLEN = TAIL.length;

// naive minified names -- true minified names are shortest for the most used name, and longerst for the least used name
function renamer_minify(base, i) {
  if (base.length === 1 && i === 0)
    return base;
  var tail = false, name = "";

  while (true) {
    do {
      var m = -1;
      if (tail) { m = i % TAILLEN; name += TAIL.charAt(m); i =  (i-m)/TAILLEN; }
      else { m = i % HEADLEN; name += HEAD.charAt(m); i = (i-m)/HEADLEN; }
    } while (i > 0);
    if (iskw(name)) { name = ""; i++; continue; }
    break;
  }

  return name;
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
    DT_EFW = DT_ESELF << 1,
    DT_BOMB = DT_EFW << 1 ,
    DT_EXPORTED = DT_EDEFAULT|DT_EALIASED|DT_ESELF,
    DT_IMPORTED = DT_IDEFAULT|DT_IALIASED|DT_INAMESPACE,
    DT_NONE = 0;

var RS_ARGUMENTS = _m('arguments'),
    RS_SCALL = _m('special:scall'),
    RS_THIS = _m('special:this');

var ATS_DISTINCT = 1,
    ATS_UNSURE = ATS_DISTINCT << 1,
    ATS_SAME = ATS_UNSURE << 1;

//   line sourcemap
//var LSM_NEED_NO_LINKPOINT = 1,
//    LSM_MUST_HAVE_LINKPOINT = LSM_MUST_HAVE_LINKPOINT << 1,
//    LSM_RECORDED_LINKPOINT = LSM_MUST_HAVE_LINKPOINT << 1,
//    LSM_NONE = 0;
 
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

function asBitmap(str) {
  var bm = [], e = 0;
  while (e < str.length) {
    var ch = str.charCodeAt(e);
    var byteIndex = ch >> D_INTBITLEN;
    while (bm.length <= byteIndex) bm.push(0);
    bm[byteIndex] |= (1 << (ch & M_INTBITLEN));
    e++;
  }
  return bm;
}

function makeAcceptor(str) {
  var bm = asBitmap(str);
  return function(ch) {
    var byteIndex = ch >> D_INTBITLEN;
    if (byteIndex >= bm.length)
      return 0;
    return bm[byteIndex] & (1 << (ch & M_INTBITLEN));
  };
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

function NL(tt) { return tt & ETK_NL; }

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

function CB(n) {
  ASSERT.call(this, HAS.call(n, '#c'), '#c');
  return n['#c'];
}

function cmn_ac(cb, name, list) {
  if (list === null)
    return;
  if (!HAS.call(cb, name) || cb[name] === null)
    cb[name] = list;
  else
    cb[name].mergeWith(list);
}

function cmn_erase(cb, name) {
  if (HAS.call(cb, name)) {
    var list = cb[name];
    cb[name] = null;
    return list;
  }
  return null;
}

function cmn(cb, name) {
  return HAS.call(cb, name) ? cb[name] : null;
}
   
function isAssigList(n) {
  return n.type === '#Untransformed' && n.kind === 'assig-list';
}

function cpReg(n) {
  switch (n.type) {
  case '#Regex.Hy':
  case '#Regex.SurrogateComponent':
  case '#Regex.CharSeq':
  case '#Regex.Ho':
    return n.cp;
  default:
    return -1;
  }
}

function isCharSeq(n) { return n.type === '#Regex.CharSeq'; }
function isTemp(n) {
  return n.type === '#Untransformed' &&
    n.kind === 'temp';
}

function isInteger(n) { return (n|0) === n; }

function belongs1to2(t1, t2) {
  return t1.indexOf(t2+'.') === 0 || t1 === t2;
}

function isResolvedName(n) {
  return belongs1to2(n.type, '#-ResolvedName');
}

// vlq(-(2 ** 31))
function vlq1sh31() {
  var str = B[(1<<5)|1], len = 32 - 4;
  while (true) {
    if (len >= 5) { str += B[1<<5]; len -= 5; }
    else { str += B[1 << (len-1)]; break }
  }
  return str;
}

function tzc(resolvedName) {
  return (resolvedName['#cvtz'] & CVTZ_T) !== 0;
}

function cvc(resolvedName) {
  return (resolvedName['#cvtz'] & CVTZ_C) !== 0;
}

function tg(resolvedName) {
  var real = resolvedName['#ref'].getDecl_real();
  ASSERT.call(this, real.ref.parentRef === null, 'relocated' );
  return real;
}

function iskw(name, v, s) {
  switch (name.length) {
  case 1: return false;
  case 2:
    switch (name) {
    case 'do': case 'if': case 'in':
      return true;
    }
    return false;
  case 3:
    switch (name) {
    case 'new': case 'for': case 'try':
    case 'let': case 'var':
      return true;
    case 'int':
      return v <= 5;
    }
    return false;

  case 4:
    switch (name) {
    case 'null': case 'void': case 'this':
    case 'true': case 'case': case 'else':
    case 'with': case 'enum':
      return true;
    case 'byte': case 'char':
    case 'goto': case 'long':
      return v <= 5;
    }
    return false;

  case 5:
    switch (name) {
    case 'super': case 'break':  case 'catch':
      return true;
    case 'class': case 'const': case 'throw':
    case 'while':
      return true;
    case 'yield': 
      return s;
    case 'false':
      return true;
    case 'await':
    case 'async':
      return false;
    case 'final': case 'float': case 'short':
      return v <= 5;
    }
    return false;

  case 6:
    switch (name) {
    case 'static':
      return s || v <= 5;
    case 'delete': case 'typeof': case 'export':
    case 'import': case 'return': case 'switch':
      return true;
    case 'public':
      return s;
    case 'double': case 'native': case 'throws':
      return v <= 5;
    }
    return false;

  case 7:
    switch (name) {
    case 'default': case 'extends': case 'finally':
      return true;
    case 'package': case 'private':
      return s;
    case 'boolean':
      return v <= 5;
    }
    return false;

  case 8:
    switch (name) {
    case 'function': case 'debugger': case 'continue':
      return true;
    case 'abstract': case 'volatile':
      return v <= 5;
    }
    return false;

  case 9:
    switch (name) {
    case 'interface': case 'protected':
      return s;
    case 'transient':
      return v <= 5;
    }
    return false;

  case 10:
    switch (name) {
    case 'instanceof': return true;
    case 'implements': return s || v <= 5;
    }
    return false;

  case 12:
    return v <= 5 && name === 'synchronized' ;
  }
  return false;
};
 
function vlq(num) {
  var hexet = 0;
  var ro = 0; // right offset (0 <= ro <= lastRo)
  var lastRo = 5;
  var v = "";
  if (num < 0) {
    hexet = 1;
    num = ((~(num & I_31)) & I_31);
    if (num === I_31)
      return vlq1sh31();
    ++num;
  }
  ro = 1; // sign bit
  while (true) {
    var maxRead = 5 - ro;
    var maxMask = (1<<maxRead)-1;
    var c = 1; // continue;

    var bits = num & maxMask; 
    num >>>= maxRead;
    if (num === 0)
      c = 0;
    hexet |= bits << ro;
    if (c) hexet |= 1 << lastRo;
    v += B[hexet];
    if (num <= 0)
      break;
    maxRead = 5;
    ro = 0; hexet = 0;
  } 
  return v;
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

function wcb_ADD_b(rawStr, tt) {
  if (tt & ETK_ADD) this.bs();
  else NL(tt) || this.os();
}

function wcb_DIV_b(rawStr, tt) {
  if (tt & ETK_DIV) this.bs();
  else NL(tt) || this.os();
}

function wcb_MIN_b(rawStr, tt) {
  if (tt & ETK_MIN) this.bs();
  else NL(tt) || this.os();
}

function wcb_ADD_u(rawStr, tt) {
  if (tt & ETK_MIN) this.bs();
}

function wcb_intDotGuard(rawStr, tt) {
  rawStr === '.' && this.bs();
}

function wcb_MIN_u(rawStr, tt) {
  if (tt & ETK_MIN) this.bs();
}

function wcb_idNumGuard(rawStr, tt) {
  if (tt & (ETK_NUM|ETK_ID)) this.bs();
}

function wcb_afterStmt(rawStr, tt) {
  if (!NL(tt) || (tt & ETK_COMMENT))
    this.l();
}

function wcb_afterLineComment(rawStr, tt) {
  if (tt === ETK_NL)
    return;
  this.finishCurrentLine();
}

function wcb_afterNew(rawStr, tt) {
  wcb_idNumGuard.call(this, rawStr, tt);
}

function wcb_afterElse(rawStr, tt) {
  wcb_idNumGuard.call(this, rawStr, tt);
}

function wcb_startStmtList(rawStr, tt) {}

function wcb_afterCase(rawStr, tt) {
  wcb_idNumGuard.call(this, rawStr, tt);
}

function wcb_afterVar(rawStr, tt) {
  wcb_idNumGuard.call(this, rawStr, tt);
}

function wcb_afterVDT(rawStr, tt) {
  wcb_idNumGuard.call(this, rawStr, tt);
}

// NOTE: only register it after a return that has a non-null argument
function wcb_afterRet(rawStr, tt) {
  if (NL(tt)) {
    this.os();

    // use `w because `wtcl_raw alone is not handling spaces enqueued
    var wl = this.wrapLimit;
    this.wrapLimit = 0;
    this.w('(');
    this.wrapLimit = wl;

    this.guardArg.hasParen = true;
    return; 
  }
  var lineLen = this.curLine.length;
  if (tt & (ETK_NUM|ETK_ID)) {
    if (this.ol(1+rawStr.length) > 0) {
      this.writeToCurrentLine_raw('(');
      this.guardArg.hasParen = true;
      this.l();
    }
    else this.hs();
    return;
  }
  if (this.ol(rawStr.length) > 0) {
    if (this.ol(rawStr.length) > 0) {
      this.writeToCurrentLine_raw('(');
      this.guardArg.hasParen = true;
      this.l();
    }
    return;
  }
  this.os();
}

function wcb_wrap(rawStr, tt) {
  if (tt & ETK_NL) return;
  this.insertLineBreak(true);
}

function guard_simpleListener(rawStr, tt) {}
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
[Actix.prototype, [function(){
this.ii =
function(inactiveIf) {
  ASSERT.call(this, this.inactiveIf === null, 'inactiveIf' );
  this.inactiveIf = inactiveIf;
  return this;

};

}]  ],
[AutoImex.prototype, [function(){
/* @<name>.js: 
 *   export default <name>
 *   export var cls = <name>
 *
 * <sub>@<name>.js
 *   import <name>, {cls} from @<name>.js#relativeTo(<sub>@<name>.js)
 *
 * <name>.js
 *   <for binding in the source>
 *     export {<binding>};
 */

var pathMan = new PathMan();

this.insertSourceByURI =
function(uri) {
  var m = _m(uri);
  ASSERT.call(this, !this.sources.has(m), 'existing ['+uri+']');
  var src = this.loadSource(uri), n = new this.Parser(src).parseProgram();

  var scope = n['#scope'];

  n['#uri'] = uri;

  scope['#importList'] = {ns: null, names: []};
  scope['#exportList'] = {bindings: [], defaultExpr: "", cls: ""};

  var subName = pathMan.tail(uri);
  var at = subName.indexOf('@');
  if (at === 0) {
    var name = subName.substring(1, subName.indexOf('.'));
    var binding = scope.findDeclAny_m(_m(name));
    ASSERT.call(this, binding, 'no ['+name+'] in ['+uri+']');
    scope['#exportList'].defaultExpr = name;
    this.logBinding(name, '*default*', uri);
    this.insertBundleBinding(uri, binding);
    ASSERT.call(this, scope.findDeclAny_m(_m('cls')) === null, 'cls exists in ' + uri );
    scope['#exportList'].cls = 'cls';
    var cul = this.clsUriList;
    var mname = _m(name);
    ASSERT.call(this, !HAS.call(cul, mname),
      'class has been registered: ['+name+']<==['+uri+']');
    cul[mname] = uri;
    this.logBinding(name, '<<cls>>', uri);
  }
  else if (at > 0) {
    scope['#clsThisList'] = [];
    var list = n.body, l = 0;
    this.logE('stmts', list.length);
    while (l < list.length) {
      var elem = list[l++];
      this.logE('[uri-'+uri+';'+elem.type+']');
      if (elem.type !== 'ExpressionStatement')
        continue;

      elem = elem.expression;
      this.logE('[uri-'+uri+';'+elem.type+']');
      if (elem.type !== 'AssignmentExpression')
        continue;

      elem = elem.left;
      this.logE('[uri-'+uri+';'+elem.type+']');
      if (elem.type !== 'MemberExpression')
        continue;

      elem = elem.object;
      this.logE('[uri-'+uri+';'+elem.type+']');
      if (elem.type !== 'ThisExpression')
        continue;

      scope['#clsThisList'].push(elem);
    }
  }
  else {
    var list = scope.defs, l = 0, len = list.length();
    while (l < len) {
      var elem = list.at(l++ );
      scope['#exportList'].bindings.push({real: elem.name, outer: elem.name});
      this.logBinding(elem.name, elem.name, uri );
      this.insertBundleBinding(uri, elem);
    }
  }
//this.handleSourceLevelBindings(uri, n['#scope']);

  n['#src'] = src;

  return this.sources.set(m, n);
};

this.resolveAll =
function() {
  var list = this.sources, l = 0, len = list.length();
  this.logE(' --------- ['+len+'] sources ----------; START');
  while (l < len) {
    var elem = list.at(l++ );
    this.tryResolveExternals(elem);
  }
  this.logE(' --------- ['+l+'/'+len+'] complete ---------');
};

this.tryResolveExternals =
function(n) {
  var sourceScope = n['#scope'], globalScope = sourceScope.parent;
  var list = globalScope.defs, l = 0, len = list.length();
  while (l < len) {
    var name = list.at(l++);
    var b = this.findBundleBinding(name.name);
    if (b) {
      sourceScope['#importList'].names.push({name: name.name, target: b});
      this.logE('  ['+n['#uri']+']:import ['+name.name+'] from ['+b.uri+'] '+
        (name.name === b.binding.ref.scope['#exportList'].defaultExpr ? 'default' : 'raw' ) );
    }
  }
};

this.insertBundleBinding =
function(uri, elem) {
  var name = elem.name;
  var b = this.findBundleBinding(name);
  if (b) ASSERT.call(this, false, 'name ['+name+'] exists @['+b.uri+']');

  return this.bundleBindings.set(_m(name), {uri: uri, binding: elem});
};

this.findBundleBinding =
function(name) {
  var mname = _m(name), bb = this.bundleBindings;
  return bb.has(mname) ? bb.get(mname) : null;
};

this.flush =
function() {
  var list = this.sources, l = 0, len = list.length();
  while (l < len) {
    var elem = list.at(l++);
    this.onStartImports(elem);
    this.writeImports(elem);
    this.onFinishImports(elem);

    this.onStartExports(elem);
    this.writeExports(elem);
    this.onFinishExports(elem);
  }
};

this.writeImports = 
function writeImports(n) {
  var scope = n['#scope'];
  var uri = n['#uri'];
  this.logE('writing imports for ['+uri+']');
  var im = scope['#importList'].names, usedSources = new SortedObj();
  var len = im.length, l = 0;
  while (l < len) {
    var elem = im[l++];
    var name = elem.name;
    var target = elem.target;
    var targetUri = target.uri, binding = target.binding;
    var mname = _m(targetUri);
//  console.error('  name['+name+']', mname, usedSources.obj);
    var entry = usedSources.has(mname) ? usedSources.get(mname) : null;
    if (entry === null)
      entry = usedSources.set(mname, {bindings: [], defaultName: "", wholeNS: "" });
    if (name === binding.ref.scope['#exportList'].defaultExpr) {
      ASSERT.call(this, entry.defaultName === "", '['+targetUri+'] default');
      entry.defaultName = name;
    }
    else { entry.bindings.push(name); }
  }

  len = usedSources.length(), l = 0;
  while (l < len) {
    var sourceBindings = usedSources.at(l);
    var sourceUri = _u(usedSources.keys[l]);
    var str = "";
    if (sourceBindings.defaultName !== "")
      str += sourceBindings.defaultName;
    if (sourceBindings.bindings.length) {
      if (str.length) str += ', ';
      str += '{';
      var bindings = sourceBindings.bindings, b = 0;
      while (b < bindings.length) {
        if (b) str += ', ';
        str += bindings[b];
        b++;
      }
      str += '}';
    }
    this.onImport({str: str, to: uri, from: sourceUri, usedSources: usedSources});
    l++;
  }
};

this.writeExports = function(elem) {
  var scope = elem['#scope'];
  var ex = scope['#exportList'];
  var str = "";
  if (ex.defaultExpr !== "")
    this.onExport(' export default '+ex.defaultExpr+';');
  var list = ex.bindings, l = 0;
  str = "";
  while (l < list.length) {
    if (l) str += ', ';
    else { str = '{'; }
    var elem = list[l++];
    ASSERT.call(this, elem.real && elem.real === elem.outer, '[real-'+elem.real+'; outer-'+elem.outer+']');
    str += elem.real;
  }
  if (l) {
    str += '}';
    this.onExport(' export '+str+';');
  }

  if (ex.cls !== "") {
    ASSERT.call(this, ex.defaultExpr !== "", 'cls but no default');
    this.onExport(' export var cls = '+ex.defaultExpr+'.prototype = ;');
  }
};

this.pathThatLeads2to1 =
function(from, to) {
  var fromNum = 0, toNum = 0;
  var fromStart = 0, toStart = 0;
  var fromElemLen = 0, toElemLen = 0;

  var manp = new PathMan();
  var str = "";

  var hasLeadingToElem = false;

  while (true) {
    fromElemLen = manp.len(from, fromStart);
    if (fromElemLen === 0) {
      ASSERT.call(this, fromNum > 0, '['+from+'] -- from has no elems');
      break;
    }

    toElemLen = manp.len(to, toStart);
    if (toElemLen === 0) {
      ASSERT.call(this, toNum > 0, '['+to+'] to has no elems');
      break;
    }

    var fromElem = manp.trimSlash(from.substr(fromStart, fromElemLen));
    fromNum++;
    fromStart += fromElemLen;

    var toElem = manp.trimSlash(to.substr(toStart, toElemLen));
    toNum++;
    toStart += toElemLen;

    if (fromElem !== toElem) {
      str = '..';
      hasLeadingToElem = true;
      break;
    }
  }

  while (true) {
    fromElemLen = manp.len(from, fromStart);
    if (fromElemLen === 0)
      break;
    if (str.length) str += '/';
    str += '..';
    fromStart += fromElemLen;
  }

  if (hasLeadingToElem) {
    ASSERT.call(this, str.length, 'str must not be empty if hasLeadingToElem is set to on' );
    str += '/' + toElem;
  }

  while (true) {
    toElemLen = manp.len(to, toStart);
    if (toElemLen === 0)
      break;
    var toElem = manp.trimSlash(to.substr(toStart, toElemLen));
    if (str.length) str += '/';
    else str = './';
    str += toElem;
    toStart += toElemLen;
  }

  console.error('['+from+']*['+str+']->['+to+']');
  return str;
};

this.logE =
function() {
  return console.log.apply(console, arguments);
};

this.logBinding = 
function(real, outer, uri) {
  this.logE('  ['+uri+']:export {['+real+'] as ['+outer+']}');
};

}]  ],
[BundleScope.prototype, [function(){
/* TODO: eliminate */ this.synth_decl_find_homonym_m =
function(mname) { return this.findSynth_m(mname); };

}]  ],
[Bundler.prototype, [function(){
// 
// a
// |__ b.js: import './l.js'
// |__ l.js: console.log('l.js in a')
//
// e
// |__ u.js -> a link to 'a/b.js'
// |__ l.js -> console.log('l.js in b')
//
// with above, consider:
// limport 'a/b.js'; limport 'e/u.js'
// 
// what is its output supposed to be?

this.enter = 
function(relPath) {
  var ll = { uri: this.curURI, dir: this.curDir };
  var man = this.pathMan;

  var at = 0, len = -1, n = this.curDir;
  while (at < relPath.length) {
    len = man.len(relPath, at);
    var elem = relPath.substr(at, len);
    n = man.joinRaw(n, man.trimAll(elem), true );
    at += len;
  }
  this.curURI = n;
  this.curDir = man.head(this.curURI);

  return ll;
};

this.setURIAndDir =
function(uri, dir) {
  this.curURI = uri;
  this.curDir = dir;
};

this.save =
function(n) {
  this.resolver.cache(this.curURI, n);
};

this.getExistingSourceNode =
function() {
  return this.resolver.loadCached(this.curURI);
};

this.loadNewSource =
function() {
  ASSERT.call(this, !this.resolver.hasInCache(this.curURI), 'incache');
  var n = this.resolver.loadNew(this.curURI);
  this.resolver.cache(this.curURI, n);

//n['#imports'] = n['#scope'].satisfyWithBundler(this);

  this.freshSources.push(n);
  return n;
};

}]  ],
[CatchScope.prototype, [function(){
this.synth_boot =
function(r) {
  ASSERT.call(this, !this.isBooted, 'boot' );
  if (this.renamer === null) this.renamer = r;
  this.synth_boot_init();
  if (this.argIsSignificant)
    this.synth_rcv();
  else
    this.catchVar = new Liquid('catchname').n('t');
  this.synth_defs_to(this.synthBase);
};

this.synth_boot_init =
function() {
  ASSERT.call(this, !this.isBooted, 'boot' );
  if (this.synthNamesUntilNow === null)
    this.synthNamesUntilNow = new SortedObj();
  this.isBooted = true;
};

this.synth_start =
function(r) {
  this.isBooted || this.synth_boot(r);

  FunScope.prototype.synth_externals.call(this);
};

this.synth_ref_may_escape_m =
function(mname) { return true; };

this.insertSynth_m = 
function(mname, synth) {
  return ConcreteScope.prototype.insertSynth_m.call(this, mname, synth);
};

this.rename =
function(base, n) { return ConcreteScope.prototype.rename.call(this, base, n); };

this.synth_ref_find_homonym_m =
function(mname, r) {
  this.isBooted || this.synth_boot(r);
  return this.findSynth_m(mname);
};

this.findSynth_m =
function(mname) {
  return ConcreteScope.prototype.findSynth_m.call(this, mname);
};

this.synth_rcv =
function() {
  var c = this.defs.at(0), list = c.ref.rsList, num = 0;
  ASSERT.call(this, c.isCatchArg(), 'catch' );
  var baseName = c.name, synthName = this.rename(baseName, num);

  this.catchVar = c;

  RENAME:
  do {
    var mname = _m(synthName);
    var synth = null;
    var l = 0;
    while (l < list.length) {
      var scope = list[l++];
      if (!scope.synth_ref_may_escape_m(mname, this.renamer))
        continue RENAME;
      synth = scope.synth_ref_find_homonym_m(mname, this.renamer);
      if (synth && synth !== c)
        continue RENAME;
    }
    break;
  } while (synthName = this.rename(baseName, ++num), true );

  c.synthName = synthName;
  this.insertSynth_m(mname, c);
};

this.synth_lcv =
function() {
  var liq = this.catchVar;
  var baseName = liq.name;
  var num = 0;

  var mname = 0, synthName = this.rename(baseName, num);
  do {
    mname = _m(synthName);
    if (this.findSynth_m(mname) === null)
      break;
    synthName = this.rename(baseName, ++num);
  } while (true);

  liq.synthName = synthName;
  this.insertSynth_m(mname, liq);
};

}]  ],
[ClassScope.prototype, [function(){
this.hasHeritage =
function() { return this.flags & SF_HERITAGE; };

}]  ],
[Comments.prototype, [function(){
this. push =
function(comment) {
  this.c.push(comment);
  if (!this.n) {
    this.firstLen += comment['#firstLen'];
    this.n = comment.type === 'Line' ||
      (comment.loc.start.line !== comment.loc.end.line);
  }
};

this.mergeWith =
function(another) {
  if (!this.n)
    this.n = another.n;
  this.c = this.c.concat(another.c);
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
function(r) {
  if (this.renamer === null) this.renamer = r;
  ASSERT.call(this, this.isSourceLevel(), 'script m');

  // TODO: source-level-scope.synthNamesUntilNow will be a 0-length SortedObj (because it has a synthBase other than itself),
  // yet because it gets recorded in rsList-s, it might be receiving queries like `locateSynth` (findSynth), etc., and this in turn requires
  // the value for its synthNamesUntilNow be non-null; this behaviour is somewhat hacky though, and it has got to be eliminated as soon as possible
  this.synth_boot_init(); 

  this.synth_defs_to(this.synthBase);
};

this.synth_finish =
function() {
  this.synth_liquids_to(this.synthBase);
};

this.synth_start =
function(r) {
  ASSERT.call(this, this.isSourceLevel(), 'script m');
  this.isBooted || this.synth_boot(r);
};

this.synth_liquids_to =
function(targetScope) {
  if (this.spThis !== null && this.spThis.ref.i)
    targetScope.synthLiquid(this.spThis);
  if (this.isAnyFn() && this.spArguments !== null) {
    if (this.spArguments.ref.i)
      targetScope.synthLiquid(this.spArguments);
    else {
      this.spArguments.synthName = this.spArguments.name;
      targetScope.insertSynth_m(_m(this.spArguments.name), this.spArguments);
    }
  }

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
function(mname, r) {
  ASSERT.call(this, this.isSourceLevel(), 'script m');
  this.isBooted || this.synth_boot(r);
  return this.findSynth_m(mname);
};

this.synth_decl_find_homonym_m =
function(mname) {
  ASSERT.call(this, this.isSourceLevel(), 'script m');
  this.isBooted || this.synth_boot(r);
  return this.findSynth_m(mname);
};

this.insertSynth_m =
function(mname, synth) {
  var sn = this.synthNamesUntilNow || 
    (this.synthNamesUntilNow = new SortedObj()); // for msynth which uses it before the scope is booted

  ASSERT.call(this, !sn.has(mname), '"'+mname+'" exists');
  return sn.set(mname, synth);
};

this.synth_globals =
function(r) {
  this.synth_boot_init();
  ASSERT.call(this, this.isGlobal() || this.isBundle(), 'global/bundler' );
  ASSERT.call(this, this.renamer === null, 'renamer' );

  this.renamer = r;

  var list = this.defs, len = list.length(), l = 0;
  while (l < len)
    this.synthGlobal(list.at(l++));
};

this.synthDecl =
function(decl) {
  ASSERT.call(this,
    decl.isFnArg() ||
    decl.isLet() ||
    decl.isConst() ||
    decl.isVar() ||
    decl.isCls() ||
    decl.isFn() ||
    (decl.isCatchArg() && decl.ref.scope.argIsSimple === false),
    'fun/let/const/var/fnarg'
  );

  ASSERT.call(this, decl.synthName === "", 'has synth');

  var rsList = decl.ref.rsList;
  var num = 0;
  var baseName = decl.name;
  var mname = "";
  var synthName = this.rename(baseName, num);

  RENAME:
  do {
    mname = _m(synthName); 
    var l = 0;
    var synth = null;

    while (l < rsList.length) {
      var scope = rsList[l++];
      if (!scope.synth_ref_may_escape_m(mname))
        continue RENAME;

      synth = scope.synth_ref_find_homonym_m(mname, this.renamer);
      if (synth) {
        if (synth.isName() && synth.getAS() !== ATS_DISTINCT)
          synth = synth.source;
        if (synth !== decl)
          continue RENAME;
      }
    }

    if (num === 0 && !this.synth_name_is_valid_binding_m(mname)) // shortcut: num === 0 (because currently no invalid name contains a number)
      continue RENAME;

    synth = this.synth_decl_find_homonym_m(mname, this.renamer);
    if (synth) {
      if (synth.isName() && synth.getAS() !== ATS_DISTINCT)
        synth = synth.source;
      if (synth !== decl)
        continue RENAME;
    }

    break;
  } while (synthName = this.rename(baseName, ++num), true);

  decl.synthName = synthName;
  this.insertSynth_m(mname, decl);
};

this.synthGlobal =
function(global) {
  ASSERT.call(this, this.isGlobal() || this.isBundle(), 'script m');
  ASSERT.call(this, global.isGlobal(), 'not g');
  if (!global.mustSynth()) {
    ASSERT.call(this, global.synthName === "", 'synth name');
    global.synthName = global.name;
    return;
  }
  var rsList = global.ref.rsList;
  var num = 0;
  var name = global.name;
  var synthNames = [name, ""]; // no rename(base, 0) -- this is a global

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
        var synth = scope.synth_ref_find_homonym_m(mname, this.renamer);
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
    synthNames[0] = this.rename(name, num),
    synthNames[1] = synthNames[0] + "u",
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
  var synthName = this.rename(baseName, num);

  RENAME:
  do {
    mname = _m(synthName);
    var l = 0;

    while (l < rsList.length) {
      var scope = rsList[l++ ];
      if (!scope.synth_ref_may_escape_m(mname))
        continue RENAME;

      if (scope.synth_ref_find_homonym_m(mname, this.renamer))
        continue RENAME;
    }

    if (!this.synth_name_is_valid_binding_m(mname))
      continue RENAME;

    if (this.synth_decl_find_homonym_m(mname, this.renamer))
      continue RENAME;

     break;
  } while (synthName = this.rename(baseName, ++num), true);

  liquid.synthName = synthName;
  this.insertSynth_m(mname, liquid );
};

this.rename =
function(base, i) { return this.renamer(base, i); };

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
      if (this.name === sn.name && this !== sn) {
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
  ASSERT_EQ.call(this, r.targetDecl_nearest, null);
  ASSERT_EQ.call(this, r.hasTarget, false);
  this.ref = r;
  r.targetDecl_nearest = this;
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

this.refreshRSListWithList =
function(list) {
  var l = 0;
  while (l < list.length)
    this.refreshRSListWith(list[l++]);
};

this.refreshRSListWith =
function(scope) {
  if (this.rsMap === null)
    this.rsMap = {};
  var id = scope.scopeID;
  if (HAS.call(this.rsMap, id)) {
    ASSERT.call(this, this.rsMap[id] === scope, 'scope' );
    return false;
  }
  this.rsMap[id] = scope ;
  this.ref.rsList.push(scope);
  return true;
};

this.getDecl_real =
function() {
  if (this.realTarget !== null)
    return this.realTarget;

  var t = this;
  while (t.ref.parentRef !== null)
    t = t.ref.parentRef.getDecl_nearest();

  this.realTarget = t;
  return t;
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

  return this.isCls() || this.isClassName() || this.isLexicalLike();
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
    return !this.ref.scope.isLexicalLike();
  return this.type & _VARLIKE;
};

var _OVERRIDABLE = DT_CATCHARG|_VARLIKE;
this.isOverridableByVar =
function() { return this.isVarLike() || (this.type & _OVERRIDABLE); };

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

this.isFnName =
function() { return this.type & DT_FNNAME; };

this.isClassName =
function() { return this.type & DT_CLSNAME; };

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
this.emc =
function(cb, i) {
  if (HAS.call(cb, i)) {
    var e = cb[i];
    cb[i] = null;
    return this.emcim(e);
  }
  return false;
};

this.emce = // emc erase
function(cb, i) {
  if (this.emc(cb, i)) {
    cb[i] = null;
    return true;
  }
  return false;
};

this.emcim =
function(comments) { // emc -- immediate
  if (comments === null)
    return false;

  var list = comments.c, nl = comments.n, e = 0, l = null;
  while (e < list.length) {
    var elem = list[e];
    var resume = elem.type === 'Line' ?
      this.allow.comments.l : this.allow.comments.m;

    if (resume) {
      if (l) {
        if (l.type === 'Line' || l.loc.end.line < elem.loc.start.line)
          this.l();
      }
      l = elem;

      var wflag = ETK_DIV|ETK_COMMENT;
      if (e === 0 && nl)
        wflag |= ETK_NL;

      if (elem.type === 'Line') {
        this.wt('//', wflag).writeToCurrentLine_raw(elem.value);
      }
      else {
        this.wt('/*', wflag);
        this.writeToCurrentLine_raw(elem.value);
        this.writeToCurrentLine_raw('*/');
      }
    }

    e++;
  }

  if (l && l.type === 'Line') {
    this.nextLineHasLineBreakBefore = true;
    this.gu(wcb_afterLineComment);
  }

  return true;
};

},
function(){
this.emitAny =
function(n, flags, isStmt) {
  var emitters = this.emitters, t = n.type;
  if (t in emitters)
    return emitters[t].call(this, n, flags, isStmt );

  this.err('unknown.node');
};

this.emitHead =
function(n, flags, isStmt) { return this.emitAny(n, flags|EC_EXPR_HEAD|EC_NON_SEQ, isStmt); };

this.emitNonSeq =
function(n, flags, isStmt) { return this.emitAny(n, flags|EC_NON_SEQ, isStmt); };

this.emitNewHead =
function(n, flags, isStmt) {
  return this.emitHead(n, EC_NEW_HEAD, false);
};

this.emitCallHead =
function(n, flags, isStmt) {
  return this.emitHead(n, flags|EC_CALL_HEAD, false);
};

},
function(){
this.w =
function(str) {
  this.writeToCurrentLine_checked(str);
  return this;
};

this.i =
function() { this.indentNextLine(); return this; };

this.l =
function() { this.flushCurrentLine(); return this; };

this.jz =
function(str) {
  return this.w('jz').w('.').w(str);
};

this.wm =
function() {
  var len = arguments.length, l = 0;
  while (l < len) {
    var str = arguments[l++];
    switch (str) {
    case ' ':
      this.enqueueBreakingSpace();
      break;
    case '':
      this.enqueueOmittableSpace();
      break;
    default:
      this.writeToCurrentLine_checked(str);

    }
  }
  return this;
};

this.wt =
function(str, t) { this.tt(t); return this.w(str); };

this.os =
function() { this.enqueueOmittableSpace(); return this; };

this.bs =
function() { this.enqueueBreakingSpace(); return this; };

this.u =
function() { this.unindentNextLine(); return this; };

this.hs = 
function() { this.writeToCurrentLine_space(); return this; };

this.gu =
function(guard) { this.insertGuard(guard); return this; };

this.gar =
function(arg) { this.setGuardArg(arg); return this; };

this.gmon =
function(listener) { this.monitorGuard(listener); return this; };

this.grmif =
function(listener) { this.removeGuard_if(listener); return this; };

this.trygu =
function(guard, listener) {
  if (this.insertGuard_try(guard)) {
    this.monitorGuard(listener);
    return true;
  }
  return false;
};

this.sl =
function(srcLoc) {
  this.setSourceLocTo(srcLoc);
  return this;
};

this.eA =
function(n, flags, isStmt) {
  this.emitAny(n, flags, isStmt);
  return this;
};

this.eH =
function(n, flags, isStmt) {
  this.emitHead(n, flags, isStmt);
  return this;
};

this.eN =
function(n, flags, isStmt) {
  this.emitNonSeq(n, flags, isStmt);
  return this;
};

},
function(){
this.insertGuard =
function(guard) {
  ASSERT.call(this, this.guard === null, 'existing guard');
  ASSERT.call(this, this.guardArg === null, 'existing guardArg');
  ASSERT.call(this, this.guardListener === null, 'existing guardListener');

  ASSERT.call(this, !this.runningGuard, 'running');

  this.guard = guard;
};

this.monitorGuard =
function(listener) {
  ASSERT.call(this, this.guard !== null, 'no');
  ASSERT.call(this, this.guardListener === null, 'listener');

  this.guardListener = listener;
};

this.runGuard =
function(str, t) {
  var guard = this.guard, guardListener = this.guardListener;
  this.removeGuard_any();

  this.runningGuard = true;
  guard.call(this, str, t);
  if (guardListener) {
    ASSERT_EQ.call(this, guardListener.used, false);
    guardListener.used = true;
  }
  this.guardArg = null;
  this.runningGuard = false;
};

this.listenForEmits =
function(fallbackListener) {
  var l = null;
  if (this.guard === null) {
    l = fallbackListener;
    this.insertGuard(guard_simpleListener);
    this.monitorGuard(l);
  } else {
    l = this.guardListener;
    if (l === null) {
      l = this.defaultGuardListener;
      l.used = false;
      this.monitorGuard(l);
    }
  }
  return l;
};

this.removeGuard_any =
function() {
  ASSERT.call(this, this.guard !== null, 'no');
  this.guard = this.guardListener = null;
};

this.removeGuard_if =
function(listener) {
  // TODO: uncomment below
  // ASSERT.call(this, this.guard !== null, 'no');
  if (this.guard === null)
    return false;
  var guardListener = this.guardListener;

  // TODO: uncomment below
  // ASSERT.call(this, guardListener !== null, 'listener');
  if (guardListener === null)
    return false;

  if (listener !== guardListener)
    return false;

  ASSERT_EQ.call(this, listener.used, false);
  this.removeGuard_any();

  return true;
};

this.setGuardArg =
function(arg) {
  ASSERT.call(this, arg === null || this.guard !== null, 'no');
  ASSERT.call(this, (arg === null ? this.guard : this.guardArg) === null, 'n');

  this.guardArg = arg;
};

this.insertGuard_try =
function(guard) {
  if (this.guard !== null)
    return false;
  this.insertGuard(guard);
  return true;
};

},
function(){
this.findIndentStringWithIdealLength =
function(idealLength) {
  var INLEN = this.indentString.length;
//ASSERT.call(this, idealLength % INLEN === 0, 'len'); // TODO: eliminate
  var remaining = idealLength % INLEN;
  idealLength -= remaining;
  var level = idealLength / INLEN;

  var cache = this.indentCache, l = cache.length;
  var str = "";
  if (level < l)
    str = cache[level];

  else {
    str = cache[l-1];
    ASSERT.call(this, l > 0, 'l');
    while (l <= level) {
      cache[l] = str = str + this.indentString;
      l++;
    }
  }

  if (remaining)
    str += this.indentString.substring(0, remaining);

  return str;
};

this.indentNextLine =
function() { this.nextLineIndent++; };

this.unindentNextLine =
function() {
  ASSERT.call(this, this.nextLineIndent > 0, 'line has a <1 indent');
  this.nextLineIndent--;
};

},
function(){
this.flushCurrentLine =
function() {
  if (this.curLine.length) {
    this.finishCurrentLine(); 
    return true;
  }
  return false;
};

this.lineBlank =
function() { return this.curLine.length === 0; };

this.finishCurrentLine =
function() {
  var line = this.curLine;
  ASSERT.call(this, !this.finishingLine, 'finishing');
  ASSERT.call(this, line.length, 'line');

  this.ensureNoSpace();

  this.finishingLine = true;
  var optimalIndentLevel = this.allow.space ? this.curLineIndent : 0;
  var tailLineBreak = false, optimalIndentString = "", optimalIndentStrLength = 0;
  optimalIndentStrLength = optimalIndentLevel * this.indentString.length;

  if (optimalIndentStrLength >= 0) {
    var overflow = this.ol(optimalIndentStrLength);
    if (overflow > 0) {
      optimalIndentStrLength -= overflow;
      if (optimalIndentStrLength < 0)
        optimalIndentStrLength = 0;
    }
  }

  optimalIndentString = this.findIndentStringWithIdealLength(optimalIndentStrLength);

  if (this.nextLineHasLineBreakBefore)
    this.writeToCurrentLine_virtualLineBreak();

  this.useOut(true);

  if (this.curLineHasLineBreakBefore)
    this.writeToOut_lineBreak();

  this.writeToOut_raw(optimalIndentString);
  this.writeToOut_raw(this.curLine);

  this.adjustColumns(optimalIndentStrLength);
  this.refreshSMOutWithLM();

  this.useOut(false);

  this.startFreshLine();

  this.finishingLine = false;
};

this.adjustColumns =
function(lindLen) { // line indentation length
  if (this.hasRecorded_SMLinkpoint)
    this.ln_emcol_cur += lindLen;
  if (this.hasRecorded_emcol_latestRec)
    this.emcol_latestRec += lindLen;
  if (this.curLineHasLineBreakBefore)
    this.ln_emcol_latestRec = 0; // i.e., absolute
  else
    this.emcol_cur += lindLen;
};

this.startFreshLine =
function() {
  this.curLineHasLineBreakBefore = this.nextLineHasLineBreakBefore;
  this.curLineIndent = this.nextLineIndent;
  this.curLine = "";

  if (this.curLineHasLineBreakBefore) {
    this.emcol_cur = 0;
    this.smLineStart = true;
  }

  this.hasRecorded_SMLinkpoint = false;
  this.hasRecorded_emcol_latestRec = false;

  this.ln_emcol_latestRec = this.emcol_latestRec;
  this.lm = "";

  this.ln_vlq_tail = "";
  this.nextLineHasLineBreakBefore = this.allow.nl;
};

this.refreshSMOutWithLM =
function() {
  var lm0 = "", lm = this.lm;
  if (this.hasRecorded_SMLinkpoint) {
    var lm0 = vlq(this.ln_emcol_cur - this.ln_emcol_latestRec) + this.ln_vlq_tail;
    if (lm.length) lm0 += ',';
  }
  if (!this.curLineHasLineBreakBefore) {
    if (lm.length || lm0.length) {
      if (this.smLineStart)
        this.smLineStart = false;
      else
        this.writeToSMout(',');
    }
  }
  lm0.length && this.writeToSMout(lm0);
  lm.length && this.writeToSMout(lm);
};

},
function(){
this.writeToOut_nonLineBreak =
function(str) {
  this.ensureOutActive();
  this.writeToOut_raw(str);
};

this.writeToOut_lineBreak =
function() {
  this.ensureOutActive();
  this.emline_cur++;
//this.emcol_cur = 0;
  this.writeToSMout(';'); // TODO: ensure we are allowed to actually write to SM; we must have actually committed anything in lm beforehands
  this.writeToOut_raw('\n');
}; 

this.writeToOut_raw =
function(str) { this.out = this.out.concat(str); this.outLen += str.length; };

this.useOut =
function(use) {
  ASSERT_EQ.call(this, !this.outActive, use);
  this.outActive = use;
};

this.ensureOutActive =
function() { ASSERT.call(this, this.outActive, 'out is not in use' ); };

},
function(){
this.smSetName_str =
function(name) {
  var nc = -1;
  if (name.length) {
    var mname = _m(name), list = this.smNameList;
    nc = list.has(mname) ? list.get(mname) : list.set(mname, list.length());
  }
  return this.smSetName_i(nc);
};

this.smSetName_i =
function(i) {
  var list = this.smNameList;
  ASSERT.call(this, i >= 0 ? i <= list.length() : i === -1, 'namei' );
  var nc = this.namei_cur;

  this.namei_cur = i;
  return nc;
};

this.smSetSrc_str =
function(srcName) {
  var sc = -1;
  if (srcName.length) {
    var mname = _m(srcName), list = this.smSrcList;
    sc = list.has(mname) ? list.get(mname) : list.set(mname, list.length());
  }
  return this.smSetSrc_i(sc);
};

this.smSetSrc_i =
function(i) {
  var list = this.smSrcList;
  ASSERT.call(this, i >= 0 ? i <= list.length() : i === -1, 'srci' );
  var sc = this.srci_cur;

  this.srci_cur = i;
  return sc;
};

this.writeToSMout =
function(lm) { this.sm = this.sm.concat(lm); this.smLen += lm.length; };

this.refreshTheCurrentLineLevelSourceMapWith =
function(srcLoc) {
  var l = 0, vlqTail = "";

  l = this.srci_cur;
  vlqTail += vlq(l - this.srci_latestRec);
  this.srci_latestRec = l;

  var ll = this.loc_latestRec; // latest loc
  vlqTail += vlq(srcLoc.line - ll.line) + vlq(srcLoc.column - ll.column);
  this.loc_latestRec = srcLoc;

  if ((l=this.namei_cur) >= 0) {
    vlqTail += vlq(l - this.namei_latestRec);
    this.namei_latestRec = l;
  }

  l = this.emcol_cur;
  if (this.hasRecorded_SMLinkpoint) {
    var lm = this.lm;
    if (lm.length) lm += ',';
    this.lm = lm + vlq(l - this.emcol_latestRec) + vlqTail;
  }
  else {
    this.ln_emcol_cur = l;
    this.ln_vlq_tail = vlqTail;
    this.hasRecorded_SMLinkpoint = true;
  }
  this.emcol_latestRec = l;
  if (!this.hasRecorded_emcol_latestRec)
    this.hasRecorded_emcol_latestRec = true;
  this.emline_latestRec = this.emline_cur;
};

this.setSourceLocTo =
function(srcLoc) {
  ASSERT.call(this, srcLoc, 'lw');
  this.pendingSrcLoc = srcLoc;
};

},
function(){
this.ensureNoSpace =
function() { ASSERT.call(this, !this.hasPendingSpace(), 'hasPendingSpace' ); };

this.hasPendingSpace =
function() { return this.pendingSpace !== SP_NONE; };

this.enqueueOmittableSpace =
function() {
  this.ensureNoSpace(); ASSERT.call(this, this.notJustAfterLineBreak(), 'leading');
  this.pendingSpace = SP_OMITTABLE;
};

this.enqueueBreakingSpace =
function() {
  this.ensureNoSpace(); ASSERT.call(this, this.notJustAfterLineBreak(), 'leading');
  this.pendingSpace = SP_BREAKABLE;
};

this.removePendingSpace =
function() {
  var sp = this.pendingSpace;
  this.pendingSpace = SP_NONE;
  return sp;
};

this.effectPendingSpace =
function(len) {
  ASSERT.call(this, this.notJustAfterLineBreak(), 'leading');
  var pendingSpace = this.removePendingSpace();
  switch (pendingSpace) {
  case SP_OMITTABLE:
    if (this.allow.space && this.ol(len+1) <= 0)
      this.writeToCurrentLine_space();
    break;
  case SP_BREAKABLE:
    if (this.ol(len+1) <= 0)
      this.writeToCurrentLine_space();
    else
      this.wrapCurrentLine();
    break;
  default:
    ASSERT.call(this, false, 'invalid type for pending space' );
    break;
  }
};

this.removePendingSpace_try =
function() {
  return this.hasPendingSpace() ? 
    this.removePendingSpace() : SP_NONE;
};

this.notJustAfterLineBreak =
function() {
  return this.curLine.length || !this.curLineHasLineBreakBefore;
};

},
function(){
this.tt =
function(tt) {
  ASSERT.call(this, this.ttype === ETK_NONE, 'none');
  this.ttype = tt;
};

this.nott =
function() {
  ASSERT.call(this, this.ttype !== ETK_NONE, 'none');
  this.ttype = ETK_NONE;
};

this.nott_ifAny =
function() {
  if (this.ttype === ETK_NONE)
    return false;
  this.nott();
  return true;
};

},
function(){
this.writeStringValue =
function(sv, ql) {
  var ch = -1, len = sv.length, c = 0, v = "";
  while (c < len) {
    ch = sv.charCodeAt(c);
    v = this.isNormalCh(ch) ?
      sv.charAt(c) :
      this.stringEscapeFor(ch);

    var vLen = v.length;
    if (vLen === c+ql)
      vLen += ql;

    if (this.ol(vLen) > 0) {
      this.writeToCurrentLine_raw('\\');
      this.nextLineHasLineBreakBefore = true;
      this.finishCurrentLine();
      this.curLineIndent = 0;
    }

    this.writeToCurrentLine_raw(v);
    c++;
  }
};

this.isNormalCh =
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

this.writeString =
function(sv, quotation) {
  this.tt(ETK_STR);
  this.writeToCurrentLine_checked(quotation); // must take care of wrapping for the quotation
  this.writeStringValue(sv, quotation.length);

  // raw because the wrapping has been taken care of when in the writeStringValue routine
  this.writeToCurrentLine_raw(quotation); 
};

this.emitCommaList =
function(list, flags) {
  var e = 0;
  while (e < list.length) {
    if (e) this.wm(',','');
    this.eN(list[e], flags, false);
    if (e === 0) flags &= EC_IN;
    e++;
  }
};

this.emitStmtList =
function(list) {
  var own = {used: false};

  var lsn = this.listenForEmits(own), l = 0;
  while (l < list.length) {
    this.emitStmt(list[l++]);
    if (lsn.used) {
      own.used = false;
      this.trygu(wcb_afterStmt, own);
      lsn = this.listenForEmits(own);
    }
  }

  own.used || this.grmif(own);
};

this.emitStmt =
function(stmt) { return this.emitAny(stmt, EC_START_STMT, true); };

this.emitTZCheckPoint =
function(l) {
  ASSERT_EQ.call(this, l.hasTZCheck, true);
  var tz = l.ref.scope.scs.getLG('tz').getL(0);
  this.wm(tz.synthName,'','=','',l.idx+"",';');
};

this.wsndl =
function(list) {
  var e = 0;
  while (e < list.length) {
    e && this.wm(',','');
    this.writeIDName(list[e].synthName);
    ++e ;
  }
  return true;
};

this.emitAttached =
function(stmt) {
  switch (stmt.type) {
  case 'BlockStatement':
    this.os();
  case 'EmptyStatement':
    return this.emitStmt(stmt);
  }

  // TODO: eliminate
  if (stmt.type === 'ExpressionStatement') {
    var ex = stmt.expression;
    if (isAssigList(ex))
      return this.os().emitAny(ex, EC_START_STMT|EC_ATTACHED, true);
  }
  else if (isAssigList(stmt))
    return this.os().emitAny(stmt, EC_START_STMT|EC_ATTACHED, true);

  this.i();
  this.l(); // TODO: unnecessary when the body has nothing in it (like as in #Skip nodes)

  var own = {used: false};
  var lsn = this.listenForEmits(own);
  this.emitStmt(stmt);
  this.u();
  if (!lsn.used) { this.grmif(own); this.w(';'); }
};

// a, b, e, ...l -> [a,b,e],sp(l)
// a, b, e, l -> a,b,e,l
this.emitElems =
function(list, selem /* i.e., it contains a spread element */, cb) {
  var e = 0, em = 0;
  while (e < list.length) {
    em && this.w(',').os();
    var elem = list[e];
    if (elem && elem.type === 'SpreadElement') {
      this.emitSpread(elem);
      e >= list.length - 1 && this.emc(cb, 'inner');
      e++;
    }
    else {
      var br = selem || em;
      br && this.w('[');
      e = this.emitElems_toRest(list, e, cb);
      e >= list.length && this.emc(cb, 'inner');
      br && this.w(']');
    }
    ++em;
  }
};

this.emitSpread =
function(n) {
  var cb = CB(n); this.emc(cb, 'bef' );
  this.jz('sp').sl(n.loc.start);
  this.w('(').eN(n.argument, EC_NONE, false).w(')').emc(cb, 'aft');
};

this.emitElems_toRest =
function(list, s, cb) {
  var e = s;
  while (e < list.length) {
    var elem = list[e];
    if (elem && elem.type === 'SpreadElement')
        break;
    e > s && this.w(',').os();
    if (elem)
      this.eN(elem, EC_NONE, false);
    else {
      if (cb.h < cb.holes.length) {
        var holeComments = cb.holes[cb.h];
        if (holeComments[0] === e)
          this.emcim(holeComments[1]);
        cb.h++;
      }
          
      this.w('void').bs().w('0');
    }
    ++e; 
  }
  return e;
};

this.writeMemName =
function(memName, asStr) {
  switch (memName.type) {
  case 'Literal':
    this.eA(memName, EC_NONE, false);
    return this;
  case 'Identifier':
  case '#-ResolvedName.ex':
    var cb = CB(memName); this.emc(cb, 'bef' );
    asStr ?
      this.writeString(memName.name,"'") :
      this.writeIDName(memName.name);
    this.emc(cb, 'aft');
    return this;
  }
  ASSERT.call(this, false, 'unknown name');
};

this.writeIDName =
function(nameStr) { return this.writeToCurrentLine_checked(nameStr); };

this.emitSAT =
function(n, flags, olen) {
  if (n.type === 'MemberExpression')
    return this.emitSAT_mem(n, flags, olen);
  if (isResolvedName(n))
    return this.emitRName_SAT(n, flags);

  ASSERT.call(this, false, 'got <'+n.type+'>');
};

this.emitAccessChk_tz =
function(nd, loc) {
  ASSERT.call(this, nd.hasTZCheck, 'unnecessary tz');
  var scope = nd.ref.scope;
  ASSERT.call(this, scope.hasTZCheckPoint, 'could not find any tz');
  var tz = scope.scs.getLG('tz').getL(0);
  this.wt(tz.synthName,ETK_ID).wm('<',nd.idx+"",'&&').jz('tz');
  loc && this.sl(loc);
  this.w('(').writeString(nd.name, "'");
  this.w(')');
  return true;
};

this.emitAccessChk_invalidSAT =
function(nd, loc) {
  this.jz('cc');
  loc && this.sl(loc);
  this.w('(').writeString(nd.name,"'");
  this.w(')');
  return true;
};

},
function(){
this.wrapCurrentLine =
function() {
  this.hasPendingSpace() && this.removePendingSpace();
  this.nextLineHasLineBreakBefore = true;

  if (this.lineBlank()) {
    if (this.guard) {
      ASSERT.call(this, !this.curLineHasLineBreakBefore, 'leading guard');
      this.runGuard('\n', ETK_NL);
    }
    this.startFreshLine();
  }
  else this.finishCurrentLine();
};

this.overflowLength =
this.ol =
function(len) {
  var wl = this.wrapLimit;
  return wl <= 0 ? 0 : this.emcol_cur + len - wl;
};

},
function(){
this.writeToCurrentLine_checked =
function(rawStr) {
  ASSERT.call(this, arguments.length === 1, 'write must have only one single argument');

  ASSERT.call(this, typeof rawStr === STRING_TYPE, 'str' );
  ASSERT.call(this, rawStr.length, 'writing ""' );

  var srcLoc = this.pendingSrcLoc;
  if (srcLoc) { this.pendingSrcLoc = null; }

  if (this.hasPendingSpace())
    this.effectPendingSpace(rawStr.length);

  var curEmCol = this.emcol_cur;
  if (curEmCol && this.ol(rawStr.length) > 0)
    this.wrapCurrentLine();

  if (this.guard) {
    var tt = this.ttype;
    tt === ETK_NONE || this.nott();
    this.runGuard(rawStr, tt);
    if (this.hasPendingSpace())
      this.effectPendingSpace(rawStr.length);
  }
  else 
    this.ttype === ETK_NONE || this.nott();

  ASSERT.call(this, this.guard === null, 'guard' );
  this.ensureNoSpace();

  srcLoc && this.refreshTheCurrentLineLevelSourceMapWith(srcLoc);

  this.writeToCurrentLine_raw(rawStr);
};

this.writeToCurrentLine_raw =
function(rawStr) {
  this.emcol_cur += rawStr.length;
  this.curLine += rawStr;
};

this.writeToCurrentLine_space =
function() {
  this.ensureNoSpace();
  if (this.guard) this.runGuard(' ', ETK_NONE);

  ASSERT.call(this, this.guard === null, 'no');
  this.ensureNoSpace();

  this.writeToCurrentLine_raw(' ');
};

this.writeToCurrentLine_virtualLineBreak =
function() {
  this.ensureNoSpace();
  this.guard && this.runGuard('\n', ETK_NL);
};

},
function(){
this.emitSourceHead =
function(n) {
  var scope = n['#scope'], em = 0;
  this.emitJ(scope, em) && em++;
  this.emitTCheckVar(scope, em) && em++;
  this.emitThisRef(scope, em) && em++;
  this.emitFunLists(scope, true, em) && em++;
  this.emitVarList(scope, em) && em++;
  this.emitTempList(scope, em) && em++;
  return em;
};

this.emitFnHead =
function(n) {
  var scope = n.fun['#scope'], em = 0;
  this.emitTCheckVar(scope, em) && em++;
  this.emitTempList(scope, em) && em++;
  this.emitThisRef(scope,em) && em++;
  this.emitThisChk(scope,em) && em++;
  this.emitArgumentsRef(scope,em) && em++;
  if (n.argsPrologue) this.emitTransformedArgs(n, em) && em++;
  this.emitFunLists(scope, true, em) && em++;
  this.emitVarList(scope, em) && em++;
  return em;
};

this.emitSimpleHead =
function(n) {
  var scope = n['#scope'], em = 0;
  scope.hasTZCheckPoint && this.emitTCHP(scope, em) && em++;
  this.emitLLINOSAList(scope, em) && em++;
  this.emitFunLists(scope, false, em) && em++;
  return em;
};

this.emitVarList =
function(scope, hasPrev) {
  ASSERT.call(this, scope.isSourceLevel() || scope.isAnyFn(), 'source/fn');
  var list = scope.defs, i = 0, len = list.length(), em = 0;
  var own = {used: false};
  hasPrev && this.trygu(wcb_afterStmt, own);
  while (i < len) {
    var elem = list.at(i++);
    if (!elem.isVar()) continue;
    if (elem.isFn() || elem.isFnArg()) continue;
    em ? this.w(',').os() : this.w('var').bs();
    this.w(elem.synthName);
    em++;
  }
  em && this.w(';');
  own.used || this.grmif(own);
  return em;
};

this.emitTempList =
function(scope, hasPrev) {
  ASSERT.call(this, scope.isSourceLevel() || scope.isAnyFn(), 'source/fn');
  var list = scope.getLG('<t>'), i = 0, len = list ? list.length : 0;
  var own = {used: false};
  hasPrev && this.trygu(wcb_afterStmt, own);
  while (i < len) {
    var elem = list.getL(i);
    i ? this.w(',').os() : this.w('var').bs();
    this.w(elem.synthName);
    i++;
  }

  i && this.w(';');
  own.used || this.grmif(own);
  return i;
};

this.emitFunLists =
function(scope, allowsDecl, hasPrev) {
  var list = scope.funLists, i = 0, len = list.length(), em = 0;
  var own = {used: false};
  hasPrev && this.trygu(wcb_afterStmt, own);
  while (i < len)
    this.emitFunList_subList(list.at(i++), allowsDecl, em) && em++;

  own.used || this.grmif(own);
  return em;
};

this.emitLLINOSAList =
function(scope, hasPrev) {
  ASSERT.call(this, !scope.isSourceLevel() && !scope.isAnyFn(), 'scope/fn');
  var list = scope.defs, i = 0, len = list.length(), em = 0;
  var own = {used: false};
  hasPrev && this.trygu(wcb_afterStmt, own);
  while (i < len) {
    var elem = list.at(i++);
    if (!elem.isLLINOSA()) continue;
    em ? this.w(',').os() : this.w('var').bs();
    this.w(elem.synthName).os().w('=').os().wm('{','v',':','','void').bs().wm('0','}');
    em++;
  }

  em && this.w(';');
  own.used || this.grmif(own);
  return em;
};

this.emitFunList_subList =
function(funList, allowsDecl, hasPrev) {
  var i = 0, em = 0;
  var own = {used: false}, lsn = null; 
  hasPrev && this.trygu(wcb_afterStmt, own);
  while (i < funList.length) {
    this.emitSingleFun(funList[i], allowsDecl, i, em) && em++;
    i++;
  }
  own.used || this.grmif(own);
  return em;
};

this.emitThisRef =
function(scope, hasPrev) {
  var th = scope.spThis;
  if (th === null) return 0;
  if (th.ref.i === 0) return 0;

  var own = {used: false};
  hasPrev && this.trygu(wcb_afterStmt, own);

  this.w('var').bs().w(th.synthName).os().w('=').os().w('this').w(';');

  own.used || this.grmif(own);
  return 1;
};

this.emitSingleFun =
function(n, allowsDecl, i, hasPrev) {
  var scope = n.fun['#scope'];
  var target = n.target;

  ASSERT.call(this, target, 'n.target' );

  var own = {used: false};
  hasPrev && this.trygu(wcb_afterStmt, own);

  if (allowsDecl && scope.scopeName.getAS() === ATS_SAME)
    this.emitTransformedFn(n, EC_NONE, true);
  else {
    var ll = target.isLLINOSA();
    if (i === 0 && !ll)
      this.w('var').bs();
    this.w(target.synthName);
    ll && this.wm('.','v');
    this.wm('','=','');
    n.target = null;
    scope.scopeName.synthName = scope.scopeName.name;
    this.emitExprFn(n, EC_NONE, false);
    this.w(';'); // could have been done above, with true instead of false
  }

  own.used || this.grmif(own);
  return 1;
};

this.emitTCheckVar =
function(scope, hasPrev) {
  var tg = scope.getLG('tz');
  if (tg === null) return 0;
  tg = tg.getL(0);
  var own = {used: false};
  hasPrev && this.trygu(wcb_afterStmt, own);
  this.w('var').bs().w(tg.synthName).os().w('=').os().w(scope.di0+"").w(';');
  own.used || this.grmif(own);
  return 1;
};

this.emitTransformedArgs =
function(n, hasPrev) {
  var ta = n.argsPrologue;
  if (ta === null)
    return 0;
  var b = CB(n.fun);

  var own = {used: false};
  hasPrev && this.trygu(wcb_afterStmt, own);
 
  this.emitStmt(ta);
  this.emc(b, 'inner');

  own.used || this.grmif(own);
  return 1;
};

this.emitTCHP =
function(scope, hasPrev) {
  var tg = scope.scs.getLG('tz').getL(0);
  if (tg === null)
    return 0;

  var own = {used: false};
  hasPrev && this.trygu(wcb_afterStmt, own);

  this.wm(tg.synthName,'=',scope.di0+"",';');

  own.used || this.grmif(own);
  return 1;
};

this.emitArgumentsRef =
function(scope, hasPrev) {
  var ar = scope.spArguments;
  if (ar === null) return 0;
  if (ar.ref.i === 0) return 0;

  var own = {used: false};
  hasPrev && this.trygu(wcb_afterStmt, own);

  this.wm('var',' ',ar.synthName,'','=','','arguments',';');

  own.used || this.grmif(own);
  return 1;
};

this.emitThisChk =
function(scope, hasPrev) {
  var ti = scope.getLG('ti');
  if (ti === null) return 0;
  ti = ti.getL(0);
  if (ti === null || ti.ref.d <= 0) return 0;

  var own = {used: false};
  hasPrev && this.trygu(wcb_afterStmt, own);
  this.wm('var',' ',ti.synthName,'','=','','0',';');

  own.used || this.grmif(own);
  return 1;
};

this.emitJ =
function(scope, hasPrev) {
  return 0;
  var own = false, u = null, o = {v: false};
  if (hasPrev) {
    if (!this.wcb) { this.onw(wcb_afterStmt); own = true; }
    if (!this.wcbUsed) this.wcbUsed = u = o;
    else u = this.wcbUsed;
  }

  this.wm('jz','','=','','jz','(',')',';');

  if (own) u.v || this.clear_onw();
  return 1;
};

},
function(){
Emitters['ArrayExpression'] =
function(n, flags, isStmt) {
  var cb = n['#c'];
  var si = n['#si'];
  var hasParen = false;
  if (si >= 0) {
    hasParen = flags & EC_NEW_HEAD;
    hasParen && this.w('(');
    this.emc(cb, 'bef');
    this.jz('arr').w('(');
  } else
    this.emc(cb, 'bef');

  var l = n.elements;
  if (l.length) {
    this.emitElems(l, true, cb);
    si >= 0 && this.w(')');
  } else {
    this.w('[').emc(cb, 'inner');
    this.w(']');
  }

  this.emc(cb, 'aft');
  hasParen && this.w(')');

  isStmt && this.w(';');
  return true;
};

},
function(){
this.emitAssignment_ex =
function(n, flags, isStmt) {
  var hasParen = flags & EC_EXPR_HEAD;
  var left = n.left;
  var target = null, cb = n['#c'];

  if (hasParen) { this.w('('); flags = EC_NONE; }

  this.emc(cb, 'bef');
  this.emitSAT(left, flags, 0);
  this.os();

  if (n.operator === '**=') {
    ASSERT.call(this, isResolvedName(n.left), 'not rn');
    this.w('=').os().jz('ex')
        .w('(').eN(n.left, EC_NONE, false)
        .w(',').os().eN(n.right, flags & EC_IN, false)
        .w(')');
  }
  else {
    if (n.operator === '+=') this.sl(n['#o']);
    this.w(n.operator).os();
    this.eN(n.right, flags & EC_IN, false);
  }

  this.emc(cb, 'aft');
  hasParen && this.w(')');
  isStmt && this.w(';');
  return true;
};

Emitters['AssignmentExpression'] =
function(n, flags, isStmt) {
  return this.emitAssignment_ex(n, flags, isStmt);
};

Emitters['#SynthAssig'] =
function(n, flags, isStmt) {
  if (n.binding && !tg(n.left).isVar())
    return this.emitAssignment_binding(n, flags, isStmt);
  return this.emitAssignment_ex(n, flags, isStmt);
};

this.emitAssignment_binding =
function(n, flags, isStmt) {
  ASSERT.call(this, isResolvedName(n.left), 'name');

  var cb = n['#c']; this.emc(cb, 'bef');
  tg(n.left).isLLINOSA() || this.w('var').gu(wcb_afterVar).os();
  this.emitRName_binding(n.left);
  tg(n.left).isLLINOSA() && this.wm('.','v');
  this.os().w('=').os();
  this.eN(n.right, EC_NONE, false);
  this.w(';');
  this.emc('aft');
  
  var l = n.left;
  tg(l).hasTZCheck && this.os().emitTZCheckPoint(tg(l));
};

},
function(){
this.emitBLE =
Emitters['LogicalExpression'] =
Emitters['BinaryExpression'] =
function(n, flags, isStmt) {

  var cb = CB(n);
  this.emc(cb, 'bef' );

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

  o === '+' && this.sl(n['#o']);

  switch (o) {
  case '/':
    this.os().w(o).gu(wcb_DIV_b);
    break;
  case '+':
    this.os().w(o).gu(wcb_ADD_b);
    break;
  case '-':
    this.os().w(o).gu(wcb_MIN_b);
    break;
  case 'in':
  case 'instanceof':
    this.bs(); // TODO: if writeToCurrentLine_checked keeps tt intact, we could know what the latest written token has been which helps us decide whether a bs is really necessary
    this.wt(o,ETK_ID).gu(wcb_idNumGuard);
    break;
  default:
    this.wm('',o).os();
    break;
  }

  if (isBLE(right))
    this.emitRight(right, o, EC_NONE);
  else
    this.emitBLEP(right, EC_NONE);

  hasParen && this.w(')');

  this.emc(cb, 'aft');

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

  var cb = CB(n);
  this.emcim(cmn_erase(cb, 'bef'));
  var aft = cmn_erase(cb, 'aft');
  if (hasParen) { this.w('('); flags = EC_NONE; }
  this.emitBLE(n, flags, false);
  hasParen && this.w(')');
  this.emcim(aft );
};

this.emitLeft =
function(n, o, flags) {
  var hasParen = false;
  var rp = bp(o), lp = bp(n.operator);

  if (lp<rp)
    hasParen = true;
  else if (lp === rp)
    hasParen = isRA(lp) ;

  var cb = CB(n);
  this.emcim(cmn_erase(cb, 'bef'));
  var aft = cmn_erase(cb, 'aft');
  if (hasParen) { this.w('('); flags = EC_NONE; }
  this.emitBLE(n, flags, false);
  hasParen && this.w(')');
  this.emcim(aft );
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
  this.jz('ex').w('(').eN(n.left, EC_NONE, false).w(',').os().eN(n.right, EC_NONE, false).w(')');
  hasParen && this.w(')');

  this.emc(CB(n), 'aft');
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
  var attached = flags & EC_ATTACHED;
  attached && this.os();

  ASSERT_EQ.call(this, isStmt, true);
  var cb = CB(n);
  this.emc(cb, 'bef');
  this.w('{').i();
  var lead = n['#lead'];

  var own = {used: false}, lsn = null;

  this.gu(wcb_afterStmt).gmon(own);

  var em = 0;
  if (lead) {
    this.emitStmt(lead, false);
    if (own.used) { em++; this.trygu(wcb_afterStmt, own); }
  }

  var lsn = this.listenForEmits(own);
  this.emitSimpleHead(n);
  if (lsn.used) { em++; own.used = false; this.trygu(wcb_afterStmt, own); }

  lsn = this.listenForEmits(own);
  this.emitStmtList(n.body);
  lsn.used && em++;

  this.grmif(own);

  this.u();
  em && this.l();

  this.emc(cb, 'inner');
  this.w('}');
  this.emc(cb, 'aft');

  return true;
};

},
function(){
Emitters['BreakStatement'] =
function(n, flags, isStmt) {
  this.wt('break',ETK_ID );
  var wl = this.wrapLimit;
  this.wrapLimit = 0;
  n.label && this.hs().writeToCurrentLine_raw(n.label.name);
  this.wrapLimit = wl;
  this.w(';');
};

},
function(){
Emitters['CallExpression'] =
function(n, flags, isStmt) {
  var cb = CB(n);
  this.emc(cb, 'bef');
  var hasParen = flags & EC_NEW_HEAD;

  var c = n.callee;
  var e = c.type === 'Super';
  var l = e ? c['#ti'] : null;

  if (hasParen) { this.w('('); flags = EC_NONE; }

  if (l && l.ref.d) this.jz('o').w('(');
  if (e)
    this.wt(c['#liq'].synthName, ETK_ID).wm('.','call');
  else
    this.emitCallHead(c, flags);

  this.sl(n['#argloc']);

  this.w('(');
  if (e) {
    this.eN(c['#this'], EC_NONE, false );
    n.arguments.length && this.wm(',','');
  }

  this.emitCommaList(n.arguments);
  this.emc(cb, 'inner');
  this.w(')');

  if (l && l.ref.d)
    this.wm(',','',l.synthName,'','=','','1').w(')');
  hasParen && this.w(')');
  this.emc(cb, 'aft');
  isStmt && this.w(';');
};

},
function(){
Emitters['ConditionalExpression'] =
function(n, flags, isStmt) {
  var cb = CB(n);
  this.emc(cb, 'bef' );
  var hasParen = flags & EC_EXPR_HEAD;
  if (hasParen) { this.w('('); flags = EC_NONE; }
  this.emitCondTest(n.test, flags);
  this.wm('','?','').eN(n.consequent, EC_NONE, false);
  this.wm('',':','').eN(n.alternate, EC_NONE, false);
  hasParen && this.w(')');
  this.emc(cb, 'aft');
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
Emitters['ContinueStatement'] =
function(n, flags, isStmt) {
  this.wt('continue',ETK_ID );
  var wl = this.wrapLimit;
  this.wrapLimit = 0;
  n.label && this.hs().writeIDName(n.label.name);
  this.wrapLimit = wl;
  this.w(';');
};

},
function(){
Emitters['EmptyStatement'] =
function(n, flags, isStmt) {
  var cb = CB(n);
  this.emc(cb, 'bef' );
  ASSERT_EQ.call(this, isStmt, true);
  this.w(';');
  this.emc(cb, 'aft');
  return true;
};

},
function(){
Emitters['ExpressionStatement'] =
function(n, flags, isStmt) {
  var cb = CB(n);
  this.emc(cb, 'bef' );
  ASSERT_EQ.call(this, isStmt, true);
  ASSERT.call(this, flags & EC_START_STMT, 'must be in stmt context');
  this.emitAny(n.expression, flags, true );
  this.emc(cb, 'aft');
  return true;
};

},
function(){
Emitters['IfStatement'] =
function(n, flags, isStmt) {
  ASSERT_EQ.call(this, isStmt, true);
  var cb = CB(n); this.emc(cb, 'bef' );
  this.wt('if', ETK_ID).emc(cb, 'aft.if');
  this.wm('','(').eA(n.test, EC_NONE, false).w(')');

  this.emitIfBody(n.consequent);
  if (n.alternate)
    this.l().wt('else', ETK_ID).gu(wcb_afterElse).emitElseBody(n.alternate);

  this.emc(cb, 'aft');

  return true;
};

this.emitIfBody =
function(stmt) {
  switch (stmt.type) {
  case 'BlockStatement':
    this.os();
  case 'EmptyStatement':
    return this.emitStmt(stmt);
  }
  if (stmt.type === 'ExpressionStatement') {
    if (isAssigList(stmt.expression))
      this.os().emitAny(stmt.expression, EC_START_STMT|EC_ATTACHED, true);
    else {
      this.i();
      this.l().emitStmt(stmt);
      this.u();
    }
    return true;
  }
  var own = {used: false};
  this.os().w('{').i().gu(wcb_afterStmt).gmon(own);
  this.emitStmt(stmt); // not attached -- the '{' block is, instead.
  if (this.guard) this.grmif(own);
  else { this.gu(wcb_afterStmt); }
  this.u().w('}');
};

this.emitElseBody =
function(stmt) {
  return stmt.type === 'IfStatement' ?
    this.emitStmt(stmt) :
    this.emitAttached(stmt);
};

},
function(){
Emitters['LabeledStatement'] =
function(n, flags, isStmt) {
  this.writeIDName(n.label.name);
  this.w(':').gu(wcb_afterStmt);
  var own = {used: false};
  this.gmon(own);
  if (n.body) this.emitStmt(n.body);

  own.used || this.grmif(own);
};

},
function(){
this.emitMemex =
function(n, flags, isStmt, len) {
  var cb = CB(n); this.emc(cb, 'bef' );
//this.sl(n.loc.start);
  this.eH(n.object, flags, false);
  this.sl(n['#acloc']);
  if (n.computed) {
    this.w('[').eA(n.property, EC_NONE, false);
    if (len > 0 && this.ol(1+len) > 0) this.wrapCurrentLine();
    this.w(']');
  }
  else {
    this.w('.').emc(CB(n.property), 'bef');
    this.writeIDName(n.property.name); // TODO: node itself rather than its name's string value
  }
  this.emc(cb, 'aft');
  isStmt && this.w(';');
  return true;
};

this.emitSAT_mem = 
function(n, flags, len) { return this.emitMemex(n, flags, false, len); };

Emitters['MemberExpression'] =
function(n, flags, isStmt, len) { return this.emitMemex(n, flags, isStmt, 0); };

},
function(){
Emitters['NewExpression'] =
function(n, flags, isStmt) {
  var cb = CB(n); this.emc(cb, 'bef' );
  var si = findElem(n.arguments, 'SpreadElement');
  if (si === -1) {
    this.wt('new', ETK_ID).gu(wcb_afterNew).os().emitNewHead(n.callee);
    this.w('(').emitCommaList(n.arguments);
    this.emc(cb, 'inner');
    this.w(')');
  } else {
    var hasParen = flags & EC_NEW_HEAD;
    if (hasParen) { this.w('('); flags = EC_NONE; }
    this.jz('n').w('(').eN(n.callee, EC_NONE, false).wm(',','')
      .jz('arr').w('(').emitElems(n.arguments, si >= 0, cb);

    this.emc(cb, 'inner');
    this.w(')').w(')');
    hasParen && this.w(')');
  }

  this.emc(cb, 'aft');
  isStmt && this.w(';');
  return true;
};

},
function(){
Emitters['ObjectExpression'] =
function(n, flags, isStmt) {
  var cb = CB(n); this.emc(cb, 'bef' );
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

  var cbe = null;

  var item = null, last = ci >= 0 ? ci : list.length;

  while (e < last) {
    item = list[e];
    if (e) this.w(',').os();
    cbe = CB(item); this.emc(cbe, 'bef' );
    this.writeMemName(item.key, false).w(':').os().eN(item.value, EC_NONE, false).emc(cbe, 'aft');
    e++;
  }

  this.emc(cb, 'inner');
  this.w('}');

  if (ci >= 0) {
    while (e < list.length) {
      this.w(',').os();
      item = list[e];
      cbe = CB(item); this.emc(cbe, 'bef' );
      if (item.computed)
        this.eN(item.key, EC_NONE, false);
      else
        this.writeMemName(item.key, true);
      this.w(',').os().eN(item.value, EC_NONE, false).emc(cbe, 'aft');
      e++;
    }
    this.emc(cb, 'inner');
    this.w(')');
  }

  hasParen && this.w(')');
  this.emc(cb, 'aft');

  isStmt && this.w(';');
  return true;
};

},
function(){
Emitters['ReturnStatement'] =
function(n, flags, isStmt) {
  ASSERT_EQ.call(this, isStmt, true);

  var cb = CB(n);
  this.emc(cb, 'bef');

  this.sl(n.loc.start); // TODO: only ctors without supers

  this.wt('return',ETK_ID);
  if (n.argument) {
    var l = {hasParen: false};
    this.gu(wcb_afterRet).gar(l);
    this.emitAny(n.argument, EC_NONE, false);
    if (l.hasParen) this.w(')');
  } else
    this.emc(cb, 'ret.aft');
  this.w(';');
  this.emc(cb, 'aft');
};

},
function(){
Emitters['SequenceExpression'] =
function(n, flags, isStmt) {
  var cb = CB(n); this.emc(cb, 'bef' );
  var hasParen = flags & (EC_EXPR_HEAD|EC_NON_SEQ);
  if (hasParen) { this.w('('); flags = EC_NONE; }
  this.emitCommaList(n.expressions, flags);
  hasParen && this.w(')');
  this.emc(cb, 'aft');
  isStmt && this.w(';');
  return true;
};

},
function(){
Emitters['SwitchStatement'] =
function(n, flags, isStmt) {
  var cb = CB(n); this.emc(cb, 'bef' );
  this.wt('switch', ETK_ID).emc(cb, 'switch.aft');
  this.wm('','(').eA(n.discriminant, EC_NONE, false).w(')');
  this.emc(cb, 'cases.bef') || this.os();
  this.w('{');

  var own = {used: false};
  this.gu(wcb_afterStmt).gmon(own);
  this.emitStmtList(n.cases); // TODO: emitCases(cases []SwitchCase), to make less use of new `{used: false}` objects
  own.used ? this.l() : this.grmif(own);
  this.emc(cb, 'inner');
  this.w('}').emc(cb, 'aft');
  return true;
};

Emitters['SwitchCase'] =
function(n, flags, isStmt) {
  var cb = CB(n); this.emc(cb, 'bef' );
  n.test === null ?
    this.wt('default', ETK_ID).emc(cb, 'default.aft') :
    this.wt('case', ETK_ID).gu(wcb_afterCase).eA(n.test, EC_NONE, false);

  var own = {used: false};
  this.w(':').i().gu(wcb_afterStmt).gmon(own);
  this.emitStmtList(n.consequent);
  this.u().grmif(own);
  this.emc(cb, 'aft');
  this.emc(cb, 'inner');
  return true;
};

},
function(){
Emitters['TaggedTemplateExpression'] =
function(n, flags, isStmt) {
  var callee = n.tag;
  var hasParen = flags & EC_NEW_HEAD;
  if (hasParen) { this.w('('); flags = EC_NONE; }

  this.eH(callee, flags, false).w('(');
  this.jz('t').w('(');

  var list = n.quasi.quasis, l = 0;
  this.w('[');
  while (l < list.length) {
    l && this.wm(',','');
    this.writeString(list[l++].value.cooked, "'");
  }
  this.wm(']',',').os();

  l = 0;
  this.w('[');
  while (l < list.length) {
    l && this.wm(',','');
    var item = list[l++ ];
    if (item.value.raw === item.value.cooked)
      this.writeString('', '"');
    else
      this.writeString(item.value.raw, "\'");
  }
  this.w(']');

  this.w(')');

  list = n.quasi.expressions; l = 0;
  while (l < list.length)
    this.wm(',','').eN(list[l++], EC_NONE, false);

  this.w(')');
  hasParen && this.w(')');

  isStmt && this.w(';');
};

},
function(){
Emitters['TemplateLiteral'] =
function(n, flags, isStmt) {
  var strList = n.quasis;
  var eList = n.expressions;
  var s = 0, writeEx = false, e = 0;

  if (strList[0].value.cooked.length === 0 && !strList[0].tail) {
    s++;
    writeEx = true;
  }

  this.w('('); // TODO: eliminate when the TemplateLiteral gets treated like an actual ex + str + ... + ex + str
  while (true) {
    if (writeEx) {
      this.w('(').eA(eList[e++], EC_NONE, false).w(')');
      this.wm('', '+').os();
      writeEx = false;
    } 
    else {
      var item = strList[s++ ];
      this.writeString(item.value.cooked, "'");
      if (!item.tail)
        this.wm('','+','');
      else
        break;
      writeEx = true;
    }
  }

  this.w(')');

  isStmt && this.w(';');
};

},
function(){
Emitters['ThrowStatement'] =
function(n, flags, isStmt) {
  var r = {hasParen: false}, cb = CB(n);
  this.emc(cb, 'bef');

  this.sl(n.loc.start);
  this.wt('throw',ETK_ID).gu(wcb_afterRet).gar(r);
  this.eA(n.argument, EC_NONE, false);
  if (r.hasParen) this.w(')');
  this.w(';').emc(cb, 'aft');
};

},
function(){
Emitters['TryStatement'] =
function(n, flags, isStmt) {
  this.w('try').os().emitStmt(n.block, true);
  var l = n.handler;
  if (l) {
    this.l().wm('catch','','(',l['#scope'].catchVar.synthName,')','');
    this.emitStmt(l.body, true);
  }

  l = n.finalizer;
  if (l) this.l().w('finally').os().emitStmt(l, true);
};

},
function(){
Emitters['UnaryExpression'] = 
function(n, flags, isStmt) {
  var cb = CB(n); this.emc(cb, 'bef' );
  var o = n.operator;
  var hasParen = flags & EC_EXPR_HEAD;
  if (hasParen) { this.w('('); flags = EC_NONE; }

  switch (o) {
  case '!':
  case '~':
    this.w(o);
    break;
  case '-':
    this.wt(o, ETK_MIN).gu(wcb_MIN_u);
    break;
  case '+':
    this.wt(o, ETK_ADD).gu(wcb_ADD_u);
    break;
  case 'void': case 'delete': case 'typeof':
    this.wt(o, ETK_ID).gu(wcb_afterVDT);
    break;
  default:
    ASSERT.call(this, false, 'unary [:'+o+':]');
    break;
  }

  this.emitUA(n.argument);
  hasParen && this.w(')');
  this.emc(cb, 'aft');

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
// somevery[:wraplimit:]longid--
// (someverylongid
// )--
//
Emitters['UpdateExpression'] =
function(n, flags, isStmt) {
  var cb = CB(n); this.emc(cb, 'bef' );
  var hasParen = false;
  var l = n.argument;
  var t = false, v = false;
  if (isResolvedName(l)) { t = tzc(l); v = cvc(l); hasParen = t || v; }
  else hasParen = flags & EC_EXPR_HEAD;

  if (hasParen) { this.w('('); flags = EC_NONE; }

  if (t) { this.emitAccessChk_tz(tg(l)); this.w(',').os(); }
  if (v) { this.emitAccessChk_invalidSAT(tg(l)); this.w(',').os(); }

  var o = n.operator;
  if (n.prefix) {
    this.wt(o, o !== '--' ? ETK_ADD : ETK_MIN);
    flags = EC_NONE;
    this.emitSAT(n.argument, flags, 0);
  }
  else {
    this.emitSAT(n.argument, flags, o.length);
    this.writeToCurrentLine_raw(o); // hard-write because the wrapping affairs have been take care of when calling emitSAT
  }
  hasParen && this.w(')');
  this.emc(cb, 'aft');

  isStmt && this.w(';');
  return true;
};

},
function(){
Emitters['WhileStatement'] =
function(n, flags, isStmt) {
  var cb = CB(n); this.emc(cb, 'bef' );
  this.wt('while', ETK_ID);
  this.emc(cb, 'while.aft') || this.os(); 
  this.w('(').eA(n.test, EC_NONE, false).w(')');
  this.emitAttached(n.body);
  this.emc(cb, 'aft');
  return true;
};

},
function(){
// Emitters['ForOfStatement'] =
Emitters['ForInStatement'] =
Emitters['ForStatement'] =
// Emitters['TryStatement'] =
// Emitters['LabeledStatement'] =
// Emitters['ContinueStatement'] =
// Emitters['BreakStatement'] =
function(n, flags, isStmt) {
  console.log('SKIPPING', n.type, 'LEN', n.end - n.start);
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
  var hasWrapper = n.cls || n.scall || lonll || isRenamed;
  var em = 0;
  if (hasWrapper) {
    if (!hasParen)
      hasParen = flags & EC_NEW_HEAD;
  }

  var l = {hasParen: false };

  if (hasParen) { this.w('('); flags = EC_NONE; }
  if (hasWrapper) {
    this.wt('function', ETK_ID).w('(');
    if (n.scall) { this.w(n.scall.inner.synthName); em++; }
    if (n.cls) { em && this.w(',').os(); this.w(n.cls.inner.synthName); em++; }
    if (lonll) { em && this.w(',').os(); this.wsndl(lonll); }
    this.w(')').os().w('{').i().l();
    if (isRenamed)
      this.w('var').gu(wcb_afterVar).wt(scopeName.synthName, ETK_ID).wm('','=','');
    else
      this.w('return').gu(wcb_afterRet).gar(l);
  }
  this.emitTransformedFn(n);
  if (l.hasParen) this.w(')');
  if (hasWrapper) {
    this.w(';');
    if (isRenamed) {
      this.l().w('return').gu(wcb_afterRet).gar(l).wt(scopeName.synthName, ETK_ID);
      if (l.hasParen) this.w(')');
      this.w(';');
    }
    this.u().l().wm('}','(');
    em = 0;
    if (n.scall) { this.eN(n.scall.outer, EC_NONE, false); em++; }
    if (n.cls) { em && this.w(',').os(); this.eN(n.cls.outer, EC_NONE, false); em++; }
    if (lonll) { em && this.w(',').os(); this.wsndl(lonll); }
    this.w(')');
  }
  hasParen && this.w(')');
  isStmt && this.w(';');
};

},
function(){
Emitters['DoWhileStatement'] =
function(n, flags, isStmt) {
  var cb = CB(n); this.emc(cb, 'bef' );
  ASSERT_EQ.call(this, isStmt, true);
  this.wt('do',ETK_ID).os();

  var nbody = n.body, notBlock = nbody.type !== 'BlockStatement';

  var own = null;
  if (notBlock) {
    own = {used: false};
    this.w('{').i().gu(wcb_afterStmt).gmon(own);
  }

  this.emitStmt(n.body);

  if (notBlock) {
    this.u();
    if (own.used) this.l();
    else
      this.grmif(own);
    this.w('}');
  }

  this.os().w('while');
  this.emc(cb, 'while.aft') || this.os();
  this.w('(').eA(n.test, EC_NONE, false).w(')').emc(cb, 'cond.aft');
  this.w(';').emc(cb, 'aft');
  return true;
};

},
function(){
Emitters['Program'] =
function(n, flags, isStmt) {
  var main = n['#scope'];

  var lsn = null, own = {used: false};
  lsn = this.listenForEmits(own);
  this.emitSourceHead(n);
  if (lsn.used) { own.used = false; this.trygu(wcb_afterStmt, own); }

  this.emitStmtList(n.body);
  this.emc(CB(n), 'inner');

  own.used || this.grmif(own);
};

},
function(){
Emitters['Literal'] =
function(n, flags, isStmt) {
  var cb = CB(n); this.emc(cb, 'bef' );
  var isRegex = HAS.call(n, 'regex');
  if (n.value === null && !isRegex)
    this.wt('null',ETK_ID);
  else
  switch (typeof n.value) {
  case STRING_TYPE: 
    this.writeString(n.value,"'");
    this.ttype = ETK_NONE;
    break;
  case BOOL_TYPE: 
    this.wt(n.value ? 'true' : 'false', ETK_ID);
    break;
  case NUMBER_TYPE:
    this.wt(n.value+"", ETK_NUM);
    if (isInteger(n.value))
      this.gu(wcb_intDotGuard );
    break;
  default:
    if (isRegex)
      this.wt(n.raw,ETK_DIV  );
    else
      ASSERT.call(this, false, 'unknown value');
    break;
  }
  this.emc(cb, 'aft');
  isStmt && this.w(';');

  return true;
};

},
function(){
Emitters['#Bundler'] =
function(n, flags, isStmt) {
  return this.emitBundleItem(n.rootNode);
};

function ws(n) {
  var str = "";
  while (n--) str += '| ';
  return str;
}

var wslen = 0;

this.emitBundleItem =
function(n) {
  var WS = ws(wslen++);
  console.error(WS+'starting ['+n['#scope']['#uri']+']');
  var list = n['#imports'], len = list === null ? 0 : list.length, l = 0;
  var lsn = null;
  var own = {used: false};

  while (l < len) {
    var im = list[l++];
    lsn = this.listenForEmits(own);
    this.emitBundleItem(im);
    if (lsn.used) {
      own.used = false;
      this.trygu(wcb_afterStmt, own);
    }
  }

  console.error(WS+'Emitting ['+n['#scope']['#uri']+'] loaded from ['+n['#scope']['#loader']+']');
  this.emitStmt(n);

  console.error(WS+'finish ['+n['#scope']['#uri']+']');
  wslen--;
  own.used || this.grmif(own);
};

},
function(){
/*  TODO: Raw, for alternative bundlers */Emitters['#ExportNamedDeclaration'] = 
function(n, isVal) {
  if (n.declaration)
    return this.emitAny(n.declaration, EC_START_STMT, true);
};

/*  TODO: Raw, for alternative bundlers */Emitters['#ExportDefaultDeclaration'] =
function(n, isVal) {
  var b = n['#binding'];
  var elem = n.declaration;
  if (b !== null) { // if it has to have a binding, then it's either an expression or a nameless fn or cls
    this.wt('var',ETK_ID).bs();
    this.w(b.synthName).os().w('=').os();
    this.eN(elem, EC_NONE, false).w(';');
  }
  else 
    this.eA(elem, EC_START_STMT, true);
};

/*  TODO: Raw, for alternative bundlers */Emitters['#ImportDeclaration'] =
function(n, isVal) {};

},
function(){
Emitters['#ForInStatementWithDeclarationHead' ] =
function(n, flags, isStmt) {
  ASSERT_EQ.call(this, isStmt, true);
  return this.emitEnumeration(n, flags, 'dh');
};


Emitters['#ForInStatementWithExHead' ] =  
function(n, flags, isStmt) {
  ASSERT_EQ.call(this, isStmt, true);
  return this.emitEnumeration(n, flags, 'eh');
};


this.emitEnumeration =
function(n, flags, t) {
  var b = t === 'dh';
  var l = n.left;
  this.w('for').os().w('(');

  if (b) {
    if (tg(l).isLLINOSA()) {
      this.w('(').emitRName_binding(l);
      this.wm('','=','','{','v');
      this.os().wm(':','void',' ','0','}',')','.','v').bs();
    }
    else {
      this.w('var').bs().emitRName_binding(l);
      this.bs();
    }
  }
  else if (l.type === 'MemberExpression') {
    this.emitSAT(l, EC_NONE, 0);
    this.os();
  }
  else {
    this.emitAny(l, EC_NONE, false);
    this.bs();
  }

  this.wt('in',ETK_ID );
  this.gu(wcb_idNumGuard );
  this.os();

  this.emitAny(n.right, EC_NONE, false);
  this.w(')');

  this.emitAttached(n.body);
};

},
function(){
Emitters['#ForOfStatement'] =
function(n, flags, isStmt) {
  this.w('for').os().w('(');
  this.eH(n.left, EC_NONE, false).os().w('=').os().jz('of').w('(');
  this.eN(n.right, EC_NONE, false).w(')');

  this.w(';').os();
  var scope = n['#scope'];
  if (scope.hasTZCheckPoint) {
    var tz = scope.scs.getLG('tz').getL(0);
    this.wm(tz.synthName,' ','=',' ',scope.di0+"",',','');
  }
  this.eH(n.left, EC_NONE, false).w('.').wm('next','(',')',';',')');
  this.emitBody(n.body);
};

},
function(){
UntransformedEmitters['arg-at'] =
function(n, flags, isStmt) {
  ASSERT_EQ.call(this, isStmt, false);
  this.wt('arguments', ETK_ID).w('[');
  this.wm(n.idx+"",']');

  return true;
};

UntransformedEmitters['arg-rest'] =
function(n, flags, isStmt) {
  ASSERT_EQ.call(this, isStmt, true);
  var cb = CB(n); this.emc(cb, 'bef' );
  var l = n.left;
  ASSERT.call(this, isResolvedName(l) || isTemp(l), 'neither id nor temp');
  this.eA(l, EC_NONE, false)
    .wm('','=','','[',']',';').l()
    .wm('while','','(').eA(l, EC_NONE, false)
    .wm('.','length')
    .wm('+',n.idx+"",'','<','','arguments','.','length',')').i().l()
    .eA(l, EC_NONE, false).w('[').eA(l, EC_NONE, false).wm('.','length')
    .w(']')
    .wm('','=',' ','arguments','[').
    eA(l, EC_NONE, false).wm('.','length','+',n.idx,']',';').u();
  this.emc(cb, 'aft');
  return true;
};

},
function(){
UntransformedEmitters['arr-iter-get'] =
function(n, flags, isStmt) {
  var cb = CB(n); this.emc(cb, 'bef' );
  this.eA(n.iter, EC_NONE, false).wm('.','get');
  this.wm('(',')');
  this.emc(cb, 'aft'); // TODO: unnecessary
  isStmt && this.w(';');
  return true;
};

UntransformedEmitters['arr-iter-end'] =
function(n, flags, isStmt) {
  var cb = CB(n);
  this.eA(n.iter, EC_NONE, false).wm('.','end');
  this.wm('(',')');
  this.emc(cb, 'aft');
  isStmt && this.w(';');
  return true;
};

UntransformedEmitters['arr-iter'] =
function(n, flags, isStmt) {
  this.jz('arrIter', EC_NONE, false).w('(').eN(n.iter, EC_NONE, false).w(')');
  return true;
};

UntransformedEmitters['arr-iter-get-rest'] =
function(n, flags, isStmt) {
  var cb = CB(n);
  this.emc(cb, 'bef' );
  this.eA(n.iter, EC_NONE, false).wm('.','rest').wm('(',')').emc(cb, 'aft');

  return true;
};

},
function(){
UntransformedEmitters['assig-list'] =
function(n, flags, isStmt) {
  var cb = CB(n);
  var attached = flags & EC_ATTACHED;
  attached && this.w('{').i().gu(wcb_afterStmt);

  if (isStmt) {
    this.emc(cb, 'bef');
    this.emitStmtList(n.list);
    this.emc(cb, 'inner');
    this.emc(cb, 'left.aft');
    this.emc(cb, 'aft');
  }
  else {
    var hasParen = flags & (EC_EXPR_HEAD|EC_NON_SEQ);
    if (hasParen) { this.w('('); flags &= EC_IN; }
    this.emc(cb, 'bef');
    this.emitCommaList(n.list, flags);
    this.emc(cb, 'inner');
    this.emc(cb, 'left.aft');
    this.emc(cb, 'aft');
    hasParen && this.w(')');
  }

  attached && this.u().l().w('}');
};

},
function(){
UntransformedEmitters['call'] = 
function(n, flags, isStmt) {
  var hasParen = flags & EC_NEW_HEAD;
  var cb = CB(n); this.emc(cb, 'bef');
  if (hasParen) { this.w('('); } 
  if (n.mem !== null) {
    this.jz('cm');
    this.sl(n['#argloc']);
    this.w('(').eN(n.head, EC_NONE, false).w(',').os();
    var m = n.mem;
    m.type === 'Super' ? this.w(m['#liq'].synthName) : this.eN(m, EC_NONE, false) ;
  }
  else {
    this.jz('c');
    this.sl(n['#argloc']);
    this.w('(');
    if (n.head.type === 'Super') this.w(n.head['#liq'].synthName);
    else this.eN(n.head, EC_NONE, false);
  }

  this.w(',').os();
  this.jz('arr').w('(').emitElems(n.list, true, cb);
  this.w(')').w(')');
  
  hasParen && this.w(')');
  isStmt && this.w(';');

  return true;
};

},
function(){
UntransformedEmitters['cls'] =
function(n, flags, isStmt) {
  this.jz('cls').w('(');
  if (n.cls) {
    ASSERT.call(this, n.target === null, 'cls' ); 
    this.eN(n.cls, EC_NONE, false);     
  }
  else this.w(n.target.synthName);
  n.heritage && this.w(',').os().eN(n.heritage);
  this.w(')');
  isStmt && this.w(';');
};

UntransformedEmitters['cls-assig'] =
function(n, flags, isStmt) {
  ASSERT_EQ.call(this, isStmt, true);
  var ll = n.target.isLLINOSA();
  ll || this.w('var').bs();
  this.w(n.target.synthName);
  ll && this.wm('.','v');
  this.wm('','=','').eN(n.ctor, EC_NONE, false);
  this.w(';');
};

},
function(){
UntransformedEmitters['synthc'] =
function(n, flags, isStmt) {
  ASSERT_EQ.call(this, isStmt, false ) ;
  var s = 's';
  if (n.heritage) {
    var base = 's', num = 0;
    if (n.name) {
      var name = n.name.name;
      while (name === s)
        s = base + (++num);
    }  
    this.wt('function',ETK_ID).wm('(',s,')','','{','','return').onw(wcb_afterRet,{hasParen: false});
    var obj = this.wcbp;
    this.wt('function',ETK_ID);
    if (n.name) this.wm(' ',n.name.name);
    this.wm('(',')','','{','', s,'.','apply','(',
      'this',',','arguments',')',';','','}');
    obj.hasParen && this.w(')')
    this.wm(';','','}','(').eN(n.heritage).w(')');

  } else {
    this.w('function');
    if (n.name) this.wm(' ',n.name.name);
    this.wm('(',')','','{','}');
  }
};

},
function(){
UntransformedEmitters['global-update'] =
function(n, flags, isStmt) {
  ;
  var hasParen = flags & EC_NEW_HEAD;
  var td = tg(n.isU ? n.assig.argument : n.assig.left);
  hasParen && this.w('(');
  this.wt(td.synthName+'u', ETK_ID).w('(').eN(n.assig, EC_NONE, false).w(')');
  hasParen && this.w(')');
  isStmt && this.w(';');
  return true;
};

},
function(){
UntransformedEmitters['heritage'] =
function(n, flags, isStmt) {
  ASSERT_EQ.call(this, isStmt, false);
  this.jz('h').sl(n.heritage.loc.start);

  this.w('(').eN(n.heritage, EC_NONE, false).w(')');
};

},
function(){
UntransformedEmitters['synth-literal'] =
Emitters['Literal'];

},
function(){
UntransformedEmitters['llinosa-names'] =
function(n, flags, isStmt) {
  ASSERT_EQ.call(this, isStmt, true);
  var scope = n.scope, hasV = n.withV, list = scope.defs, em = 0;
  var l = 0, len = list.length();

  while (l < len) {
    var item = list.at(l++);
    if (item.isLLINOSA()) {
      em ? this.w(',').os() : this.w('var').bs();
      this.w(item.synthName);
      hasV && this.os().wm('=','','{','v',':','','void',' ','0','}');
      ++ em;
    }
  }

  em && this.w(';').l(); // TODO onw(wcb_afterStmt) rather than l
};

},
function(){
UntransformedEmitters['memlist'] =
function(n, flags, isStmt) {
  var list = n.m, tproto = n.p, e = 0;
  var m = 0;
  while (e < list.length) {
    var mem = list[e++];
    if (mem === null) continue;
    if (m) isStmt ? this.w(';').l() : this.w(',').os();
    this.eH(tproto);
    if (mem.computed || mem.key.type === 'Literal')
      this.w('[').eA(mem.key, EC_NONE, false).w(']');
    else
      this.w('.').writeMemName(mem.key, false);
    this.wm('','=','').eA(mem.value, EC_NONE, false );
    m++;
  }
  isStmt && m && this.w(';');
};

},
function(){
UntransformedEmitters['obj-iter'] =
function(n, flags, isStmt) {
  this.eN(n.iter, flags, isStmt);
};

UntransformedEmitters['obj-iter-end'] =
function(n, flags, isStmt) {
  ASSERT_EQ.call(this, isStmt, false);
  this.eN(n.iter, flags, isStmt);
};

UntransformedEmitters['obj-iter-get'] =
function(n, flags, isStmt) {
  this.eH(n.iter);
  if (n.computed)
    this.w('[').eA(n.idx, EC_NONE, false).w(']');
  else
    this.w('.').writeMemName(n.idx, false);
};

},
function(){
UntransformedEmitters['rcheck'] =
function(n, flags, isStmt) {
  this.jz('r').w('(');
  if (n.val) { this.eN(n.val, EC_NONE, false).w(',').os(); }
  this.wm(n.th.synthName,')');
  isStmt && this.w(';');
};

},
function(){
Emitters['#-ResolvedName.ex'] = this.emitRName_ex =
Emitters['#-ResolvedName.sat'] = this.emitRName_SAT =
function(n, flags, isStmt) {
  var hasParen = false;
  var hasZero = false;
  var tv = tg(n).isLLINOSA(); // tail v
  var tz = false;

  if (tv)
    hasZero = hasParen = flags & EC_CALL_HEAD;
  if (n.type === '#-ResolvedName.ex') {
    ASSERT_EQ.call(this, cvc(n), false);
    tz = tzc(n);
    if (tz) {
      if (!hasParen) hasParen = flags & (EC_EXPR_HEAD|EC_NON_SEQ);
      if (hasZero) hasZero = false;
    }
  }
  if (tg(n).isGlobal())
    this.sl(n.loc.start);
  if (hasParen) { this.w('('); flags = EC_NONE; }

  if (hasZero) this.wm('0',',')
  else if ( tz) {
    this.emitAccessChk_tz(tg(n), n.loc.start);
    this.w(',').os();
  }

  var cb = CB(n); this.emc(cb, 'bef');

//var ni = this.smSetName(n.id.name);
  this.wt(tg(n).synthName, ETK_ID );
  tv && this.v();
//this.sl(n.id.loc.end);
//this.namei_cur = ni;

  this.emc(cb, 'aft');
  hasParen && this.w(')');
//tz && this.sl(n.id.loc.end);
  isStmt && this.w(';');
  return true;
};

Emitters['#-ResolvedName.binding'] = this.emitRName_binding =
function(n, flags, isStmt) {
  ASSERT.call(this, isResolvedName(n), 'rn');
  var cb = CB(n); this.emc(cb, 'bef' );
  this.wt(tg(n).synthName, ETK_ID );
  this.emc(cb, 'aft');
  return true;
};

},
function(){
UntransformedEmitters['resolved-this'] =
function(n, flags, isStmt) {
  var hasParen = false, b = CB(n.id);
  var th = n.plain ? 'this' : n.target.synthName;

  if (n.chk) hasParen = flags & (EC_EXPR_HEAD|EC_NON_SEQ);
  if (hasParen) { this.w('('); flags = EC_NONE; }

  if (n.chk) { 
    this.w(n.target.ref.scope.scs.getLG('ti').getL(0).synthName)
      .w('||').jz('tz');
    this.sl(n.id.loc.start);
    this.w('(').writeString('this',"'");
    this.wm(')',',');
  }
  this.emc(b, 'bef');
  this.wt(th, ETK_ID);
  this.emc(b, 'aft');

  hasParen && this.w(')'); 

  isStmt && this.w(';');
};

UntransformedEmitters['bthis'] =
function(n, flags, isStmt) {
  ASSERT_EQ.call(this, isStmt, false);
  this.w(n.plain ? 'this' : n.target.synthName);
};

},
function(){
UntransformedEmitters['skip'] =
function(n, flags, isStmt) { return false; };

},
function(){
UntransformedEmitters['synth-name'] =
function(n, flags, isStmt) {
  this.wt(n.liq.synthName, ETK_ID );
  return true;
};

},
function(){
UntransformedEmitters['cvtz'] =
function(n, flags, isStmt) {
  ASSERT_EQ.call(this, isStmt, false);
  this.jz('o').w('(').eN(n.value);
  if (tzc(n.rn))
    this.w(',').os().emitAccessChk_tz(tg(n.rn), n.rn.loc.start);
  if (cvc(n.rn))
    this.w(',').os().emitAccessChk_invalidSAT(tg(n.rn), n.rn.loc.start);

  this.w(')');
};

},
function(){
UntransformedEmitters['temp'] =
function(n, flags, isStmt) {
//this.wt(n.liq.name+n.liq.idx, ETK_ID );
  this.wt(n.liq.synthName, ETK_ID);
  return true;
};

UntransformedEmitters['temp-save'] =
function(n, flags, isStmt) {
  var hasParen = flags & EC_EXPR_HEAD;
  var cb = CB(n); this.emc(cb, 'bef');
  if (hasParen) { this.w('('); flags &= EC_IN; }
  this.eA(n.left, flags, false).os().w('=').os().eN(n.right, flags & EC_IN, false);
  hasParen && this.w(')');
  this.emc(cb, 'aft');
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
  var raw = n.fun, cb = CB(raw);
  this.emc(cb, 'bef');
  this.wt('function', ETK_ID );
  this.emc(cb, 'fun.aft');
  var scopeName = raw['#scope'].scopeName;

  var ni = this.namei_cur;
  if (scopeName) {
    this.bs();
    var name_cb = scopeName.site && CB(scopeName.site);
    name_cb && this.emc(name_cb, 'bef' );
    ni = this.smSetName_str(scopeName.name);
    this.writeIDName(scopeName.name);
    name_cb && this.emc(name_cb, 'aft');
  }
  this.emc(cb, 'list.bef' );
  this.sl(raw['#argploc']);
  this.w('(');

  if (raw.params) {
    this.emitCommaList(raw.params);
    this.emc(cb, 'inner');
  }

  var own = {used: false}, lsn = null, em = 0;
  this.wm(')','','{').i();

  this.gu(wcb_afterStmt).gmon(own);
  this.emitFnHead(n);
  if (own.used) {
    em++;
    own.used = false;
    this.trygu(wcb_afterStmt, own);
  }

  this.emitStmtList(raw.body.body);

  if (own.used) em++;
  else { this.grmif(own); }

  this.u();

  em && this.l();

  this.w('}');
  this.namei_cur = ni;
  this.emc(cb, 'aft');
};

},
function(){
UntransformedEmitters['tval'] =
function(n, flags, isStmt) {
  var ex = n.ex;
  ASSERT.call(this, ex.type === '#Untransformed' && ex.kind === 'temp', 't');
  this.eN(ex, EC_NONE, false).wm('.','val');
};

},
function(){
UntransformedEmitters['tzchk'] =
function(n, flags, isStmt) {
  var hasParen = false;
  if (!isStmt)
    hasParen = n.li ? flags & (EC_NON_SEQ|EC_EXPR_HEAD ) :
      flags & EC_NEW_HEAD;
  
  if (hasParen) { this.w('('); flags = EC_NONE; }
  if (n.liq === null) { this.jz('tz').w('(').writeString(n.target.name,"'"); this.w(')'); }
  else ASSERT.call(this, false,  'l');
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
  var cb = CB(n);
  this.emc(cb, 'bef');
  Emitters['ConditionalExpression'].call(this, n, flags, isStmt);
  this.emc(cb, 'aft');
};

},
function(){


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
  var len = refs.length(), e = 0;
  while (e < len) refs.at(e++).scope = this;
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

    target = ref.getDecl_nearest();
    if (target === this.scopeName)
      continue;
    if (target === this.spArguments)
      continue;
    if (target === this.spThis)
      continue;
    if (target.isLiquid()) {
      switch (target.category) {
      case '<this>':
      case '<arguments>':
      case 'scall': continue;
      }
    }

    ASSERT.call(this, !target.isLiquid(), 'got liquid');
    ASSERT.call(this, !this.owns(target), 'local');

    if (target.isLexicalLike() && target.ref.scope.insideLoop()) {
      var mname = _m(target.name);
      var ll = this.getClosureLLINOSA_m(mname);
      if (ll) ASSERT.call(this, ll === target, 'll');
      else {
        (list || (list = [])).push(target);
        this.insertClosureLLINOSA_m(mname, target);
      }
    }
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
// the only names that are checked via hasClosureLLINOSA_m are the ones already known to be external refs
// this is because the routine below is only called during getLoopLexicals. while there, the LLINOSA names
// are then queried against the scope's closureLLINOSA. if not found, they will be added to the ll array, and will be recorded in the scope's closureLLINOSA
// else it means the parent fn has them in its closure, and they need not get into yet another closure:
//
// var a = []; while (a.length < 12) { let len = a.length; a.push(function() { return len-- * (function() { return len })() }) }
//
// withOUT:
// var a = [];
// while (a.length < 12) {
//   var len = {v: void 0};
//   len.v = a.length;
//   a.push(function(len) {
//     return function() {
//       return len.v-- * function(len) { return function() { return len.v } }(len)();
//     };
//   }(len));
// }
//
// WITH:
// var a = [];
// while (a.length < 12) {
//   var len = {v: void 0};
//   len.v = a.length;
//   a.push(function(len) {
//     return function() {
//       return len.v-- * function() { return len.v };
//     };
//   }(len));
// }

this.getClosureLLINOSA_m =
function(mname) {
  return this.closureLLINOSA[mname]; 
};

// CLs are only inserted when an fn's outer-loop-lexicals are getting calculated;
this.insertClosureLLINOSA_m =
function(mname, llinosa) {
  ASSERT.call(this, !this.getClosureLLINOSA_m(mname), 'closure-l');
  this.closureLLINOSA[mname] = llinosa;
};

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

  var lg = this.gocLG('scall');
  var spSuperCall = lg.newL();
  lg.seal();

  spSuperCall.ref = null;
  spSuperCall.r(ref);
  spSuperCall.name = 's';

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
function(mname, r) {
  this.isBooted || this.synth_boot(r);
  var synth = this.findSynth_m(mname)
  if (synth === null && this.scopeName && this.scopeName.hasName_m(mname))
    synth = this.scopeName;
  return synth;
};

this.synth_decl_find_homonym_m =
function(mname, r) {
  this.isBooted || this.synth_boot(r);
  return this.findSynth_m(mname);
};

this.synth_boot =
function(r) {
  if (this.renamer === null) this.renamer = r;
  this.synth_boot_init();
  ASSERT.call(this, !this.inBody, 'inBody');
  this.synth_args();
  this.activateBody();
  this.synth_defs_to(this);
  this.deactivateBody();
};

this.synth_start =
function(r) {
  this.isBooted || this.synth_boot(r);
  this.synth_externals();
};

// TODO: save extenals on hand-over to obviate the chore below
this.synth_externals =
function() {
  ASSERT.call(this, !this.inBody, 'inBody');
  var list = this.argRefs, e = 0, len = list.length();
  while (e < len) {
    var itemName = list.keys[e];
    // console.error('synth-externals', itemName);
    var item = list.at(e++);
    if (item) {
      // console.error('getting nearest for', itemName);
      var target = item.getDecl_nearest(), mname = "";
      // console.error('got nearest for', itemName+'\n');

      if (target.isLiquid()) {
        ASSERT.call(this, target.category === '<this>' ||
          target.category === '<arguments>' || target.category === 'scall', 'liq');
        continue;
      }

      //  TODO: synth_boot has to trigger if target.isImported
      if (target.synthName === "") {
        ASSERT.call(
          this,
          target.isGlobal() || target.isImported(), 
          'unsynthesized name can only be an import binding'
        );
      }
      else {
        ASSERT.call(this, target.synthName !== "", 'synth');

        mname = _m(target.synthName);
        var synth = this.findSynth_m(mname);
        if (synth !== target) {
          ASSERT.call(this, synth === null, 'override');
          this.insertSynth_m(mname, target);
        }
      }
    }
  }
};

this.synth_args =
function() {
  var list = this.argList, nmap = {}, e = list.length - 1;
  while (e >= 0) {
    var arg = list[e], mname = _m(arg.name);
    arg = arg.ref.getDecl_nearest(); // must not be a dupl (TODO:should eliminate this)
    if (!HAS.call(nmap, mname)) {
      nmap[mname] = arg;
      this.synthDecl(arg);
    }
    e--;
  }
};

}]  ],
[GlobalScope.prototype, [function(){


},
function(){
/* TODO: eliminate */ this.synth_decl_find_homonym_m =
function(mname) { return this.findSynth_m(mname); };

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
[Liquid.prototype, [function(){
// TODO: liquids leave no signs in any scope the don't belong to --
//       they record it in their list of referencing scopes if they
//       contain any significant names, but they are not recorded in the lsi
//       of the scope's unresolved references; nothing looks actually wrong with this approach,
//       except that it is in total contrast to the one taken in the previous version
this.track =
function(scope) {
  if (this.rsMap === null)
    this.rsMap = {};

  var cur = scope, root = this.ref.scope ;
  this.ref.d++;
  while (true) {
    if (cur.hasSignificantNames() || cur.isAnyFn() || cur.isCatch()) {
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
        'currently fn scopes are the only scope allowed '+
       'to come in a paren');
      if (elem.parent === this)
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

this.augmentCB =
function(n, i, c) {
  if (c === null)
    return;
  var cb = n['#c'];
  if (!cb[i])
    cb[i] = c;
  else
    cb[i].mergeWith(c);
}
this.suc =
function(cb, i) {
  cb[i] = this.cc();
};

this.spc =
function(n, i) {
  var cb = CB(n);
  cmn_ac(cb, i, this.cc());
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

  var t = DT_NONE, c = false;
  switch (right.type) {
  case 'FunctionExpression':
  case 'FunctionDeclaration': // TODO: must be a default ex
    if (right.id) return null;
    t = DT_FN;
    break;
  case 'ClassExpression':
    if (right.id)
      return null;
    t = DT_CLS;
    c = true;
    break; 
  case 'ArrowFunctionExpression':
    t = DT_FN;
    break;

  default: return null
  }

  var scope = right['#scope'];
  t |= DT_INFERRED;
  var name = "";

  name = getIDName(left);
  if (name === "")
    return null;

  var scopeName = null;
  if (name !== 'default') {
    scopeName = scope.setName(name, null).t(t);
    scopeName.site = left;
    scopeName.synthName = scopeName.name;
  }

  if (c && right['#ct'] !== null) this.inferName(left, right['#ct'].value, false);

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
this.pt_override =
function(pt) {
  return this.pt !== ERR_NONE_YET &&
    (pt === ERR_NONE_YET || agtb(this.pt, pt));
};

this.at_override =
function(at) {
  return this.at !== ERR_NONE_YET &&
    (at === ERR_NONE_YET || agtb(this.at, at));
};

this.st_override =
function(st) {
  return this.st !== ERR_NONE_YET &&
    (st === ERR_NONE_YET || agtb(this.st, st));
};

this.pt_reset =
function() { this.pt = ERR_NONE_YET; };

this.at_reset =
function() { this.at = ERR_NONE_YET; };

this.st_reset =
function() { this.st = ERR_NONE_YET; };

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

this.pt_flush =
function() {
  ASSERT.call(this, this.pt === ERR_NONE_YET,
    'pending errors in pt');
  this.st = this.at = ERR_NONE_YET;
};

this.at_flush =
function() {
//ASSERT.call(this, this.at === ERR_NONE_YET,
//  'pending errors in at');
  // [a-=b,l=e]
  this.at = ERR_NONE_YET;
  this.st = this.pt = ERR_NONE_YET;
};

this.st_flush =
function() {
  this.at = this.pt = ERR_NONE_YET;
  if (this.st === ERR_NONE_YET)
    return;
  ASSERT.call(this, HAS.call(tm, this.st),
    'Unknown error value: ' + this.st);
  var st = this.st, se = this.se, so = this.so;
  this.st_reset();

  var ep = {};
  ep.tn = se;
  if (errt_pin(st)) {
    var pin = this.pin.s;
    ep.c0 = pin.c0; ep.li0 = pin.li0; ep.col0 = pin.col0;
  }

  return this.err(tm[st], ep) ;
};

this.pt_teot =
function(t,e,o) { this.pt = t; this.pe = e; this.po = o; };

this.at_teot =
function(t,e,o) { this.at = t; this.ae = e; this.ao = o; };

this.st_teot =
function(t,e,o) { this.st = t; this.se = e; this.so = o; };

this.st_adjust_for_toAssig =
function() {
  if (this.st === ERR_ARGUMENTS_OR_EVAL_ASSIGNED)
    this.st = ERR_ARGUMENTS_OR_EVAL_DEFAULT;
  else
    this.st = ERR_NONE_YET;
};

this.pin_at =
function(c0,li0,col0) { return this.pinErr(this.pin.a,c0,li0,col0); };

this.pin_ct =
function(c0,li0,col0) { return this.pinErr(this.pin.c,c0,li0,col0); };

this.pin_st =
function(c0,li0,col0) { return this.pinErr(this.pin.s,c0,li0,col0); };

this.pin_pt =
function(c0,li0,col0) { return this.pinErr(this.pin.p,c0,li0,col0); };

this.pinErr =
function(pin,c0,li0,col0) { pin.c0=c0; pin.li0=li0; pin.col0=col0; };

this.strict_esc_chk =
function() {
  if (this.ct === ERR_NONE_YET)
    return;

  ASSERT.call(this, this.ct === ERR_PIN_OCTAL_IN_STRICT,
    'currently the only error for strict_esc_chk is ERR_PIN_OCTAL_IN_STRICT');

  this.err('strict.octal');
};

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

this.rw =
function(c,li,col,luo) { this.c = c; this.li = li; this.col = col; this.luo = luo; };

},
function(){
this.handleLet =
function(letID) {
  if (this.v<=5 || !this.scope.insideStrict())
    return letID;
  this.err('let.strict');
};

},
function(){
this.loc = function() { return { line: this.li, column: this.col }; };
this.loc0 = function() { return  { line: this.li0, column: this.col0 }; };

},
function(){
this.parseExport_elemOther =
function(c0,loc0) {
  var elem = null, cb = this.cb, stmt = false;
  if (this.lttype === TK_ID) {
    this.canBeStatement = true;
    switch (this.ltval) {
    case 'class':
      this.ex = DT_ESELF;
      elem = this.parseClass(CTX_NONE);
      break;
    case 'var':
      this.ex = DT_ESELF;
      elem = this.parseVar(DT_VAR, CTX_NONE);
      break;
    case 'let':
      this.ex = DT_ESELF;
      elem = this.parseVar(DT_LET, CTX_NONE);
      break;
    case 'async':
      elem = this.id();
      this.ex = DT_ESELF;
      if (this.peekID('function')) {
        this.nl && this.err('newline.async');
        elem = this.parseAsync_fn(elem, CTX_NONE);
      }
      else
        this.err('async.lone');
      break;
    case 'function':
      this.ex = DT_ESELF;
      elem = this.parseFn(CTX_NONE, ST_DECL);
      break;
    case 'const':
      this.ex = DT_ESELF;
      elem = this.parseVar(DT_CONST, CTX_NONE);
      break;
    default:
      this.canBeStatement = false;
      elem = this.parseNonSeq(PREC_NONE, CTX_NONE);
      break;
    }
    stmt = this.foundStatement;
  }
  if (elem === null)
    this.err('export.named.no.exports');

  if (!stmt)
    this.semi(elem['#c'], 'aft') || this.err('no.semi');

  return {
    type: 'ExportNamedDeclaration',
    start: c0,
    loc: { start: loc0, end: elem.loc.end },
    end: elem.end,
    declaration: elem,
    specifiers: [],
    source: null,
    '#y': 0, '#c': cb 
  };
};

this.parseExport_elemList = 
function(c0,loc0) {
  var cb = this.cb; this.suc(cb, 'list.bef');
  this.next();
  var firstResv = null;
  var list = [];
  while (this.lttype === TK_ID) {
    var lName = this.id();
    var eName = lName;
    if (this.lttype === TK_ID) {
      this.ltval === 'as' || this.err('export.specifier.not.as');
      this.spc(lName, 'aft');
      this.next();
      if (this.lttype !== TK_ID)
        this.err('export.specifier.after.as.id');
      eName = this.id();
    }
    if (!firstResv && this.isResv(lName.name))
      firstResv = lName;

    var entry = this.scope.registerExportedEntry_oi(eName.name, eName, lName.name);

    list.push({
      type: 'ExportSpecifier',
      start: lName.start,
      loc: { start: lName.loc.start, end: eName.loc.end }, 
      end: eName.end,
      exported: eName,
      local: lName ,
      '#y': 0,
      '#entry': entry 
    });

    if (this.lttype === CH_COMMA) {
      this.spc(eName, 'aft');
      this.next();
    }
    else
      break;
  }

  var ec = this.c, eli = this.li, ecol = this.col;

  this.suc(cb, 'inner');
  this.expectT(CH_RCURLY) || this.err('export.named.list.not.finished');

  var src = null;
  if (this.peekID('from')) {
    this.cb = cb;
    src = this.parseExport_from();
  }
  else
    firstResv && this.err('export.named.has.reserved',{tn: firstResv});

  this.semi(src ? src['#c'] : cb, src ? 'aft' : 'list.aft') || this.err('no.semi');
  
  ec = this.semiC || (src && src.end) || ec;
  var eloc = this.semiLoc || (src && src.loc.end) || { line: li, column: col };

  this.foundStatement = true;

  src ?
    this.scope.regulateForwardExportList(list, src) :
    this.scope.regulateOwnExportList(list);

  return {
    type: 'ExportNamedDeclaration',
    start: c0,
    loc: { start: loc0, end: eloc },
    end: ec,
    declaration: null,
    specifiers: list,
    source: src,
    '#y': 0, '#c': cb 
  };
};

this.parseExport_elemAll =
function(c0,loc0) {
  var cb = this.cb; this.suc(cb, '*.bef');
  this.next();
  var src = null;
  src = this.parseExport_from();
  this.semi(src['#c'], 'aft') || this.err('no.semi');
  
  this.foundStatement = true;
  this.scope.registerForwardedSource(src);
  return {
    type: 'ExportAllDeclaration',
    start: c0,
    loc: { start: loc0, end: this.semiLoc || src.loc.end },
    end: this.semiC || src.end,
    source: src,
    '#y': 0, '#c': cb
  };
};

this.createDefaultLiq =
function() {
  var lg = this.scope.gocLG('default');
  var liqDefault = lg.newL();
  lg.seal();

  liqDefault.name = "_default";
  return liqDefault;
};

this.parseExport_elemDefault =
function(c0,loc0) {
  var cb = this.cb; this.suc(cb, 'default.bef' );
  var defaultID = this.id();
  var elem = null;

  var entry = this.scope.registerExportedEntry_oi('*default*', defaultID, '*default*');
  var stmt = false; 
  ASSERT.call(this, entry.target === null, 'target' );

  entry.target = {prev: null, v: null, next: null};
  
  var target = null;

  if (this.lttype !== TK_ID)
    elem = this.parseNonSeq(PREC_NONE, CTX_TOP);
  else {
    this.canBeStatement = true;
    switch (this.ltval) {
    case 'async':
      this.ex = DT_EDEFAULT;
      elem = this.id(); // 'async'
      if (this.nl) {
        this.canBeStatement = false;
        elem = this.parseAsync_exprHead(elem, CTX_TOP);
      }
      else
        elem = this.parseAsync(elem, CTX_TOP|CTX_DEFAULT) ;

      if (!this.foundStatement) {
        this.exprHead = elem;
        elem = this.parseNonSeq(PREC_NONE, CTX_TOP) ;
      }
      else { this.inferName(defaultID, elem, false); }
      break;
    case 'function':
      this.ex = DT_EDEFAULT;
      elem = this.parseFn(CTX_DEFAULT, ST_DECL);
      this.inferName(defaultID, elem, false );
      break;
    case 'class':
      this.ex = DT_EDEFAULT;
      elem = this.parseClass(CTX_DEFAULT );
      this.inferName(defaultID, elem, false);
      break;
    default:
      this.canBeStatement = false;
      elem = entry.value = this.parseNonSeq(PREC_NONE, CTX_TOP);
      break;
    }
    stmt = this.foundStatement;
  }

  // for named [fns/clses], a 'var <name> = <the default elem>' is unnecessary
  var needsTarget = true;
  switch (elem.type) {
  case 'FunctionDeclaration':
  case 'ClassDeclaration':
    if (elem.id !== null) {
      target = this.scope.findDeclOwn_m(_m(elem.id.name));
      needsTarget = false;
    }
  }

  entry.target.v = target || this.createDefaultLiq();

  if (!stmt)
    this.semi(core(elem)['#c'], 'aft') || this.err('no.semi');

  this.foundStatement = true;
  return {
    type: 'ExportDefaultDeclaration',    
    start: c0,
    loc: { start: loc0, end: this.semiLoc || elem.loc.end },
    end: this.semiC || elem.end,
    declaration: core(elem),
    '#y': 0, '#c': cb, '#binding': needsTarget ? entry.target.v : null
  };
};

this.parseExport_from =
function() {
  var cb = this.cb;
  this.peekID('from') || this.err('export.from');
  this.suc(cb, 'from.bef');
  this.next();
  this.peekStr() || this.err('export.src');

  return this.parseString(this.lttype);
};

this.parseExport =
function() {
  if (this.v<=5) this.err('ver.exim');
  this.testStmt() || this.err('not.stmt');
  this.isScript && this.err('export.not.in.module');

  var c0 = this.c0, cb = {}, loc0 = this.loc0();

  this.suc(cb, 'bef');
  this.next();

  this.cb = cb;
  return (
    this.peekMul() ?
      this.parseExport_elemAll(c0,loc0) :
    this.peekID('default') ?
      this.parseExport_elemDefault(c0,loc0) :
    this.lttype === CH_LCURLY ?
      this.parseExport_elemList(c0,loc0) :
      this.parseExport_elemOther(c0,loc0)
  );
};

this.parseExport_elemDefault_async =
function() {
  var a = this.id(); // 'async'
  if (this.nl) {
    this.canBeStatement = false;
    this.exprHead = this.parseAsync_exprHead(a);
    return this.parseNonSeq(PREC_NONE, CTX_TOP);
  }

  return this.parseAsync(a, CTX_TOP|CTX_DEFAULT);
};

},
function(){
this.getName_cls =
function(st) {
  var fl = this.scope.flags, name = null;
  this.scope.flags |= SF_STRICT;
  if (st & ST_DECL)
    name = this.parsePat();
  else {
    this.validate(this.ltval);
    if (arorev(this.ltval))
      this.arorevErr();
    name = this.id();
  }
  this.scope.flags = fl;
  return name;
};

this.getName_fn =
function(st) {
  switch (this.ltval) {
  case 'yield':
    if ((st & ST_GEN) || this.scope.insideStrict())
      this.err('fnexpr.yield');
    return this.id();

  case 'await':
    if ((st & ST_ASYNC) || this.scope.insideStrict())
      this.err('fnexpr.await');
    return this.id();
  }

  this.validate(this.ltval);
  if (this.scope.insideStrict() && arorev(this.ltval))
    this.arorevErr();

  return this.id();
};

},
function(){
this.parseImport =
function() {
  this.v<=5 && this.err('ver.exim');
  this.isScript && this.err('import.not.in.module');
  this.testStmt() || this.err('not.stmt');

  var hasTail = true, cb = {};
  var c0 = this.c0, loc0 = this.loc0(), list = [];

  this.suc(cb, 'bef');
  this.next();

  var lName = null, decl = null;

  var beforeFrom = "", beforeFromNode = null;
  if (this.lttype === TK_ID) {
    this.validate(this.ltval);
    lName = this.id();
    decl = this.scope.declareImportedName(lName, DT_IDEFAULT);
    list.push({
      type: 'ImportDefaultSpecifier',
      local: lName,
      start: lName.start,
      end: lName.end,
      loc: lName.loc,
      '#y': 0,
      '#decl': decl, '#c': {}
    });
    if (this.lttype === CH_COMMA) {
      this.spc(lName, 'aft');
      this.next();
    }
    else {
      beforeFromNode = lName;
      hasTail = false;
    }
  }

  if (hasTail) {
    this.cb = cb;
    if (this.peekMul())
      list.push(beforeFromNode = this.parseImport_namespace());
    else if (this.lttype === CH_LCURLY) {
      beforeFrom = 'list.aft';
      this.parseImport_slist(list);
    }
    else {
      if (list.length) {
        ASSERT.call(this, list.length === 1,
          'how come has more than a single specifier been parsed before the comma '+
          'was reached?!');
        this.err('import.invalid.specifier.after.comma');
      }
      hasTail = false;
    }
  }

  // test whether we need `from`
  if (list.length || hasTail /* any tail */) {
    this.peekID('from') || this.err('import.from');
    if (beforeFromNode)
      this.spc(beforeFromNode, 'aft');
    else {
      ASSERT.call(this, beforeFrom !== "", 'bef');
      this.suc(cb, beforeFrom);
    }
    this.next();
  }

  this.peekStr() || this.err('import.source.is.not.str');
  var src = this.parseString(this.lttype);

  this.semi(src['#c'], 'aft') || this.err('no.semi');

  var ec = this.semiC || src.end, eloc = this.semiLoc || src.loc.end;
  this.foundStatement = true;

  this.scope.regulateImports_sl(src, list);
  return {
    type: 'ImportDeclaration',
    start: c0,
    loc: { start: loc0, end: eloc },
    end: ec, 
    specifiers: list,
    source: src,
    '#y': 0, '#c': {}
  };
};

this.parseImport_slist =
function(list) {
  var cb = this.cb; this.suc(cb, 'list.bef');
  this.next(); // '{'
  while (this.lttype === TK_ID) {
    var eName = this.id();
    var lName = eName;
    if (this.lttype !== TK_ID)
      this.validate(lName.name);
    else {
      this.ltval === 'as' || this.err('import.specifier.no.as');
      this.spc(eName, 'aft');
      this.next();
      this.lttype === TK_ID || this.err('import.specifier.local.not.id');
      this.validate(this.ltval);
      lName = this.id();
    }
    var decl = this.scope.declareImportedName(lName, DT_IALIASED );
    list.push({
      type: 'ImportSpecifier',
      start: eName.start,
      loc: { start: eName.loc.start, end: lName.loc.end },
      end: lName.end,
      imported: eName,
      local: lName,
      '#y': 0,
      '#decl': decl, '#c': {}
    });

    this.spc(lName, 'aft');
    if (this.lttype === CH_COMMA)
      this.next();
    else
      break;
  }

  this.suc(cb, 'inner');
  this.expectT(CH_RCURLY) || this.err('import.specifier.list.unfinished');
};
      
this.parseImport_namespace =
function() {
  var c0 = this.c0, cb = this.cb, loc0 = this.loc0();

  this.suc(cb, '*.bef' );
  this.next();
  if (!this.peekID('as'))
    this.err('import.namespace.specifier.no.as');

  this.suc(cb, 'aft.*' );
  this.next();
  if (this.lttype !== TK_ID)
    this.err('import.namespace.specifier.local.not.id');

  this.validate(this.ltval);
  var lName = this.id();

  var decl = this.scope.declareImportedName(lName, DT_INAMESPACE);
  return {
    type: 'ImportNamespaceSpecifier',
    start: c0,
    loc: { start: loc0, end: lName.loc.end },
    end: lName.end,
    local: lName,
    '#y': 0,
    '#decl': decl,
    '#c': {}
  };
};

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
this.parseAsync_otherID =
function(asyncID, ctx) {
  this.cutEx();
  if (this.nl)
    return asyncID;

  this.validate(this.ltval);

  var id = this.id();
  var n = {
    type: INTERMEDIATE_ASYNC,
    id: id,
    start: asyncID.start,
    loc: asyncID.loc,
    asyncID: asyncID
  };

  this.st = ERR_INTERMEDIATE_ASYNC;
  this.se = n;

  return n;
};

this.parseAsync_exprHead =
function(asyncID, ctx) {
  if (!(ctx & CTX_PAT))
    return asyncID;

  if (this.lttype === TK_ID)
    return this.parseAsync_otherID(asyncID, ctx);

  if (this.lttype !== CH_LPAREN)
    return asyncID;

  var stmt = this.canBeStatement; // save
  if (stmt)
    this.canBeStatement = false;

  var nl = this.nl;
  this.cutEx();

  this.spc(asyncID, 'aft');
  var list = this.parseParen(CTX_PAT), n = null;

  var cb = {};
  if (list['#c'].inner)
    cb.inner = list['#c'].inner;

  n = {
    type: 'CallExpression',
    callee: asyncID,
    start: asyncID.start,
    end: list.end,
    arguments: list.expr ?
      list.expr.type === 'SequenceExpression' ?
        list.expr.expressions :
        [list.expr] :
      [],
    loc: {
      start: asyncID.loc.start,
      end: list.loc.end
    },
    '#y': this.Y(list), '#c': cb
  };

  if (nl) {
    this.pt = ERR_ASYNC_NEWLINE_BEFORE_PAREN;
    this.pe = n;
  }

  if (stmt)
    this.canBeStatement = true; // restore

  return n;
};

this.parseAsync_fn =
function(asyncID, ctx) {
  if (this.nl) 
    return asyncID;

  var asyncFn = this.parseFn(ctx, ST_ASYNC);
  asyncFn.start = asyncID.start;
  asyncFn.loc.start = asyncID.loc.start;

  asyncFn['#c']['async.bef'] = asyncID['#c'].bef;
  return asyncFn;
};

this.parseAsync =
function(asyncID, ctx) {
  if (this.peekID('function'))
    return this.parseAsync_fn(asyncID, ctx);

  this.cutEx();
  return this.parseAsync_exprHead(asyncID, ctx);
};

},
function(){
this.parseBreak =
function() {
  this.resvchk();
  this.testStmt() || this.err('not.stmt');
  this.fixupLabels(false);

  var c0 = this.c0, loc0 = this.loc0();
  var c = this.c, li = this.li, col = this.col;

  var cb = {li: li};
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
  this.semi(label ? label.cb : cb, label ? 'aft' : 'break.aft') || this.err('no.semi');

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
  this.semi(label ? label.cb : cb, label ? 'aft' : 'cont.aft') || this.err('no.semi');
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
    head = this.parseArray(ctx);
    break;

  case CH_LPAREN:
    head = this.parseParen(ctx);
    break;

  case CH_LCURLY:
    head = this.parseObj(ctx);
    break;

  case CH_MULTI_QUOTE:
  case CH_SINGLE_QUOTE:
    head = this.parseString(this.lttype);
    break;

  case TK_NUM:
    head = this.getLit_num();
    break;

  case CH_DIV:
    head = this.parseRegexLiteral();
    break;

  case CH_BACKTICK:
    head = this.parseTemplate();
    break;

  case TK_UNBIN:
    this.prec = PREC_UNARY;
    return null;

  default: return null;
  }

  return head;
};

},
function(){
this.parseFunBody =
function() {
  if (this.lttype !== CH_LCURLY)
    this.err('fun.body.not.a.curly');

  var c0 = this.c0;
  var loc0 = this.loc0();

  var cb = {}; this.suc(cb, 'bef' );
  this.next(); // '{'

  this.enterPrologue();
  var list = this.stmtList();

  this.suc(cb, 'inner');
  var n = {
    type : 'BlockStatement',
    body: list,
    start: c0,
    end: this.c,
    loc: { 
      start: loc0,
      end: this.loc() },
    '#y': this.yc, '#c': cb
  };

  if (!this.expectT(CH_RCURLY))
    this.err('fun.body.is.unfinished');

  return n;
};

},
function(){
this.parseFn =
function(ctx, st) {
  var labels_ = this.labels;
  var declMode_ = this.declMode;
  var isStmt = false;
  if (this.canBeStatement) {
    isStmt = true;
    this.canBeStatement = false;
  }

  var isMeth = st & (ST_CLSMEM|ST_OBJMEM);
  var isAsync = st & ST_ASYNC;

  var fnName = null;
  var declScope = null;

  var c0 = this.c0, cb = {}, loc0 = this.loc0();
  this.suc(cb, 'bef');

  var argploc = null;
  if (!isMeth) {
    if (isStmt && isAsync) {
      this.unsatisfiedLabel &&
      this.err('async.label.not.allowed');

      this.scope.isBare() &&
      this.err('async.decl.not.allowed');
    }
    this.next(); // 'function'
    if (this.peekMul()) {
      this.v<=5 && this.err('ver.gen');
      if (isAsync)
        this.err('async.gen.not.supported.yet');
      if (isStmt) {
        this.unsatisfiedLabel &&
        this.err('gen.label.not.allowed');

        this.scope.isBare() &&
        this.err('gen.decl.not.allowed');
      }

      this.suc(cb, 'fun.aft');
      this.next(); // '*'
      st |= ST_GEN;
    }
    if (isStmt) {
      if (this.scope.isBare()) {
        if (!this.scope.insideIf() ||
          this.scope.insideStrict())
          this.err('fun.decl.not.allowed');
        if (this.unsatisfiedLabel)
          this.fixupLabels(false);
      }
      else if (this.unsatisfiedLabel)
        this.scope.insideStrict() &&
        this.err('func.label.not.allowed');

      st |= ST_DECL;
      if (this.lttype === TK_ID) {
        this.declMode = DT_FN|this.cutEx();
        declScope = this.scope; 
        fnName = this.parsePat();
      }
      else if (!(ctx & CTX_DEFAULT))
        this.err('fun.decl.has.got.no.actual.name');
    }
    else {
      st |= ST_EXPR ;
      if (this.lttype === TK_ID)
        fnName = this.getName_fn(st);
    }
  }

  this.enterScope(this.scope.spawnFn(st));
  if (fnName) {
    if (isStmt)
      this.scope.setName(
        fnName.name,
        declScope.findDeclOwn_m(_m(fnName.name))
      ).t(DT_FNNAME).s(fnName);
    else
      this.scope.setName(fnName.name, null).t(DT_FNNAME).s(fnName);
  }

  var argLen =
    !isMeth || !(st & ST_ACCESSOR) ?
      ARGLEN_ANY :
      (st & ST_GETTER) ?
        ARGLEN_GET :
        ARGLEN_SET;

  this.declMode = DT_FNARG;

  this.suc(cb, 'list.bef' );
  var argList = this.parseParams(argLen);
  argploc = this.argploc; this.argploc = null;
  cb.inner = this.cb;

  this.scope.activateBody();

  this.labels = {};

  var nbody = this.parseFunBody();
  var scope = this.exitScope();

  var n = {
    type: isStmt ? 'FunctionDeclaration' : 'FunctionExpression',
    id: fnName,
    start: c0,
    end: nbody.end,
    generator: (st & ST_GEN) !== 0,
    body: nbody,
    loc: { start: loc0, end: nbody.loc.end },
    params: argList,
    expression: false,
    async: (st & ST_ASYNC) !== 0,
    '#scope': scope, '#y': 0, '#c': cb , 
    '#argploc': argploc
  };

  this.declMode = declMode_;
  this.labels = labels_;

  if (isStmt)
    this.foundStatement = true;

  return n;
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
      return this.parseNew();

    case 'for': return this.parseFor();
    case 'try': return this.parseTryStatement();
    case 'let':
      return this.parseVar(DT_LET,ctx);
    case 'var':
      this.resvchk();
      return this.parseVar(DT_VAR,ctx);

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
    case 'const':
      this.resvchk();
      return this.parseVar(DT_CONST,CTX_NONE);
    case 'throw': return this.parseThrow();
    case 'while': return this.parseWhile();
    case 'yield': 
      if (this.scope.canYield()) {
        this.resvchk();
        if (this.scope.insideArgs())
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
        if (this.scope.insideArgs())
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

    case 'async': return this.parseAsync(this.id(), ctx);

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
      return this.parseFn(ctx&CTX_FOR, ST_NONE);
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
  if (this.ct !== ERR_NONE_YET) {
    ASSERT.call(this.ct === ERR_PIN_UNICODE_IN_RESV,
      'the error in this.ct is something other than ERR_PIN_UNICODE_IN_RESV: ' + this.ct);
    this.err('resv.unicode');
  }
};


},
function(){
this.parseParams =
function(argLen) {
  var
    c0 = -1, li0 = -1, col0 = -1,
    tail = true, elem = null,
    list = [],
    gnsa = false;

  var argploc = this.loc0();
  if (!this.expectT(CH_LPAREN))
    this.err('fun.args.no.opening.paren');

  while (list.length !== argLen) {
    elem = this.parsePat();
    if (elem) {
      if (this.peekEq()) {
        this.scope.enterUniqueArgs();
        elem = this.parsePat_assig(elem);
      }
      if (!gnsa && elem.type !== 'Identifier') {
        gnsa = true;
        this.scope.firstNonSimple = elem;
      }
      list.push(elem);
    }
    else {
      if (list.length !== 0) // trailing comma
        this.v<7 &&
        this.err('arg.non.tail.in.fun',
          {c0:c0,li0:li0,col0:col0}); // what about when v < 7 and having (a, ...b)?

      break;
    }

    if (this.lttype === CH_COMMA) {
      c0 = this.c0;
      li0 = this.li0;
      col0 = this.col0;
      this.spc(elem, 'aft');
      this.next();
    }
    else { tail = false; break; }
  }

  if (argLen === ARGLEN_ANY) {
    if (tail && this.lttype === TK_ELLIPSIS) {
      this.scope.enterUniqueArgs();
      elem = this.parsePat_rest();
      list.push(elem);
      if (!gnsa) {
        gnsa = true;
        this.scope.firstNonSimple = elem;
      }
    }
  }
  else if (list.length !== argLen)
    this.err('fun.args.not.enough');

  if (elem) {
    this.spc(elem, 'aft');
    this.cb = null;
  } else
    this.cb = this.cc();
  
  if (!this.expectT(CH_RPAREN))
    this.err('fun.args.no.end.paren');

  this.argploc = argploc;

  return list;
};

},
function(){
this.getLit_true = function() {
  this.resvchk();
  var cb = {}; this.suc(cb, 'bef' );
  var n = {
    type: 'Literal', value: true,
    start: this.c0, end: this.c,
    loc: { start: this.loc0(), end: this.loc() },
    raw: this.ltraw, '#c': cb
  };
  this.next();
  return n;
};

this.getLit_false = function() {
  this.resvchk();
  var cb = {}; this.suc(cb, 'bef');
  var n = {
    type: 'Literal', value: false,
    start: this.c0, end: this.c,
    loc: { start: this.loc0(), end: this.loc() },
    raw: this.ltraw, '#c': cb
  };
  this.next();
  return n;
};

this.getLit_null = function() {
  this.resvchk();
  var cb = {}; this.suc(cb, 'bef');
  var n = {
    type: 'Literal', value: null,
    start: this.c0, end: this.c,
    loc: { start: this.loc0(), end: this.loc() },
    raw: this.ltraw, '#c': cb
  };
  this.next();
  return n;
};

this.getLit_num = function () {
  var cb = {}; this.suc(cb, 'bef' );
  var n = {
    type: 'Literal', value: this.ltval,
    start: this.c0, end: this.c,
    loc: { start: this.loc0(), end: this.loc() },
    raw: this.ltraw, '#c': cb
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

  var c0 = -1, loc0 = null;

  var lpm = ""; // latest pending modifier, that is.

  var cb = {};

  MM:
  while (this.lttype === TK_ID) {
    if (latestMod) {
      cb[latestMod.name+'.bef'] = latestMod['#c'].bef;
      latestMod = this.id();
    }
    else {
      latestMod = this.id();
      c0 = latestMod.start, loc0 = latestMod.loc.start;
    }
    switch (latestMod.name) {
    case 'static':
      st |= mpending;
      if (!(st & ST_CLSMEM)) { nonMod = latestMod; break MM; }
      if (st & ST_STATICMEM) { nonMod = latestMod; break MM; }
      if (st & ST_ASYNC) { nonMod = latestMod; break MM; }
      mpending = ST_STATICMEM;

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
      mpending = ST_NONE;

      break MM;
    }
  }

  if (this.peekMul()) {
    this.v<=5 && this.err('ver.mem.gen');
    if (nonMod) this.err('gen.has.non.modifier');
    st |= mpending;
    if (st & ST_ASYNC)
      this.ga();
    st |= ST_GEN
    if (latestMod) {
      cb[latestMod.name+'.bef'] = latestMod['#c'].bef;
      latestMod = null;
    }
    else { c0 = this.c0, loc0 = this.loc0(); }
    mpending = ST_NONE;
    cb['*.bef'] = this.cc();
    this.next();
  }

  var memName = null, nameVal = "";
  if (mpending === ST_NONE && latestMod) { // if the most recent token is a "real" (i.e., non-get/set) non-modifier ID
    memName = latestMod;
    nameVal = memName.name;
  }
  else {
    switch (this.lttype) {
    case TK_ID:
      // if the current token is an id, either the most recent token is a '*' (in which case latestMod is null),
      // or the current token is the first one we have reached since entering parseMem (in which case latestMod is, once again, null).
      // if mpending is not ST_NONE, we will not have reached the else we are in now; the test below, then, is there for mere safety, as to err is human
      if (latestMod !== null)
        this.err('pending.id');

      st |= mpending;
      nameVal = this.ltval;
      memName = this.mem_id();
      break;

    case CH_LSQBRACKET:
      if (latestMod)
        cb[latestMod.name+'.bef'] = latestMod['#c'].bef;
      st |= mpending;
      memName = this.mem_expr();
      break;

    case TK_NUM:
      if (latestMod)
        cb[latestMod.name+'.bef'] = latestMod['#c'].bef;
      st |= mpending;
      memName = this.getLit_num();
      break;

    case CH_MULTI_QUOTE:
    case CH_SINGLE_QUOTE:
      if (latestMod)
        cb[latestMod.name+'.bef'] = latestMod['#c'].bef;
      st |= mpending;
      memName = this.parseString(this.lttype);
      nameVal = memName.value;
      break;

    default:
      if (latestMod) {
        memName = latestMod;
        // unnecessary because it is either static, async, set, or get
        nameVal = memName.name;
      }
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

  
  this.cb = cb;
  if (this.lttype === CH_LPAREN) {
    if (this.v <= 5) this.err('ver.mem.meth');
    var mem = this.parseMeth(memName, ctx, st);
    if (c0 !== -1 && c0 !== mem.start) {
      mem.start = c0;
      mem.loc.start = loc0;
    }
    return mem;
  }

  if (st & (ST_STATICMEM|ST_GEN|ST_CLSMEM|ST_ASYNC|ST_ACCESSOR))
    this.err('meth.paren');

  return this.parseNonMethObjMem(memName, ctx);
};

this.parseNonMethObjMem =
function(memName, ctx) {
  var hasProto = ctx & CTX_HASPROTO, firstProto = this.first__proto__;
  var cb = this.cb, val = null;
  ctx &= ~CTX_HASPROTO; // unnecessary (?)

  switch (this.lttype) {
  case CH_COLON:
    if (hasProto && firstProto)
      this.err('obj.proto.has.dup',{tn:memName});

    this.spc(core(memName), 'aft');
    this.next();
    val = this.parseNonSeq(PREC_NONE, ctx);
    if (errt_track(ctx) && val.type === PAREN_NODE) {
      // if there is no error after the parseNonSeq above
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

    var computed = memName.type === PAREN ;
    this.inferName(core(memName), core(val), computed );

    val = {
      type: 'Property',
      start: memName.start,
      key: core(memName),
      end: val.end,
      kind: 'init',
      loc: { start: memName.loc.start, end: val.loc.end },
      computed: computed,
      method: false,
      shorthand: false,
      value: core(val),
      '#y': computed ? this.Y(core(memName)) : 0, '#c': cb
    };

    if (hasProto)
      this.first__proto__ = val;

    return val;

  case TK_SIMP_ASSIG:
    if (this.v <= 5)
      this.err('mem.short.assig');
    if (memName.type !== 'Identifier')
      this.err('obj.prop.assig.not.id',{tn:memName});
    if (this.ltraw !== '=')
      this.err('obj.prop.assig.not.assig');
    if (errt_noLeak(ctx)) // if the owner is not leaky
      this.err('obj.prop.assig.not.allowed');

    this.validate(memName.name);
    memName['#ref'] = this.scope.refDirect_m(_m(memName.name), null);
    val = this.parseAssignment(memName, ctx);
    if (errt_strack(ctx) && this.st === ERR_NONE_YET) {
      this.st = ERR_SHORTHAND_UNASSIGNED;
      this.se = val;
    }

    break;

  default:
    if (this.v <= 5)
      this.err('mem.short');
    if (memName.type !== 'Identifier')
      this.err('obj.prop.assig.not.id',{tn:memName});
    this.validate(memName.name);
    memName['#ref'] = this.scope.refDirect_m(_m(memName.name), null);
    val = memName;
    if (!HAS.call(cb, 'bef') || cb.bef === null)
      cb.bef = new Comments();
    var cbn = CB(memName);
    if (HAS.call(cbn, 'bef') && cbn.bef) {
      cb.bef.mergeWith(cbn.bef);
      cbn.bef = null;
    }
    break;
  }

  return {
    type: 'Property',
    key: memName,
    start: val.start,
    end: val.end,
    loc: val.loc,
    kind: 'init',
    shorthand: true,
    method: false,
    value: val,
    computed: false,
    '#y': 0, '#c': cb
  };
};

},
function(){
this.parseMeth =
function(memName, ctx, st) {
  if (this.lttype !== CH_LPAREN)
    this.err('meth.paren');

  var val = null, computed = memName.type === PAREN, name = "";
  var cb = this.cb;

  if (st & ST_CLSMEM) {
    if (st & ST_STATICMEM) {
      if (ctx & CTX_HASPROTOTYPE)
        this.err('cls.prototype.is.static.mem',
          {tn:memName});
      if (st & ST_CTOR)
        st &= ~ST_CTOR;
    }
    if (st & ST_CTOR) {
      if (st !== (ST_CTOR|ST_CLSMEM))
        this.err('class.ctor.is.special.mem',
          {tn:memName});
      if (ctx & CTX_CTOR_NOT_ALLOWED)
        this.err('class.ctor.is.dup',{tn:memName});
    }

    this.spc(core(memName), 'aft');
    val = this.parseFn(CTX_NONE, st);

    (st & ST_CTOR) || this.inferName(core(memName), val, computed);

    return {
      type: 'MethodDefinition',
      key: core(memName),
      start: memName.start,
      end: val.end,
      kind:
        (st & ST_CTOR) ?
          'constructor' :
          (st & ST_GETTER) ?
            'get' :
            (st & ST_SETTER) ?
              'set' :
              'method',
      computed: computed,
      loc: {
        start: memName.loc.start,
        end: val.loc.end
      },
      value: val,
      'static': !!(st & ST_STATICMEM),
      '#y': computed ? this.Y(memName) : 0, '#c': cb
    };
  }

  this.spc(core(memName), 'aft');
  val = this.parseFn(CTX_NONE, st);

  this.inferName(core(memName), val, computed);
  return {
    type: 'Property',
    key: core(memName),
    start: memName.start,
    end: val.end,
    kind:
      !(st & ST_ACCESSOR) ?
        'init' :
        (st & ST_SETTER) ?
          'set' :
          'get',
    computed: memName.type === PAREN,
    loc: {
      start: memName.loc.start,
      end : val.loc.end
    },
    method: !(st & ST_ACCESSOR),
    shorthand: false,
    value: val,
    '#y': computed ? this.Y(memName) : 0, '#c': cb
  };
};

},
function(){
this.parseNew =
function() {
  this.resvchk();
  var c0 = this.c0, loc0 = this.loc0();
  var c = this.c, li = this.li, col = this.col;

  var cb = {}; this.suc(cb, 'bef');
  this.next(); // 'new'
  if (this.lttype === CH_SINGLEDOT) {
    this.suc(cb, 'new.aft');
    this.cb = cb;
    this.next();
    return this.parseMeta(c0,loc0,c,li,col);
  }

  var head = this.parseExprHead(CTX_NONE);
  if (head === null)
    this.err('new.head.is.not.valid');

  if (head.type === 'Identifier')
    head['#ref'] = this.scope.refDirect_m(_m(head.name), null);

  var inner = core(head), elem = null;
  var argloc = null;

  LOOP:
  while (true)
  switch (this.lttype) {
  case CH_SINGLEDOT:
    this.spc(inner, 'aft');
    argloc = this.loc0();
    this.next();
    if (this.lttype !== TK_ID)
      this.err('mem.name.not.id');
    elem = this.mem_id();
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
      '#y': this.Y(head), '#acloc': argloc, '#c': {}
    };
    continue;

  case CH_LSQBRACKET:
    this.spc(inner, 'aft');
    argloc = this.loc0();
    this.next();
    elem = this.parseExpr(PREC_NONE, CTX_NONE);
    head = inner = {
      type: 'MemberExpression',
      property: core(elem),
      start: head.start,
      end: this.c,
      object: inner,
      loc: {
        start: head.loc.start,
        end: this.loc() },
      computed: true,
      '#y': this.Y(head)+this.Y(elem), '#acloc': argloc, '#c': {}
    };
    this.spc(core(elem), 'aft');
    if (!this.expectT(CH_RSQBRACKET))
      this.err('mem.unfinished');
    continue;

  case CH_LPAREN:
    this.spc(inner, 'aft');
    elem = this.parseArgList();
    this.suc(cb, 'inner');
    head = inner = {
      type: 'NewExpression',
      callee: inner,
      start: c0,
      end: this.c,
      arguments: elem,
      loc: {
        start: loc0,
        end: this.loc() },
      '#y': this.Y(head)+this.y, '#c': cb,
    };
    if (!this.expectT(CH_RPAREN))
      this.err('new.args.is.unfinished');
    break LOOP;

  case CH_BACKTICK:
    this.spc(inner, 'aft');
    elem = this.parseTemplate();
    head = inner = {
      type: 'TaggedTemplateExpression',
      quasi: elem,
      start: head.start,
      end: elem.end,
      loc: {
        start: head.loc.start,
        end: elem.loc.end },
      tag: inner,
      '#c': {}, '#y': this.Y(head)+this.Y(elem)
    };
    continue;

  default:
    head = {
      type: 'NewExpression',
      callee: inner,
      start: c0,
      end: head.end,
      loc: {
        start: loc0,
        end: head.loc.end },
      arguments : [],
      '#y': this.Y(head), '#c': cb
    };
    break LOOP;
  }

  return head;
};

},
function(){
this.parseNonSeq =
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
    head = this.parseUnary(ctx);
    break;

  case TK_AA_MM:
    head = this.parseUpdate(null, ctx);
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
  if (this.lttype & TK_ANY_ASSIG) {
    if (prec !== PREC_NONE)
      this.err('assig.not.first');
    return this.parseAssignment(head, ctx);
  }

  if (errt_pat(ctx)) {
    // alternatively, head.type === NPAREN
    if (this.parenScope) {
      this.st_flush();
      this.dissolveParen();
    }
    else if (hasOp || errt_noLeak(ctx))
      this.st_flush();
  }

  while (hasOp) {
    if (this.lttype === TK_AA_MM) {
      if (!this.nl) {
        head = this.parseUpdate(head, ctx);
        hasOp = this.getOp(ctx);
        continue;
      }
      else break;
    }

    if (this.lttype === CH_QUESTION) {
      if (prec === PREC_NONE)
        head = this.parseCond(head, ctx);
      break;
    }

    var curPrec = this.prec;
    if (prec === PREC_UNARY && curPrec === PREC_EX)
      this.err('unary.before.an.exponentiation');
    if (curPrec < prec)
      break;
    if (curPrec === prec && !isRA(prec))
      break;

    this.spc(core(head), 'aft');
    var o = this.ltraw, oploc = o === '+' ? this.loc0() : null;
    this.next();
    var r = this.parseNonSeq(curPrec, ctx & CTX_FOR);
    head = {
      type: isLog(curPrec) ? 'LogicalExpression' : 'BinaryExpression',
      operator: o,
      start: head.start,
      end: r.end,
      loc: {
        start: head.loc.start,
        end: r.loc.end },
      left: core(head),
      right: core(r), '#o': oploc,
      '#y': this.Y(head, r), '#c': {}
    };

    hasOp = this.getOp(ctx);
  }

  return head;
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
      this.semi(core(head)['#c'], 'aft') || this.err('no.semi');
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
this.parseTail =
function(head) {
  if (head.type === 'Identifier')
    head['#ref'] = this.scope.refDirect_m(_m(head.name), null);

  switch (this.lttype) {
  case CH_SINGLEDOT:
  case CH_LSQBRACKET:
  case CH_LPAREN:
  case CH_BACKTICK:
    this.st_flush();
  }

  var argloc = null, cb = null;
  var inner = core(head), elem = null;

  LOOP:
  while (true) {
    switch (this.lttype) {
    case CH_SINGLEDOT:
      this.spc(inner, 'aft');
      argloc = this.loc0();
      this.next();
      if (this.lttype !== TK_ID)
        this.err('mem.name.not.id');
      elem = this.mem_id();
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
        '#y': this.Y(head), '#acloc': argloc, '#c': {}
      };
      continue;

    case CH_LSQBRACKET:
      this.spc(inner, 'aft');
      argloc = this.loc0();
      this.next();
      elem = this.parseExpr(PREC_NONE, CTX_NONE);
      head = inner = {
        type: 'MemberExpression',
        property: core(elem),
        start: head.start,
        end: this.c,
        object: inner,
        loc: {
          start: head.loc.start,
          end: this.loc() },
        computed: true,
        '#y': this.Y(head)+this.Y(elem), '#acloc': argloc, '#c': {}
      };
      this.spc(core(elem), 'aft');
      if (!this.expectT(CH_RSQBRACKET))
        this.err('mem.unfinished');
      continue;

    case CH_LPAREN:
      this.spc(inner, 'aft');
      elem = this.parseArgList();
      argloc = this.argploc; this.argploc = null;
      cb = {};
      this.suc(cb, 'inner'); // a(/* inner */); b(e, /* inner */)
      head = inner = {
        type: 'CallExpression',
        callee: inner,
        start: head.start,
        end: this.c,
        arguments: elem,
        loc: {
          start: head.loc.start,
          end: this.loc() },
        '#y': this.Y(head)+this.y, '#argloc': argloc, '#c': cb
      };
      if (!this.expectT(CH_RPAREN))
        this.err('call.args.is.unfinished');
      continue;

    case CH_BACKTICK:
      this.spc(inner, 'aft');
      elem = this.parseTemplate();
      head = inner = {
        type: 'TaggedTemplateExpression',
        quasi: elem,
        start: head.start,
        end: elem.end,
        loc: {
          start: head.loc.start,
          end: elem.loc.end },
        tag: inner,
        '#c': {}, '#y': this.Y(head)+this.Y(elem)
      };
      continue;

    default: break LOOP;
    }
  }

  return head;
};

},
function(){
this.parseTemplate =
function() {
  this.v<=5 && this.err('ver.temp');

  // c is on the char after `
  var c0 = this.c0, loc0 = this.loc0();
  var c = this.c, li = this.li, col = this.col;
  var str = [], ex = [];
  var v = "";
  var luo = c;

  var s = this.src, l = s.length;

  var c0s = c, loc0s = this.loc();

  var iscr = false;
  var y = 0;

  var cb = {}; this.suc(cb, 'bef');
  LOOP:
  while (c<l)
  switch (s.charCodeAt(c)) {
  case CH_$:
    if (c+1<l &&
      s.charCodeAt(c+1) === CH_LCURLY) {
      if (luo<c)
        v += s.substring(luo,c);

      this.setsimpoff(c+2);
      str.push({
        type: 'TemplateElement', 
        start: c0s,
        loc: { 
          start: loc0s, 
          end: {
            line: this.li, 
            column: this.col-2 
          }
        },        
        end: c,
        value: {
          raw: s.slice(c0s, c).replace(/\r\n|\r/g,'\n'), 
          cooked: v
        }, 
        tail: false,
      });

      this.next(); // prepare the next token
      var e = this.parseExpr(CTX_TOP);
      if (e === null)
        this.err('templ.expr.is.a.null');
      ex.push(core(e));
      y += this.Y(e);
      if (this.lttype !== CH_RCURLY)
        this.err('templ.expr.is.unfinished');

      this.spc(core(e), 'aft');
      c = luo = this.c;
      v = "";
      c0s = c;
      loc0s = this.loc();
    }
    else
      c++;
 
    continue;

  case CH_CARRIAGE_RETURN:
    iscr = true;
  case CH_LINE_FEED:
  case 0x2028: case 0x02029:
    if (luo<c)
      v += s.substring(luo,c);
    if (iscr) {
      if (c+1<l && s.charCodeAt(c+1) === CH_LINE_FEED)
        c++;
      iscr = false;
    }
    v += s.charAt(c);
    c++;
    this.setzoff(c);
    luo = c;
    continue;

  case CH_BACK_SLASH:
    if (luo<c) v += s.substring(luo,c);

    this.setsimpoff(c);
    v += this.readEsc(true);
    c = luo = this.c;
    continue;

  case CH_BACKTICK:
    break LOOP;

  default: c++;
  }

  if (c >= l || s.charCodeAt(c) !== CH_BACKTICK)
    this.err('template.literal.is.unfinished');

  if (luo<c)
    v += s.substring(luo,c);

  c++;
  this.setsimpoff(c); // '`'
  str.push({
    type: 'TemplateElement',
    start: c0s,
    loc: {
      start: loc0s,
      end: {
        line: this.li,
        column: this.col-1
      }
    },
    end: c-1,
    value: {
      raw: s.slice(c0s,c-1).replace(/\r\n|\r/g,'\n'), 
      cooked: v 
    },
    tail: true
  });

  var n = {
    type: 'TemplateLiteral',
    start: c0,
    quasis: str,
    end: c,
    expressions: ex,
    loc: { start: loc0, end : this.loc() },
    '#y': y, '#c': cb
  };

  this.next();

  return n;
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
this.parseVar =
function(dt, ctx) {
  if (!this.testStmt()) {
    if (dt === DT_LET)
      return this.handleLet(this.id());
    this.err('not.stmt');
  }

  var kind = this.ltval;
  var letID = dt === DT_LET ? this.id() : null;
  var c0 = letID ? letID.start : this.c0;
  var loc0 = letID ? letID.loc.start : this.loc0();
  var vpat = null;

  var y = 0;

  var cb = null;
  if (letID) 
    cb = letID['#c'];
  else { 
    cb = {}; this.suc(cb, 'bef');
    this.next();
  }

  ctx &= CTX_FOR;

  if (!letID || !ctx || !this.peekID('in')) {
    this.setPatCheck(dt !== DT_VAR);
    this.declMode = dt|this.cutEx();
    vpat = this.parsePat();

    if (vpat === null)
    switch (this.vpatErr) {
    case PE_NO_NONVAR:
      this.err('lexical.decl.not.in.block',
        {c0:c0,loc0:loc0,extra:kind});
      break;

    case PE_NO_LABEL:
      this.err('decl.label',{c0:c0,loc0:loc0});
      break;
    }
  }

  if (vpat === null) {
    if (letID) {
      this.canBeStatement = true; // restore it to the value it had when parseVar was initially called
      return this.handleLet(letID);
    }
    this.err('var.has.no.declarators');
  }

  // this.unsatisfiedLabel is intact -- there has been no parsing, only lexing actually
  this.fixupLabels(false);

  var isConst = dt === DT_CONST, mi = false;

  var list = [], last = null;
  while (true) {
    var init = null;
    if (this.peekEq()) {
      this.spc(vpat, 'aft');
      this.next();
      init = this.parseNonSeq(PREC_NONE, ctx|CTX_TOP);
    }
    else if (isConst || vpat.type !== 'Identifier') {
      !(ctx & CTX_FOR) && this.err('const.has.no.init');
      list.length && this.err('missing.init');
      mi = true;
    }
    var ioh = init || vpat;

    var y0 = this.Y(vpat)+(init ? this.Y(init) : 0);
    y += y0;

    init && this.inferName(vpat, core(init), false);
    list.push(last = {
      type: 'VariableDeclarator',
      id: vpat,
      start: vpat.start,
      end: ioh.end,
      loc: {
        start: vpat.loc.start,
        end: ioh.loc.end 
      },
      init: init && core(init),
      '#y': y0, '#c': {}
    });

    if (mi || this.lttype !== CH_COMMA)
      break;

    this.spc(last, 'aft');
    this.next();

    vpat = this.parsePat();
    vpat || this.err('var.has.an.empty.decltor');
  }

  var lastItem = list[list.length-1];
  var ec = -1, eloc = null;

  if (!(ctx & CTX_FOR)) {
    this.semi(last['#c'], 'aft') || this.err('no.semi');
    ec = this.semiC || lastItem.end;
    eloc = this.semiLoc || lastItem.loc.end;
  } else {
    ec = lastItem.end;
    eloc = lastItem.loc.end;
  }

  this.missingInit = mi;

  this.foundStatement = true;
  return {
    type: 'VariableDeclaration',
    kind: kind,
    start: c0,
    declarations: list,
    end: ec,
    loc: { start: loc0, end: eloc },
    '#c': cb,
    '#y': y,
  };
};

},
function(){
this.semi =
function(cb, i) {
  var t = this.lttype;
  if (t === CH_SEMI) {
    cb && this.suc(cb, i);
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
    cb && this.suc(cb, i);
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
this.parseUpdate = function(arg, ctx) {
  var c = 0, loc = null, u = this.ltraw;
  if (arg === null) {
    c = this.c0;
    loc = this.loc0();
    var uc = {}; this.suc(uc, 'bef');
    this.next() ;
    arg = this.parseExprHead(ctx & CTX_FOR);
    if (arg === null)
      this.err('unexpected.lookahead');

    arg = this.parseTail(arg);
    if (!this.ensureSAT(core(arg)))
      this.err('incdec.pre.not.simple.assig',{tn:core(arg)});

    return {
      type: 'UpdateExpression', operator: u,
      start: c, end: arg.end, argument: core(arg),
      loc: { start: loc, end: arg.loc.end }, '#c': uc,
      prefix: true, '#y': this.Y(arg)
    };
  }

  this.spc(core(arg), 'aft');
  if (!this.ensureSAT(core(arg)))
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
    argument: core(arg), loc: loc, '#c': {},
    prefix: false, '#y': this.Y(arg)
  };
};

},
function(){
this.parseArgList = function () {
  var c0 = -1, li0 = -1, col0 = -1, parenAsync = this.parenAsync,
      elem = null, list = [];

  var y = 0;

  var argloc = this.loc0();
  do { 
    this.next();
    elem = this.parseNonSeq(PREC_NONE, CTX_NULLABLE|CTX_TOP); 
    if (elem)
      list.push(core(elem));
    else if (this.lttype === TK_ELLIPSIS)
      list.push(elem = this.parseSpread(CTX_NONE));
    else {
      if (list.length !== 0) {
        if (this.v < 7)
          this.err('arg.non.tail',
            {c0:c0, li0:li0, col0:col0,
            extra: {list: list, async: parenAsync}});
      }
      break;
    }

    y += this.Y(elem);
    this.spc(core(elem), 'aft');

    if (this.lttype === CH_COMMA) {
      c0 = this.c0;
      li0 = this.li0;
      col0 = this.col0;
    }
    else break;
  } while (true);

  if (parenAsync !== null)
    this.parenAsync = parenAsync;

  this.yc= y;
  this.argploc = argloc;

  return list ;
};

},
function(){
this.parseArray = 
function(ctx) {
  var c0 = this.c0, cb = {}, loc0 = this.loc0();

  this.suc(cb, 'bef');
  this.next(); // '['

  var elem = null, list = [];
  var elctx = errt_elem_ctx_of(ctx);

  elctx |= CTX_NULLABLE;

  var pt = ERR_NONE_YET, pe = null, po = null;
  var at = ERR_NONE_YET, ae = null, ao = null;
  var st = ERR_NONE_YET, se = null, so = null;

  var pc0 = -1, pli0 = -1, pcol0 = -1;
  var ac0 = -1, ali0 = -1, acol0 = -1;
  var sc0 = -1, sli0 = -1, scol0 = -1;

  if (errt_track(ctx)) {
    errt_ptrack(ctx) && this.pt_reset();
    errt_atrack(ctx) && this.at_reset();
    errt_strack(ctx) && this.st_reset();
  }

  var hasMore = true;
  var hasRest = false, hasNonTailRest = false;

  var y = 0, si = -1;

  cb.holes = [];
  cb.h = 0;
  while (hasMore) {
    elem = this.parseNonSeq(PREC_NONE, elctx);
    if (elem === null && this.lttype === TK_ELLIPSIS) {
      elem = this.parseSpread(elctx);
      si = list.length;
      hasRest = true;
    }
    if (this.lttype === CH_COMMA) {
      if (hasRest)
        hasNonTailRest = true; 
      if (elem === null) {
        if (this.v <= 5) this.err('ver.elision');
        this.commentBuf && cb.holes.push([list.length, this.cc()]);
        list.push(null);
      }
      else {
        list.push(core(elem));
        this.spc(core(elem), 'aft');
      }
      this.next();
    }
    else {
      if (elem) {
        list.push(core(elem));
        hasMore = false;
      }
      else break;
    }
 
    if (elem)
       y += this.Y(elem);

    if (elem && errt_track(elctx)) {
      var elemCore = elem;
      // TODO: [...(a),] = 12
      var t = ERR_NONE_YET;
      if (elemCore.type === PAREN_NODE)
        t = ERR_PAREN_UNBINDABLE;
      else if (hasNonTailRest)
        t = ERR_NON_TAIL_REST;

      if (errt_ptrack(ctx)) {
        if (this.pt === ERR_NONE_YET && t !== ERR_NONE_YET) {
          this.pt = t; this.pe = elemCore;
        }
        if (this.pt_override(pt)) {
          pt = this.pt; pe = this.pe; po = core(elem);
          if (errt_psyn(pt))
            elctx |= CTX_HAS_A_PARAM_ERR;
          if (errt_pin(pt)) 
            pc0 = this.pin.p.c0, pli0 = this.pin.p.li0, pcol0 = this.pin.p.col0;
        }
      }

      // ([a]) = 12
      if (t === ERR_PAREN_UNBINDABLE && this.ensureSAT(elem.expr))
        t = ERR_NONE_YET;

      if (errt_atrack(ctx)) {
        if (this.at === ERR_NONE_YET && t !== ERR_NONE_YET) {
          this.at = t; this.ae = elemCore;
        }
        if (this.at_override(at)) {
          at = this.at; ae = this.ae; ao = core(elem);
          if (errt_asyn(at))
            elctx |= CTX_HAS_AN_ASSIG_ERR;
          if (errt_pin(at))
            ac0 = this.pin.a.c0, ali0 = this.pin.a.li0, acol0 = this.pin.a.col0;
        }
      }
      if (errt_strack(ctx)) {
        if (this.st_override(st)) {
          st = this.st; se = this.se; so = core(elem);
          if (errt_ssyn(st))
            elctx |= CTX_HAS_A_SIMPLE_ERR;
          if (errt_pin(st))
            sc0 = this.pin.s.c0, sli0 = this.pin.s.li0, scol0 = this.pin.s.col0;
        }
      }
    }

    hasRest = hasNonTailRest = false;
  }
  
  var n = {
    type: 'ArrayExpression',
    loc: { start: loc0, end: this.loc() },
    start: c0,
    end: this.c,
    elements : list,
    '#y': -1, '#si': si, '#c': cb
  };

  if (errt_perr(ctx,pt)) {
    this.pt_teot(pt,pe,po);
    errt_pin(pt) && this.pin_pt(pc0,pli0,pcol0);
  }
  if (errt_aerr(ctx,at)) {
    this.at_teot(at,ae,ao);
    errt_pin(at) && this.pin_at(ac0,ali0,acol0);
  }
  if (errt_serr(ctx,st)) {
    this.st_teot(st,se,so);
    errt_pin(st) && this.pin_st(sc0,sli0,scol0);
  }

  elem ? this.spc(core(elem), 'aft') : this.suc(cb, 'inner');
  if (!this.expectT(CH_RSQBRACKET))
    this.err('array.unfinished');
  
  return n;
};

},
function(){
this.parseArrow = function(arg, ctx)   {
  if (this.v <= 5)
    this.err('ver.arrow');
  var async = false;

  var cb = {};
  if (this.pt === ERR_ASYNC_NEWLINE_BEFORE_PAREN) {
    ASSERT.call(this, arg === this.pe,
      'how can an error core not be equal to the erroneous argument?!');
    this.err('arrow.newline.before.paren.async');
  }

  var sc = ST_ARROW;
  var loc = null;

  switch ( arg.type ) {
  case 'Identifier':
    this.scope.findRefAny_m(_m(arg.name)).d--;
    this.enterScope(this.scope.spawnFn(sc));
    this.scope.refDirect_m(_m(arg.name), null);
    this.asArrowFuncArg(arg);
    this.spc(arg, 'aft');
    loc = arg.loc.start;
    break;

  case PAREN_NODE:
    this.enterScope(this.scope.spawnFn(sc));
    this.parenScope.makeParams(this.scope);
    this.parenScope = null;
    if (arg.expr) {
      if (arg.expr.type === 'SequenceExpression')
        this.asArrowFuncArgList(arg.expr.expressions);
      else
        this.asArrowFuncArg(arg.expr);
    }
    cb.bef = cmn(arg['#c'], 'bef' );
    cb.inner = cmn(arg['#c'], 'inner');
    this.suc(cb, 'list.bef' );
    loc = arg.loc.start;
    break;

  case 'CallExpression':
    if (this.v >= 7 && arg.callee.type !== 'Identifier' || arg.callee.name !== 'async')
      this.err('not.a.valid.arg.list',{tn:arg});
    if (this.parenAsync !== null && arg.callee === this.parenAsync.expr)
      this.err('arrow.has.a.paren.async');

//  if (this.v < 7)
//    this.err('ver.async');

    async = true;
    sc |= ST_ASYNC;
    this.enterScope(this.scope.spawnFn(sc));
    this.parenScope.makeParams(this.scope);
    this.parenScope = null;
    this.asArrowFuncArgList(arg.arguments);
    cb.bef = arg.callee['#c'].bef;
    cb['async.aft'] = arg.callee['#c'].aft;
    cb.inner = arg['#c'].inner ;
    this.suc(cb, 'list.bef' );
    loc = arg['#argloc' ];
    break;

  case INTERMEDIATE_ASYNC:
    async = true;
    sc |= ST_ASYNC;
    this.enterScope(this.scope.spawnFn(sc));
    this.scope.refDirect_m(_m(arg.id.name), null);
    this.asArrowFuncArg(arg.id);
    cb.bef = arg.asyncID['#c'].bef;
    this.spc(arg.id, 'aft');
    loc = arg.loc.start;
    break;

  default: this.err('not.a.valid.arg.list');
  }

  this.pt_flush();

  var scope = this.scope;
  scope.activateBody();

  if (this.nl)
    this.err('arrow.newline');

  this.next();
  var isExpr = true, nbody = null;

  if (this.lttype === CH_LCURLY) {
    var prevLabels = this.labels,
        prevDeclMode = this.declMode;

    this.labels = {};
    isExpr = false;
    nbody = this.parseFunBody();

    this.labels = prevLabels;
    this.declMode = prevDeclMode;
  }
  else
    nbody = this.parseNonSeq(PREC_NONE, ctx|CTX_PAT) ;

  this.exitScope(); // body

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
    async: async,
    '#scope': scope, '#y': 0, '#c': cb, '#argploc': loc
  }; 
};

},
function(){
this.parseAssignment = function(head, ctx) {
  var o = this.ltraw;
  if (o === '=>')
    return this.parseArrow(head, ctx&CTX_FOR);

  if (head.type === PAREN_NODE) {
    if (!this.ensureSAT(head.expr)) {
      this.at = ERR_PAREN_UNBINDABLE;
      this.ae = this.ao = head;
      this.throwTricky('a', this.at, this.ae);
    }
    else
      this.dissolveParen();
  }

  this.spc(core(head), 'aft');
  var right = null, oploc = null;
  if (o === '=') {
    // if this assignment is a pattern
    if (ctx & CTX_PARPAT)
      this.st_adjust_for_toAssig();

    var st = ERR_NONE_YET, se = null, so = null,
        pt = ERR_NONE_YET, pe = null, po = null;

    // S- and P-errors are not modified during toAssig; A-errors might.
    this.toAssig(core(head), ctx);

    // flush any remaining simple errors, now that there are no more assignment errors;
    // when toAssig completes, it might have set this.st with an assig-to-arguments-or-eval;
    // this will get thrown immediately if the assignment is non-leaking, i.e., 
    // won't tolerate simple errors
    if ((ctx & CTX_NO_SIMPLE_ERR) && this.st !== ERR_NONE_YET)
      this.throwTricky('s', this.st);

    var sc0 = -1, sli0 = -1, scol0 = -1,
        pc0 = -1, pli0 = -1, pcol0 = -1;

    // save all the errors on the left hand side, to restore them after right is parsed
    if ((ctx & CTX_PARPAT) && this.st !== ERR_NONE_YET) {
      st = this.st; se = this.se; so = this.so;
      if (st & ERR_PIN)
        sc0 = this.pin.s.c0, sli0 = this.pin.s.li0, scol0 = this.pin.s.col0;
    }
    if ((ctx & CTX_PARAM) && this.pt !== ERR_NONE_YET) {
      pt = this.pt; pe = this.pe; po = this.po;
      if (pt & ERR_PIN)
        pc0 = this.pin.p.c0, pli0 = this.pin.p.li0, pcol0 = this.pin.p.col0;
    }

    // toAssig was successful -- clear
    this.at_flush();
    if (errt_top(ctx))
      ctx &= ~CTX_TOP; // a top assig is not a pattern

    this.next(); // '='
    right = this.parseNonSeq(PREC_NONE,
      (ctx & CTX_FOR)|CTX_TOP);

    // restore the state of errors in the left hand side, if there are any
    if (pt !== ERR_NONE_YET) {
      this.pt = pt; this.pe = pe; this.po = po;
      errt_pin(pt) && this.pin_pt(pc0,pli0,pcol0);
    }
    if (st !== ERR_NONE_YET) {
      this.st = st; this.se = se; this.so = so;
      errt_pin(st) && this.pin_st(sc0,sli0,scol0);
    }
  }
  else {
    // TODO: further scrutiny, like checking for this.at, is necessary (?)
    if (!this.ensureSAT(core(head)))
      this.err('assig.not.simple',{tn:core(head)});

    if (errt_top(ctx))
      ctx &= ~CTX_TOP;

    var c0 = -1, li0 = -1, col0 = -1;

    // if this is an potential assignment pattern, pin the location of the non-'='
    if (ctx & CTX_PARPAT) {
      c0 = this.c0; li0 = this.li0; col0 = this.col0;
    }

    if (o === '+=') oploc = this.loc0();
    this.next(); // <:o:>=
    right = this.parseNonSeq(PREC_NONE, (ctx & CTX_FOR)|CTX_TOP);

    // record an actual error if we have parsed a potential param or assignment pattern
    if (errt_track(ctx)) {
      if (errt_param(ctx)) {
        this.pin_pt(c0,li0,col0);
        this.pt = ERR_PIN_NOT_AN_EQ;
      }
      if (errt_pat(ctx)) {
        this.pin_at(c0,li0,col0);
        this.at = ERR_PIN_NOT_AN_EQ;
      }
    }
  }
 
  this.inferName(head, core(right), false);
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
    }, '#o': oploc,
    '#y': this.Y(head)+this.Y(right), '#c': {}
  };
};

},
function(){
this.parseBlock = function () {
  this.fixupLabels(false);

  this.enterScope(this.scope.spawnBlock()); 
  var scope = this.scope;

  var c0 = this.c0, loc0 = this.loc0();

  var cb = {}; this.suc(cb, 'bef' );
  this.next(); // '{'

  var n = {
    type: 'BlockStatement',
    body: this.stmtList(),
    start: c0,
    end: this.c,
    loc: {
      start: loc0, 
      end: this.loc() }, 
    '#y': this.yc,
    '#scope': scope, 
    '#c': cb,
    '#lead': null
  };

  this.suc(cb, 'inner');
  if (!this.expectT(CH_RCURLY))
    this.err('block.unfinished');

  this.exitScope(); 

  return n;
};

},
function(){
this. parseCatchClause = function () {
   var c0 = this.c0, cb = {}, loc0 = this.loc0();

   this.suc(cb, 'bef');
   this.next(); // 'catch'
   this.suc(cb, 'catch.aft');

   this.enterScope(this.scope.spawnCatch());
   if (!this.expectT(CH_LPAREN))
     this.err('catch.has.no.opening.paren',{c0:c0,loc0:loc0});

   this.declMode = DT_CATCHARG;
   var catParam = this.parsePat();
   if (this.peekEq())
     this.err('catch.has.an.assig.param',{c0:startc,loc0:startLoc,extra:catParam});

   this.declMode = DT_NONE;
   if (catParam === null)
     this.err('catch.has.no.param',{c0:startc,loc0:startLoc});

   if (catParam.type === 'Identifier')
     this.scope.argIsSimple = true;

   this.spc(catParam, 'aft');
   if (!this.expectT(CH_RPAREN))
     this.err('catch.has.no.end.paren',{c0:startc,loc0:startLoc,extra:catParam});

   this.scope.activateBody();
   var catBlock = this.parseDependent('catch');
   catBlock['#scope'] = this.scope ; 
   var scope = this.exitScope();

   return {
       type: 'CatchClause',
       loc: { start: loc0, end: catBlock.loc.end },
       start: c0,
       end: catBlock.end,
       param: catParam ,
       body: catBlock,
       '#scope': scope,
       '#y': this.Y(catParam)+this.Y(catBlock)
   };
};

},
function(){
this.parseClass = 
function(ctx) {
  if (this.v <= 5)
    this.err('ver.class');
  if (this.unsatisfiedLabel)
    this.err('class.label.not.allowed');

  var c0 = this.c0, cb = {}, loc0 = this.loc0();

  this.suc(cb, 'bef');

  var isStmt = false, name = null;
  if (this.canBeStatement) {
    isStmt = true;
    this.canBeStatement = false;
  }

  this.next(); // 'class'

  var sourceDecl = null;
  var st = ST_NONE;
  if (isStmt) {
    st = ST_DECL;
    if (!this.scope.canDeclareLexical())
      this.err('class.decl.not.in.block',{c0:c0,loc0:loc0});
    if (this.lttype === TK_ID && this.ltval !== 'extends') {
      this.declMode = DT_CLS|this.cutEx();
      name = this.getName_cls(st);
      sourceDecl = this.scope.findDeclOwn_m(_m(name.name));
    }
    else if (!(ctx & CTX_DEFAULT))
      this.err('class.decl.has.no.name', {c0:startc,loc0:startLoc});
  }
  else {
    st = ST_EXPR;
    if (this.lttype === TK_ID && this.ltval !== 'extends')
      name = this.getName_cls(st);
  }

  this.enterScope(this.scope.spawnCls(st));
  var scope = this.scope;

  scope.makeStrict();

  if (name)
    scope.setName(name.name, sourceDecl).t(DT_CLSNAME);

  var superClass = null;
  if (this.lttype === TK_ID && this.ltval === 'extends') {
    name ? this.spc(name, 'aft') : this.suc(cb, 'class.aft');
    this.next();
    superClass = this.parseExprHead(CTX_NONE) || this.err('no.heritage');
    superClass = this.parseTail(superClass);
  }

  var mmflags = ST_CLSMEM, mmctx = CTX_NONE;

  if (superClass)
    this.scope.flags |= SF_HERITAGE;

  var list = [];
  var c0b = this.c0, loc0b  = this.loc0();

  var cbb = {}; this.suc(cbb, 'bef');
  cbb['semis'] = [];
  if (!this.expectT(CH_LCURLY))
    this.err('class.no.curly',{c0:startc,loc0:startLoc,extra:{n:name,s:superClass,c:ctx}});

  var mem = null;

  var y = 0, ct = null;
  while (true) {
    if (this.lttype === CH_SEMI) {
      this.commentBuf && cbb.semis.push([list.length, this.cc()]);
      this.next();
      continue;
    }
    mem = this.parseMem(mmctx, mmflags);
    if (mem !== null) {
      list.push(mem);
      y += this.Y(mem);
      if (mem.kind === 'constructor') {
        ct = mem;
        mmctx |= CTX_CTOR_NOT_ALLOWED;
      }
    }
    else break;
  }

  var eloc = this.loc();
  var n = {
    type: isStmt ? 'ClassDeclaration' : 'ClassExpression',
    id: name,
    start: c0,
    end: this.c,
    superClass: superClass,
    loc: { start: loc0, end: eloc },
    body: {
      type: 'ClassBody',
      loc: { start: loc0b, end: eloc },
      start: c0b,
      end: this.c,
      body: list,
      '#y': y, '#c': cbb
    },
    '#y': (superClass ? this.Y(superClass) : 0)+y,
    '#scope': scope, '#c': cb, '#ct': ct
  };

  this.suc(cbb, 'inner');
  if (!this.expectT(CH_RCURLY))
    this.err('class.unfinished',{tn:n, extra:{delim:'}'}});

  if (name) {
    if (ct) this.inferName(name, ct.value, false);
  }
  this.exitScope();

  if (isStmt)
    this.foundStatement = true;

  return n;
};

this.parseSuper = function() {
  if (this.v <=5 ) this.err('ver.super');

  var cb = {}; this.suc(cb, 'bef');
  var n = {
    type: 'Super',
    loc: { start: this.loc0(), end: this.loc() },
    start: this.c0,
    end: this.c ,
   '#c': cb,
   '#liq': null,
   '#this': null, '#ti': void 0
  };
 
  this.next();
  switch (this.lttype) {
  case CH_LPAREN:
    if (!this.scope.canScall())
      this.err('class.super.call',{tn:n});
    this.scope.refDirect_m(RS_SCALL, null);
    this.scope.refDirect_m(RS_THIS, null);
    break;
 
  case CH_SINGLEDOT:
  case CH_LSQBRACKET:
    if (!this.scope.canSmem())
      this.err('class.super.mem',{tn:n});
    break ;
  
  default: this.err('class.super.lone',{tn:n}); 
  }
 
  return n;
};

},
function(){
this.parseCond = function(cond, ctx) {
  this.spc(core(cond), 'aft');
  this.next(); // '?'

  var seq = this.parseNonSeq(PREC_NONE, CTX_TOP);
  this.spc(core(seq), 'aft');
  if (!this.expectT(CH_COLON))
    this.err('cond.colon',{extra:[cond,seq,context]});

  var alt = this.parseNonSeq(PREC_NONE, (ctx&CTX_FOR)|CTX_TOP);
  return {
    type: 'ConditionalExpression',
    test: core(cond),
    start: cond.start,
    end: alt.end,
    loc: {
      start: cond.loc.start,
      end: alt.loc.end },
    consequent: core(seq),
    alternate: core(alt),
    '#y': this.Y(cond,alt,seq), '#c': {}
  };
};

},
function(){
this.parseDbg = 
function() {
  this.resvchk();
  this.testStmt() || this.err('not.stmt');
  this.fixupLabels(false);

  var c0 = this.c0,
      loc0 = this.loc0(),
      c = this.c,
      li = this.li,
      bl = {},
      col = this.col;

  this.suc(bl, 'bef');
  this.next() ;

  this.semi(bl, 'aft') || this.err('no.semi');

  this.foundStatement = true;
  return {
    type: 'DebuggerStatement',
    loc: { start: loc0, end: this.semiLoc || { line: li, column: col } } ,
    start: c0,
    end: this.semiC || c,
    '#c': bl
  };
};

},
function(){
this.parseDependent = 
function(name) {
  var c0 = this.c0, cb = {}, loc0 = this.loc0();

  this.suc(cb, 'bef');

  if (!this.expectT(CH_LCURLY))
    this.err('block.dependent.no.opening.curly',{extra:{name:name}});

  var n = {
    type: 'BlockStatement',
    body: this.stmtList(),
    start: c0,
    end: this.c,
    loc: {
      start: loc0,
      end: this.loc() },
    '#y': this.yc, '#scope': null, '#c': cb, '#lead': null
  };

  this.suc(cb, 'inner');

  if (!this.expectT(CH_RCURLY))
    this.err('block.dependent.is.unfinished',{tn:n, extra:{delim:'}'}});

  return n;
};

},
function(){
this.parseDoWhile =
function () {
  this.resvchk();
  this.testStmt() || this.err('not.stmt');
  this.fixupLabels(true);

  this.enterScope(this.scope.spawnBare());
  var scope = this.scope; 

  this.allow(SA_BREAK|SA_CONTINUE);

  var c0 = this.c0, cb = {}, loc0 = this.loc0() ;

  this.suc(cb, 'bef');
  this.next(); // 'do...while'

  var nbody = this.parseStatement(true) ;
  if (this.lttype === TK_ID && this.ltval === 'while') {
    this.resvchk();
    this.spc(nbody, 'aft');
    this.next();
  }
  else
    this.err('do.has.no.while',{extra:[startc,startLoc,nbody]});

  this.suc(cb, 'while.aft');
  if (!this.expectT(CH_LPAREN))
    this.err('do.has.no.opening.paren',{extra:[startc,startLoc,nbody]});

  var cond = core(this.parseExpr(CTX_TOP));
  var c = this.c, li = this.li, col = this.col;

  this.spc(cond, 'aft');
  if (!this.expectT(CH_RPAREN))
    this.err('do.has.no.closing.paren',{extra:[startc,startLoc,nbody,cond]});

  if (this.lttype === CH_SEMI) {
     c = this.c;
     li = this.li ;
     col = this.col;
     this.suc(cb, 'cond.aft');
     this.next();
  }

  this.foundStatement = true;
  this.exitScope(); 

  return {
    type: 'DoWhileStatement',
    test: cond,
    start: c0,
    end: c,
    body: nbody,
    loc: {
      start: loc0,
      end: { line: li, column: col } },
    '#scope': scope,
    '#y': this.Y(cond)+this.Y(nbody), '#c': cb
  };
};

},
function(){
this.parseEmptyStatement =
function() {
  var n = {
    type: 'EmptyStatement',
    start: this.c0,
    loc: { start: this.loc0(), end: this.loc() },
    end: this.c,
    '#y': 0, '#c': {}
  };
  this.spc(n, 'bef');
  this.next();
  return n;
};

},
function(){
this.parseFor = function() {
  this.resvchk();
  this.testStmt() || this.err('not.stmt');
  this.fixupLabels(true) ;

  var c0 = this.c0, cb = {}, loc0 = this.loc0();

  this.suc(cb, 'bef' );
  this.next () ;

  this.suc(cb, 'for.aft');
  if (!this.expectT(CH_LPAREN))
    this.err('for.with.no.opening.paren',{extra:[c0,loc0]});

  this.enterScope(this.scope.spawnBare());
  var scope = this.scope;
  var head = null, headIsExpr = false, headctx = CTX_NONE;
  this.missingInit = false;

  this.scope.enterForInit();
  if (this.lttype === TK_ID)
  switch ( this.ltval ) {
  case 'let':
    if (this.v<5)
      break;
    this.canBeStatement = true;
    head = this.parseVar(DT_LET, CTX_FOR);
    if (!this.foundStatement) { // i.e., we got a letID
      this.canBeStatement = false; // because parseVar actually keeps it intact, even in the event of a handleLet call
      this.exprHead = head;
      head = null;
    }
    break;

  case 'var':
    this.canBeStatement = true;
    head = this.parseVar(DT_VAR, CTX_FOR);
    break;

  case 'const':
    this.canBeStatement = true;
    head = this.parseVar(DT_CONST, CTX_FOR);
    break;
  }

  if (this.foundStatement) // head is a decl
    this.foundStatement = false;
  else {
    headIsExpr = true;
    head = this.parseExpr(headctx = CTX_NULLABLE|CTX_PAT|CTX_FOR);
  }
  this.scope.exitForInit();

  var nbody = null;
  var afterHead = null;

  // TODO: core(head)
  if (head !== null && this.lttype === TK_ID) {
    var kind = 'ForInStatement', iterkw = this.ltval;
    if (iterkw === 'of') {
      kind = 'ForOfStatement';
      this.ensureVarsAreNotResolvingToCatchParams();
    }
    else if (iterkw === 'in')
      this.resvchk();
    else 
      this.err('for.iter.not.of.in',{extra:[startc,startLoc,head]});

    if (headIsExpr) {
      if (head.type === 'AssignmentExpression')
        this.err('for.in.has.init.assig',{tn:head,extra:[startc,startLoc,kind]});
      this.st_adjust_for_toAssig();
      this.toAssig(head, headctx);
      this.st_flush();
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

    this.spc(core(head), 'aft');
    this.next();
    afterHead = kind === 'ForOfStatement' ? 
      this.parseNonSeq(PREC_NONE, CTX_TOP) :
      this.parseExpr(CTX_TOP);

    this.spc(core(afterHead), 'aft');
    if (!this.expectT(CH_RPAREN))
      this.err('for.iter.no.end.paren',{extra:[head,startc,startLoc,afterHead,kind]});

    this.scope.actions |= (SA_CONTINUE|SA_BREAK);
    this.scope.flags |= SF_LOOP;
    nbody = this.parseStatement(true);
    if (!nbody)
      this.err('null.stmt');

    this.foundStatement = true;
    this.exitScope();

    return {
      type: kind,
      loc: { start: loc0, end: nbody.loc.end },
      start: c0,
      end: nbody.end,
      body: nbody, 
      left: head,
      right: core(afterHead),
      '#y': this.Y(head,afterHead,nbody),
      '#scope': scope,
      '#c': cb
    };
  }

  if (headIsExpr)
    this.st_flush();
  else if (head && this.missingInit)
    this.err('for.decl.no.init',{extra:[startc,startLoc,head]});

  head ? this.spc(core(head), 'aft') : this.suc(cb, 'head');
  if (!this.expectT(CH_SEMI))
    this.err('for.simple.no.init.semi',{extra:[startc,startLoc,head]});

  afterHead = this.parseExpr(CTX_NULLABLE|CTX_TOP);
  afterHead ? this.spc(core(afterHead), 'aft') : this.suc(cb, 'test');
  if (!this.expectT(CH_SEMI))
    this.err('for.simple.no.test.semi',{extra:[startc,startLoc,head,afterHead]});

  var tail = this.parseExpr(CTX_NULLABLE|CTX_TOP);
  tail ? this.spc(core(tail), 'aft') : this.suc(cb, 'tail');
  if (!this.expectT(CH_RPAREN))
    this.err('for.simple.no.end.paren',{extra:[startc,startLoc,head,afterHead,tail]});

  this.scope.actions |= (SA_CONTINUE|SA_BREAK);
  this.scope.flags |= SF_LOOP;

  nbody = this.parseStatement(true);
  if (!nbody)
    this.err('null.stmt');
  this.foundStatement = true;
  this.exitScope();

  return {
    type: 'ForStatement',
    init: head && core(head), 
    start : c0,
    end: nbody.end,
    test: afterHead && core(afterHead),
    loc: { start: loc0, end: nbody.loc.end },
    body: nbody,
    update: tail && core(tail),
    '#scope': scope,
    '#c': cb,
    '#y': this.Y0(head,afterHead,tail)+this.Y(nbody)
  };
};

this.ensureVarsAreNotResolvingToCatchParams = function() {
  return;
};

},
function(){
this.id = function() {
  var id = {
    type: 'Identifier',
    name: this.ltval,
    start: this.c0,
    end: this.c,
    loc: {
      start: this.loc0(),
      end: this.loc() },
    raw: this.ltraw,
    '#ref': null,
    '#cvtz': CVTZ_NONE,
    '#c': {},
  };
  this.spc(id, 'bef');
  this.next() ;
  return id;
};

},
function(){
this.parseIf = function () {
  this.resvchk();
  !this.testStmt() && this.err('not.stmt');
  this.fixupLabels(false);

  this.enterScope(this.scope.spawnBare());
  var ifScope = this.scope; 
  this.scope.flags |= SF_INSIDEIF;

  var c0 = this.c0, cb = {}, loc0 = this.loc0();

  this.suc(cb, 'bef');
  this.next(); // 'if'

  this.suc(cb, 'aft.if');
  if (!this.expectT(CH_LPAREN))
    this.err('if.has.no.opening.paren');

  var cond = core(this.parseExpr(CTX_TOP));

  this.spc(cond, 'aft');
  if (!this.expectT(CH_RPAREN))
    this.err('if.has.no.closing.paren');

  var nbody = this.parseStatement(false);
  this.exitScope(); 

  var alt = null, elseScope = null;
  if (this.lttype === TK_ID && this.ltval === 'else') {
    this.resvchk();
    this.spc(nbody, 'aft');
    this.next(); // 'else'
    this.enterScope(this.scope.spawnBare());
    elseScope = this.scope; 
    alt = this.parseStatement(false);
    this.exitScope();
  }

  this.foundStatement = true;
  return {
    type: 'IfStatement',
    test: cond,
    start: c0,
    end: (alt||nbody).end,
    loc: {
      start: loc0,
      end: (alt||nbody).loc.end },
    consequent: nbody,
    alternate: alt,
    '#ifScope': ifScope,
    '#y': this.Y(cond,nbody)+this.Y0(alt),
    '#c': cb,
    '#elseScope': elseScope
  };
};

},
function(){
this.parseLabel = function(label, allowNull) {
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

},
function(){
this.mem_id = 
function() {
  if (this.v>5)
    return this.id();

  this.validate(this.ltval);
  return this.id();
};

this.mem_expr = 
function() {
  if (this.v <= 5)
    this.err('ver.mem.comp');

  var c0 = this.c0, b = this.cc(), loc0 = this.loc0();
  this.next() ;
  
  // none of the modifications memberExpr may make to this.pt, this.at, and this.st
  // overwrite some other unrecorded this.pt, this.at, or this.st -- an unrecorded value of <pt:at:st>
  // means a whole elem was just parsed, and <pt:at:st> is immediately recorded after that whole
  // potpat element is parsed, so if a memberExpr overwrites <pt:at:st>, that <pt:at:st> is not an
  // unrecorded one.
  
  // TODO: it is not necessary to reset <pt:at>
  this.pt = this.at = this.st = 0;

  // TODO: should be CTX_NULLABLE, or else the next line is in vain  
  var e = this.parseNonSeq(PREC_NONE, CTX_NULLABLE|CTX_TOP);
  e || this.err('prop.dyna.no.expr');

  var cb = CB(e);
  if (cb.bef) cb.bef.c = b.c.concat(cb.bef.c);
  else cb.bef = b;

  var n = {
    type: PAREN,
    expr: core(e), 
    start: c0,
    end: this.c,
    loc: { start: loc0, end: this.loc() }
  };

  this.spc(core(e), 'aft');
  if (!this.expectT(CH_RSQBRACKET))
    this.err('prop.dyna.is.unfinished');

  return n;
};

},
function(){
this.parseMeta =
function(c0,loc0,c,li,col) {
  var cb = this.cb;
  this.v<=5 && this.err('ver.ntarget');
  this.lttype !== TK_ID && this.err('ntarget.id');
  if (this.ltval !== 'target')
    this.err('meta.new.has.unknown.prop');
  
  if (!this.scope.canAccessNewTarget())
    this.err('meta.new.not.in.function',{c0:startc,loc:startLoc});

  var prop = this.id();

  return {
    type: 'MetaProperty',
    meta: {
      type: 'Identifier',
      name : 'new',
      start: c0,
      end: c,
      loc: {
        start : loc0,
        end: { line: li, column: col }
      } 
    },
    start : c0,
    property: prop,
    end: prop.end,
    loc : { start: loc0, end: prop.loc.end },
    '#y': 0, '#c': cb
  };
};

},
function(){
this.parseObj = function(ctx) {
  var c0 = this.c0, loc0 = this.loc0(),
      elem = null, list = [], first__proto__ = null,
      elctx = CTX_NONE,
      pt = ERR_NONE_YET, pe = null, po = null,
      at = ERR_NONE_YET, ae = null, ao = null,
      st = ERR_NONE_YET, se = null, so = null,
      n = null;

  var cb = {};
  this.suc(cb , 'bef');
  if (ctx & CTX_PAT) {
    elctx |= ctx & CTX_PARPAT;
    elctx |= ctx & CTX_PARPAT_ERR;
  }
  else 
    elctx |= CTX_TOP;

  if (errt_track(ctx)) {
    errt_ptrack(ctx) && this.pt_reset();
    errt_atrack(ctx) && this.at_reset();
    errt_strack(ctx) && this.st_reset();
  }

  var pc0 = -1, pli0 = -1, pcol0 = -1;
  var ac0 = -1, ali0 = -1, acol0 = -1;
  var sc0 = -1, sli0 = -1, scol0 = -1;

  var y = 0, ci = -1;
  do {
    elem && this.spc(elem, 'aft');
    this.next();
    this.first__proto__ = first__proto__;
    elem = this.parseMem(elctx, ST_OBJMEM);

    if (elem === null)
      break;

    y += this.Y(elem);

    if (!first__proto__ && this.first__proto__)
      first__proto__ = this.first__proto__;

    list.push(core(elem));
    if (ci === -1 && core(elem).computed)
      ci = list.length - 1;

    if (!errt_track(elctx))
      continue;

    if (errt_ptrack(elctx) && this.pt_override(pt)) {
      pt = this.pt, pe = this.pe, po = elem;
      if (errt_pin(pt))
        pc0 = this.pin.p.c0, pli0 = this.pin.p.li0, pcol0 = this.pin.p.col0;
      if (errt_psyn(pt))
        elctx |= CTX_HAS_A_PARAM_ERR;
    }
    if (errt_atrack(elctx) && this.at_override(at)) {
      at = this.at; ae = this.ae; ao = elem;
      if (errt_pin(at))
        ac0 = this.pin.a.c0, ali0 = this.pin.a.li0, acol0 = this.pin.a.col0;
      if (errt_asyn(at))
        elctx |= CTX_HAS_AN_ASSIG_ERR;
    }
    if (errt_strack(elctx) && this.st_override(st)) {
      st = this.st; se = this.se; so = elem;
      if (errt_pin(st))
        sc0 = this.pin.s.c0, sli0 = this.pin.s.li0, scol0 = this.pin.s.col0;
      if (errt_ssyn(st))
        elctx |= CTX_HAS_A_SIMPLE_ERR;
    }
  } while (this.lttype === CH_COMMA);

  elem ? this.spc(core(elem), 'aft') : this.suc(cb, 'inner');

  n = {
    properties: list,
    type: 'ObjectExpression',
    start: c0,
    end: this.c,
    loc: { start: loc0, end: this.loc() }, 
    '#c': cb,
    '#ci': ci,
    '#y': y, '#rest': -1 /* rest */, '#t': null
  };

  if (errt_perr(ctx,pt)) {
    this.pt_teot(pt,pe,po);
    errt_pin(pt) && this.pin_pt(pc0,pli0,pcol0);
  }
  if (errt_aerr(ctx,at)) {
    this.at_teot(at,ae,ao);
    errt_pin(at) && this.pin_at(ac0,ali0,acol0);
  }
  if (errt_serr(ctx,st)) {
    this.st_teot(st,se,so);
    errt_pin(st) && this.pin_st(sc0,sli0,scol0);
  }

  if (!this.expectT(CH_RCURLY))
    this.err('obj.unfinished');

  return n;
};


},
function(){
this.parseParen = function(ctx) {
  var c0 = this.c0, loc0 = this.loc0(),
      list = null, prevys = this.suspys,
      elctx = CTX_NONE, hasRest = false,
      pc0 = -1, pli0 = -1, pcol0 = -1,
      sc0 = -1, sli0 = -1, scol0 = -1,
      st = ERR_NONE_YET, se = null, so = null,
      pt = ERR_NONE_YET, pe = null, po = null,
      insideParams = false,
      parenScope = null;

  if (ctx & CTX_PAT) {
    this.pt = this.st = ERR_NONE_YET;
    this.pe = this.po =
    this.se = this.so = null;
    this.suspys = null;
    elctx = CTX_PAT|CTX_PARAM|CTX_NULLABLE;
    this.enterScope(this.scope.spawnParen());
    insideParams = true;
  }
  else
    elctx = CTX_TOP;

  var lastElem = null, hasTailElem = false;

  var bef = this.cc();
  this.next();

  var elem = null, y = 0;
  while (true) {
    lastElem = elem;
    elem = this.parseNonSeq(PREC_NONE, elctx);
    if (elem === null) {
      if (this.lttype === TK_ELLIPSIS) {
        if (!errt_param(elctx)) {
          this.st_teot(ERR_UNEXPECTED_REST,null,null);
          this.st_flush();
        }
        elem = this.parseSpread(elctx);
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

    if (elem) y += this.Y(elem);

    if (errt_param(elctx)) {
      if (errt_ptrack(elctx)) {
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
        if (this.pt_override(pt)) {
          pt = this.pt, pe = this.pe, po = core(elem);
          if (errt_pin(pt))
            pc0 = this.pin.p.c0, pli0 = this.pin.p.li0, pcol0 = this.pin.p.col0;
          if (errt_psyn(pt))
            elctx |= CTX_HAS_A_PARAM_ERR;
        }
      }

      if (errt_strack(elctx)) {
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
        if (this.st_override(st)) {
          st = this.st, se = this.se, so = elem && core(elem);
          if (errt_pin(st))
            sc0 = this.pin.s.c0, sli0 = this.pin.s.li0, scol0 = this.pin.s.col0;
          if (errt_ssyn(st))
            elctx |= CTX_HAS_A_SIMPLE_ERR;
        }
      }
    }

    if (hasTailElem)
      break;

    if (list) list.push(core(elem));
    if (this.lttype === CH_COMMA) {
      if (hasRest)
        this.err('rest.arg.has.trailing.comma');
      if (list === null)
        list = [core(elem)];
      this.spc(core(elem), 'aft');
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
        },
        '#y': y, '#c': {} 
      } : elem && core(elem),
      start: c0,
      end: this.c,
      loc: { start: loc0, end: this.loc() }, '#c': {}
  };

  if (bef) {
    if (n.expr) {
      var cbe = CB(n.expr);
      if (cbe.bef) cbe.bef.c = bef.c.concat(cbe.bef.c);
      else cbe.bef = bef;
    } else
      CB(n).bef = bef;
  }

  n.expr && this.spc(core(n.expr), 'aft');
  this.suc(CB(n), 'inner');
  if (!this.expectT(CH_RPAREN))
    this.err('unfinished.paren',{tn:n});

  if (elem === null && list === null) {
    if (ctx & CTX_PARPAT) {
      st = ERR_EMPTY_LIST_MISSING_ARROW;
      se = so = n;
    }
    else {
      this.st_teot(ERR_EMPTY_LIST_MISSING_ARROW,n,n);
      this.st_flush();
    }
  }

  if (errt_pat(ctx)) {
    if (pt !== ERR_NONE_YET) {
      this.pt_teot(pt,pe,po);
      errt_pin(pt) && this.pin_pt(pc0,pli0,pcol0);
    }
    if (st !== ERR_NONE_YET) {
      this.st_teot(st,se,so);
      errt_pin(st) && this.pin_st(sc0,sli0,scol0);
    }
    if (list === null && elem !== null &&
       elem.type === 'Identifier' && elem.name === 'async')
      this.parenAsync = n;
  }

  if (prevys !== null)
    this.suspys = prevys;

  if (insideParams)
    parenScope = this.exitScope();

  this.parenScope = parenScope;

  return n;
};

this.dissolveParen = function() {
  if (this.parenScope) {
    this.parenScope.makeSimple();
    this.parenScope = null;
  }
};

},
function(){
this.parsePat_array = 
function() {
  if (this.v <= 5)
    this.err('ver.patarr');

  var c0 = this.c0, loc0 = this.loc0(),
      elem = null, list = [];

  if (this.scope.insideArgs())
    this.scope.enterUniqueArgs();

  var y = 0, cb = {};

  this.suc(cb, 'bef');
  this.next();

  cb.holes = [];
  while (true) {
    elem = this.parsePat();
    if (elem && this.peekEq())
      elem = this.parsePat_assig(elem);
    else if (this.lttype === TK_ELLIPSIS) {
      list.push(elem = this.parsePat_rest());
      this.spc(elem, 'aft');
      break ;
    }  

    if (elem) {
      y += this.Y(elem);
      this.spc(elem, 'aft');
    } else 
      this.commentBuf && cb.holes.push([list.length, this.cc()]);

    if (this.lttype === CH_COMMA) {
      list.push(elem);
      this.next();
    } else  {
      elem && list.push(elem);
      break ;
    }
  }

  var n = {
    type: 'ArrayPattern',
    loc: { start: loc0, end: this.loc() },
    start: c0,
    end: this.c,
    elements: list,
    '#y': y, '#c': cb
  };

  this.suc(cb, 'inner');
  if (!this.expectT(CH_RSQBRACKET))
    this.err('pat.array.is.unfinished');

  return n;
};

},
function(){
this.parsePat_assig = 
function (head) {
  if (this.v <= 5)
    this.err('ver.assig');
  this.spc(head, 'aft');
  this.next() ;
  var e = this.parseNonSeq(PREC_NONE, CTX_TOP);
  this.inferName(head, core(e), false);
  return {
    type: 'AssignmentPattern',
    start: head.start,
    left: head,
    end: e.end,
    right: core(e),
    loc: {
      start: head.loc.start,
      end: e.loc.end },
    '#y': this.Y(head,e), '#c': {}
  };
};

},
function(){
this.parsePat_obj =
function() {
  this.v<=5 && this.err('ver.patobj');

  var isID = false, c0 = this.c0, loc0 = this.loc0();
  var name = null, val = null, list = [], isShort = false;

  if (this.scope.insideArgs())
    this.scope.enterUniqueArgs();

  var cb = {}, ci = -1, y = 0;

  this.suc(cb, 'bef');
  var elem = null;

  LOOP:
  do {
    elem && this.spc(elem, 'aft');
    this.next();
    var y0 = 0;
    switch (this.lttype) {
    case TK_ID:
      isID = true;
      name = this.id();
      break;

    case CH_LSQBRACKET:
      name = this.mem_expr();
      y0 += this.Y(name);
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

    isShort = isID;
    if (isID) {
      if (this.expectT(CH_COLON)) {
        isShort = false;
        val = this.parsePat();
      }
      else {
        this.validate(name.name);
        this.declare(name);
        if (this.scope.insideStrict() && arorev(name.name))
          this.err('bind.arguments.or.eval');
        val = name;
      }
    }
    else {
      if (!this.expectT(CH_COLON))
        this.err('obj.pattern.no.:');
      val = this.parsePat();
    }

    if (val === null)
      this.err('obj.prop.is.null');

    if (this.peekEq())
      val = this.parsePat_assig(val);

    y0 += this.Y(val);
    y += y0;

    list.push(elem = {
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
      '#y': y0, '#c': {}
    });
    if (ci === -1 && name.type === PAREN)
      ci = list.length - 1;
  } while (this.lttype === CH_COMMA);

  var n = {
    properties: list,
    type: 'ObjectPattern',
    loc: { start: loc0, end: this.loc() },
    start: c0,
    end: this.c,
    '#y': y, '#ci': ci, '#c': {}, '#rest': -1
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
  var c0 = this.c0, cb = {}, loc0 = this.loc0();

  this.suc(cb, 'bef');
  this.next(); // '...'

  if (this.v<7 && this.lttype !== TK_ID)
    this.err('rest.binding.arg.not.id');

  var arg = this.parsePat();

  if (arg === null)
    this.err('rest.has.no.arg');

  return {
    type: 'RestElement',
    argument: arg,
    start: c0,
    end: arg.end,
    loc: {
      start: loc0,
      end: arg.loc.end },
    '#c': cb,
    '#y': this.Y(arg)
  };
};

},
function(){
this.parsePat = 
function() {
  switch (this.lttype) {
  case TK_ID:
    if (this.vpatCheck &&  this.patErrCheck())
      return null;
    this.validate(this.ltval);
    var id = this.id();
    this.declare(id);
    if (this.scope.insideStrict() && arorev(id.name))
      this.err('bind.arguments.or.eval');

    return id;

  case CH_LSQBRACKET:
    if (this.vpatCheck && this.patErrCheck())
      return null;
    return this.parsePat_array();

  case CH_LCURLY:
    if (this.vpatCheck && this.patErrCheck())
      return null;
    return this.parsePat_obj();

  default:
     return null;
  }
};

},
function(){
this.parseProgram = function () {
  var c0 = this.c, li0 = this.li, col0 = this.col;
  var ec = -1, eloc = null;

  if (this.bundler === null && this.bundleScope === null)
    this.bundleScope = new GlobalScope();

  ASSERT.call(this, this.bundleScope, 'bundleScope');
  this.scope = new SourceScope(this.bundleScope, ST_SCRIPT);

  this.scope.synthBase = this.bundleScope ;

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
    '#imports': null,
    '#uri': "", // uri of the program's source, if any such uri exists
    '#loader': "" // uri of the very first source importing this program, if any such source exists and has a uri
  };

  if (!this.expectT(TK_EOF))
    this.err('program.unfinished');

  var bundler = this.bundler;
  if (bundler) {
    ASSERT.call(this, bundler.bundleScope === this.bundleScope, 'bundler\'s scope is not the same as parser\'s' );
    bundler.save(n);
    n['#imports'] = n['#scope'].satisfyWithBundler(bundler);
  }

  return n;
};

},
function(){
// /\1200(*followed by 1200 ()'s)/ becomes /(*backref=\1200)(*1200 ()'s)/; but, /\1200(*followed by 1199 ()'s)/ becomes /(*legacyEsc=\120)(*ch='0')(*1199 ()'s);
// this means any captureP had better get tracked below, rather than in `parseRegex`

this.parseRegexLiteral =
function() {
  this.v < 2 && this.err('ver.regex');
  var c = this.c, b = {}, s = this.src, nump = 0, l = s.length;
  var c0 = this.c0, inClass = false, loc0 = this.loc0();
  this.suc(b, 'bef');

  var esc = false;

  REGEX:
  while (c < l) {
    switch (s.charCodeAt(c)) {
    case CH_LSQBRACKET:
      if (esc) { esc = false; break }
      if (!inClass) inClass = true;
      break;
    case CH_BACK_SLASH:
      if (esc) { esc = false; break; }
      esc = true;
      break;
    case CH_RSQBRACKET:
      if (esc) { esc = false; break; }
      if (inClass) inClass = false;
      break;
    case CH_DIV:
      if (esc) { esc = false; break; }
      if (inClass) break;
      break REGEX;
    case CH_LPAREN:
      if (esc || inClass || c+1 >= l) break;
      if (s.charCodeAt(c+1) !== CH_QUESTION)  nump++;
      break;
    case CH_CARRIAGE_RETURN:
      c+1 < l && s.charCodeAt(c+1) === CH_LINE_FEED && c++;
    case CH_LINE_FEED:
    case 0x2028:
    case 0x2029:
      this.err(esc ? 'regex.esc.newline' : 'regex.newline', {c0:c});
    default:
      if (esc) { esc = false; }
    }
    c++;
  }

  if (c >= l || s.charCodeAt(c) !== CH_DIV)
    this.err('regex.unfinished');

  var pattern = s.substring(this.c, c);
  c++; // '/'

  var patternStart = this.c;
  this.setsimpoff(c);

  var flags = "", flagsStart = c;
  while (c < l && isIDBody(s.charCodeAt(c))) c++;
  flags = s.substring(flagsStart, c);

  var n = this.parseRegex(patternStart, loc0.line, loc0.column+1, c, nump, flags, this.c, this.li, this.col);
  this.setsimpoff(c);
  var regex = {
    type: 'Literal',
    regex: {
      pattern: pattern,
      flags: flags 
    },
    start: c0,
    end: c,
    value: null,
    loc: { start: loc0, end: this.loc() }, 
    raw: this.src.substring(c0, c),
    '#c': b, '#n': n
   };

   this.next () ;
   return regex ;
};

},
function(){
this.parseReturn = function () {
  this.resvchk();
  this.testStmt() || this.err('not.stmt');
  this.fixupLabels(false ) ;

  if (!this.scope.canReturn()) 
    this.err('return.not.in.a.function');

  var c0 = this.c0, loc0 = this.loc0();
  var c = this.c, li = this.li, col = this.col;

  var b = {}, r = null;

  this.suc(b, 'bef' );
  this.next(); // 'return'

  if (!this.nl)
    r = this.parseExpr(CTX_NULLABLE|CTX_TOP);

  this.semi(r ? r['#c'] : b, r ? 'aft' : 'ret.aft') || this.err('no.semi');
  var ec = this.semiC || (r && r.end) || c;
  var eloc = this.semiLoc ||
    (r && r.loc.end) ||
    { line: li, column: col };

  this.foundStatement = true;
  return { 
    type: 'ReturnStatement',
    argument: r && core(r),
    start: c0,
    end: ec,
    loc: { start: loc0, end: eloc },
    '#c': b,
    '#y': this.Y0(r)
  };
};

},
function(){
this.parseSpread = 
function(ctx) {
  this.v <= 5 && this.err('ver.spread.rest');

  var c0 = this.c0, cb = {}, loc0 = this.loc0();

  this.suc(cb, 'bef' );
  this.next();

  var arg = this.parseNonSeq(PREC_NONE, ctx);
  if (arg === null)
    this.err('spread.arg.is.null');

  if (arg.type === PAREN_NODE) {
    if (errt_ptrack(ctx)) { 
      this.pt = ERR_PAREN_UNBINDABLE;
      this.pe = arg;
    }
    if (errt_atrack(ctx) && !this.ensureSAT(arg.expr)) {
      this.at = ERR_PAREN_UNBINDABLE;
      this.ae = arg;
    }
  }
    
  return {
    type: 'SpreadElement',
    loc: { start: loc0, end: arg.loc.end },
    start: c0,
    end: arg.end,
    argument: core(arg),
    '#c': cb,
    '#y': this.Y(arg)
  };
};

},
function(){
this.parseString =
function(startChar) {
  var c = this.c, s = this.src, l = s.length, v = "";
  var luo = c, surrogateTail = -1, ch = -1;

  var cb = {}; this.suc(cb, 'bef');

  LOOP:
  while (c<l) {
    ch = s.charCodeAt(c);
    if (ch === CH_BACK_SLASH) {
      if (luo < c)
        v += s.substring(luo,c);
      this.setsimpoff(c);
      v += this.readEsc(false);
      c = luo = this.c;
    }
    else
      switch (ch) {
      case startChar:
        if (luo < c)
          v += s.substring(luo,c);
        c++;
        break LOOP;

      case CH_CARRIAGE_RETURN:
      case CH_LINE_FEED:
      case 0x2028: case 0x2029:
        this.setsimpoff(c);
        this.err('str.newline');

      default: c++;
      }
  }

  this.setsimpoff(c);
  if (ch !== startChar)
    this.err('str.unfinished');

  var n = {
    type: 'Literal',
    value: v,
    start: this.c0,
    end: c,
    raw: this.c0_to_c(),
    loc: {
      start: { line: this.li0, column: this.col0 },
      end: { line: this.li, column: this.col }
    }, '#c': cb
  };

  // not the most elegant solution, but for what it does (catching legacy numbers),
  // it is fitting; a better solution which won't require re-parsing the number
  // will eventually come instead of the block below (NUM_START token, much like the way the strings are handled)
  if (this.chkDirective) {
    this.chkDirective = false;
    if (c<l) {
      this.skipWS();
      c = this.c;
      if (this.scat(c) === CH_0) {
        this.applyDirective(n);
        this.alreadyApplied = true;
      }
    }
  }
  this.next();

  return n;
};

},
function(){
this.parseSwitchCase = function () {
  var c0 = -1, cb = {}, loc0 = null;

  var nbody = null, cond = null;

  if (this.lttype === TK_ID) 
  switch (this.ltval) {
  case 'default':
    this.resvchk();
    this.suc(cb, 'bef');
    c0 = this.c0;
    loc0 = this.loc0();
    this.next();
    this.suc(cb, 'default.aft');
    break ;

  case 'case':
    this.resvchk();
    this.suc(cb, 'bef');
    c0 = this.c0;
    loc0 = this.loc0();
    this.next(); // 'case'
    cond = core(this.parseExpr(CTX_TOP)) ;
    this.spc(cond, 'aft');
    break;

  default: return null;
  } else return null;

  var c = this.c, li = this.li, col = this.col;
  if (!this.expectT(CH_COLON))
    this.err('switch.case.has.no.colon');

  nbody = this.stmtList();
  var last = nbody.length ? nbody[nbody.length-1] : null;

  var ec = -1, eloc = null;
  if (last) {
    ec = last.end;
    eloc = last.loc.end;
  } else {
    ec = c;
    eloc = { line: li, column: col };
  }

  this.suc(cb, 'inner');
  return {
    type: 'SwitchCase',
    test: cond,
    start: c0,
    end: ec,
    loc: { start: loc0, end: eloc },
    consequent: nbody,
    '#y': this.Y0(cond)+this.yc, '#c': cb
  };
};

},
function(){
this.parseSwitch = function () {
  this.resvchk();
  !this.testStmt() && this.err('not.stmt');
  this.fixupLabels(false) ;

  var c0 = this.c0, loc0 = this.loc0(),
      cases = [], hasDefault = false , elem = null;

  var cb = {}; this.suc(cb, 'bef');
  this.next(); // 'switch'
  this.suc(cb, 'switch.aft');
  if (!this.expectT(CH_LPAREN))
    this.err('switch.has.no.opening.paren');

  var switchExpr = core(this.parseExpr(CTX_TOP));
  this.spc(switchExpr, 'aft');

  if (!this.expectT(CH_RPAREN))
    this.err('switch.has.no.closing.paren');

  this.suc(cb, 'cases.bef');
  if (!this.expectT(CH_LCURLY))
    this.err('switch.has.no.opening.curly');

  this.enterScope(this.scope.spawnBlock()); 
  var scope = this.scope;

  this.allow(SA_BREAK);

  var y = 0;
  while (elem = this.parseSwitchCase()) {
    if (elem.test === null) {
       if (hasDefault ) this.err('switch.has.a.dup.default');
       hasDefault = true ;
    }
    cases.push(elem);
    y += this.Y(elem);
  }

  this.foundStatement = true;
  this.exitScope(); 

  var n = {
    type: 'SwitchStatement',
    cases: cases,
    start: c0,
    discriminant: switchExpr,
    end: this.c,
    loc: {
      start: loc0,
      end: this.loc() }, 
    '#scope': scope,
    '#y': this.Y(switchExpr)+(y), '#c': cb
  };

  this.suc(cb, 'inner');
  if (!this.expectT(CH_RCURLY))
    this.err('switch.unfinished');

  return n;
};

},
function(){
this.parseThrow =
function () {
  this.resvchk();
  this.testStmt() || this.err('not.stmt');
  this.fixupLabels(false ) ;

  var ex = null, c0 = this.c0, loc0 = this.loc0();
  var li = this.li, c = this.c, col = this.col;

  var b = {}; this.suc(b, 'bef');
  this.next(); // 'throw'

  if (this.nl)
    this.err('throw.has.newline');

  ex = this.parseExpr(CTX_NULLABLE|CTX_TOP);
  if (ex === null)
    this.err('throw.has.no.argument');

  this.semi(core(ex)['#c'], 'aft') || this.err('no.semi');

  this.foundStatement = true;
  return {
    type: 'ThrowStatement',
    argument: core(ex),
    start: c0,
    end: this.semiC || ex.end,
    loc: {
      start: loc0,
      end: this.semiLoc || ex.loc.end
    },
    '#c': b,
    '#y': this.Y(ex)
  };
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

  var e = [latestExpr = core(head)];
  var y = this.Y(head);
  do {
    latestExpr && this.spc(latestExpr, 'aft');
    this.next();
    latestExpr = this.parseNonSeq(PREC_NONE, ctx);
    y += this.Y(latestExpr);
    e.push(core(latestExpr));
  } while (this.lttype === CH_COMMA);

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
this.parseTryStatement = function () {
  this.resvchk();
  this.testStmt() || this.err('not.stmt');
  this.fixupLabels(false);

  var c0 = this.c0, cb = {}, loc0 = this.loc0();

  this.suc(cb, 'bef');
  this.next(); // 'try'

  this.enterScope(this.scope.spawnBlock()); 

  var tryBlock = this.parseDependent('try');
  tryBlock['#scope'] = this.scope;
  var tryScope = this.scope; 

  this.exitScope(); 

  var finBlock = null, catBlock  = null;
  if (this.lttype === TK_ID && this.ltval === 'catch')
    catBlock = this.parseCatchClause();

  var finScope = null;
  if (this.lttype === TK_ID && this.ltval === 'finally') {
    this.resvchk();
    this.suc(cb, 'finally.bef') ;
    this.next();
    this.enterScope(this.scope.spawnBlock()); 
    finScope = this.scope;
    finBlock = this.parseDependent('finally');
    finBlock['#scope'] = this.scope;
    this.exitScope(); 
  }

  var finOrCat = finBlock || catBlock;

  finOrCat || this.err('try.has.no.tail');
  this.foundStatement = true;

  return  {
    type: 'TryStatement',
    block: tryBlock,
    start: c0,
    end: finOrCat.end,
    handler: catBlock,
    finalizer: finBlock,
    loc: {
      start: loc0,
      end: finOrCat.loc.end },
    '#y': this.Y(tryBlock)+this.Y0(catBlock,finBlock),
    '#finScope': finScope,
    '#c': cb,
    '#tryScope': tryScope,

  };
};

},
function(){
this.parseUnary =
function(ctx) {
  var op = "", loc0 = this.loc0(), c0 = this.c0, vdt = this.vdt;

  if (vdt !== VDT_NONE) {
    this.vdt = VDT_NONE;
    op = this.ltval;
  }
  else
    op = this.ltraw;

  var cb = {}; this.suc(cb, 'bef');
  this.next();
  var arg = this.parseNonSeq(PREC_UNARY, ctx & CTX_FOR);

  if (this.scope.insideStrict() &&
    vdt === VDT_DELETE &&
    core(arg).type !== 'MemberExpression')
    this.err('delete.arg.not.a.mem',{tn:arg,extra:{c0:startc,loc0:startLoc,context:context}});

  if (vdt === VDT_AWAIT) {
    var n = {
      type: 'AwaitExpression',
      argument: core(arg),
      start: c0,
      end: arg.end,
      loc: { start: loc0, end: arg.loc.end },
      '#c': cb,
      '#y': this.Y(arg)
    };
    this.suspys = n;
    return n;
  }

  return {
    type: 'UnaryExpression',
    operator: op,
    start: c0,
    end: arg.end,
    loc: { start: loc0, end: arg.loc.end },
    prefix: true,
    '#c': cb,
    argument: core(arg),
    '#y': this.Y(arg)
  };
};

},
function(){
this.parseWhile = 
function () {
  this.resvchk();
  this.testStmt() || this.err('not.stmt');
  this.fixupLabels(true);

  this.enterScope(this.scope.spawnBare());
  var scope = this.scope; 
  this.allow(SA_BREAK|SA_CONTINUE);
  this.scope.flags |= SF_LOOP;

  var c0 = this.c0, cb = {}, loc0 = this.loc0();

  this.suc(cb, 'bef');
  this.next(); // 'while'

  this.suc(cb, 'while.aft');
  if (!this.expectT(CH_LPAREN))
    this.err('while.has.no.opening.paren');
 
  var cond = core(this.parseExpr(CTX_TOP));

  this.spc(cond, 'aft');
  if (!this.expectT(CH_RPAREN))
    this.err('while.has.no.closing.paren');

  var nbody = this.parseStatement(false);
  this.foundStatement = true;

  var scope = this.exitScope();
  return {
    type: 'WhileStatement',
    test: cond,
    start: c0,
    end: nbody.end,
    loc: {
      start: loc0,
      end: nbody.loc.end },
    body:nbody,
    '#scope': scope, 
    '#y': this.Y(cond, nbody), '#c': cb
  };
};

},
function(){
this.parseWith = 
function() {
  this.resvchk();
  this.testStmt() || this.err('not.stmt');
  if (this.scope.insideStrict())
    this.err('with.strict')  ;

  this.fixupLabels(false);

  this.enterScope(this.scope.spawnBare());
  var scope = this.scope;

  var c0 = this.c0, cb = {}, loc0 = this.loc0();

  this.suc(cb, 'bef');
  this.next(); // 'with'

  this.suc(cb, 'with.aft' );
  if (!this.expectT(CH_LPAREN))
    this.err('with.has.no.opening.paren');

  var obj = core(this.parseExpr(CTX_TOP));

  this.spc(obj, 'aft' );
  if (!this.expectT(CH_RPAREN))
    this.err('with.has.no.end.paren');

  var nbody = this.parseStatement(true);
  this.exitScope();

  this.foundStatement = true;
  return  {
    type: 'WithStatement',
    loc: { start: loc0, end: nbody.loc.end },
    start: c0,
    end: nbody.end,
    object: obj,
    body: nbody,
    '#scope': scope,
    '#y': this.Y(obj, nbody ), '#c': cb
  };
};

},
function(){
this.parseYield = 
function(ctx) {
  var c = this.c, li = this.li, col = this.col;
  var deleg = false, arg = null;
  var c0 = this.c0, cb = {}, loc0 = this.loc0();

  this.suc(cb, 'bef');
  this.next(); // 'yield'

  if (!this.nl) {
    if (this.peekMul()) {
      deleg = true;
      this.suc(cb, '*.bef');
      this.next(); // '*'
      arg = this.parseNonSeq(PREC_NONE, ctx&CTX_FOR);
      if (!arg)
        this.err('yield.has.no.expr.deleg');
    }
    else
      arg = this.parseNonSeq(PREC_NONE, (ctx&CTX_FOR)|CTX_NULLABLE);
  }

  var ec = -1, eloc = null;
  if (arg) { ec = arg.end; eloc = arg.loc.end; }
  else { ec = c; eloc = { line: li, column: col }; }

  var n = {
    type: 'YieldExpression',
    argument: arg && core(arg),
    start: c0,
    delegate: deleg,
    end: ec,
    loc: { start : loc0, end: eloc },
    '#y': 1+this.Y0(arg), '#c': cb
  };

  if (this.suspys === null)
    this.suspys = n;

  return n;
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
  this.foundComment(c0,li0,col0,c,'Line');
};

this.readComment_multi =
function() {
  var c = this.c, s = this.src, l = s.length;
  var li0 = this.li, col0 = this.col, c0 = c, hasNL = false, finished = false;
  var l0o = -1; // line 0 offset
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
      if (!hasNL) {
        hasNL = true;
        l0o = c;
      }
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

  if (!hasNL)
    l0o = c;
  else
    l0o--; // do not count the break

  this.foundComment(c0,li0,col0,l0o,'Block');
  return hasNL;
};

this.foundComment =
function(c0,li0,col0,l0o,t) {
  var c = this.c, li = this.li, col = this.col;
  if (this.commentBuf === null)
    this.commentBuf = new Comments();

  var line = t === 'Line';
  var comment = {
    type: t,
    value: this.src.substring(c0, line ? c : c-2),
    start: c0,
    end: c,
    loc: {
      start: { line: li0, column: col0 },
      end: { line: li, column: col }
    },
    '#firstLen': l0o - c0 + 2
  };

  this.commentBuf.push(comment);
  this.commentCallback && this.commentCallback(comment);
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
this.regUnitAssertion =
function() {
  var c0 = this.c, loc0 = this.loc();
  var kind = this.src.charAt(this.c);
  this.setsimpoff(this.c+1);
  return {
    type: '#Regex.Assertion',
    kind: kind,
    start: c0,
    end: this.c,
    loc: { start: loc0, end: this.loc() }
  };
};

this.regBbAssertion =
function() {
  var c0 = this.c, loc0 = this.loc();
  var kind = this.src.charAt(c0+1);
  this.setsimpoff(c0+2);
  return {
    type: '#Regex.Assertion',
    kind: kind,
    start: c0,
    end: this.c,
    loc: { start: loc0, end: this.loc() }
  };
};

},
function(){
this.regBranch =
function() {
  this.regErr = null;
  this.regIsQuantifiable = false;

  var elem = this.regBareElem();
  if (elem === null)
    return null;

  var elements = [];
  do {
    if (elem !== this.regLastBareElem) {
      elem = this.regTryMix(elements, elem);
      if (this.regIsQuantifiable) {
        this.regIsQuantifiable = false;
        if (this.regPendingBQ || this.regPendingCQ || 
          (!isCharSeq(elem) && this.regPrepareQ()))
          elem = this.regQuantify(elem);
      }
      elements.push(elem);
      this.regLastBareElem = elem; // reuse CharSeq
    }

    this.regIsQuantifiable = false;
    elem = this.regBareElem();
    if (this.regErr)
      return null;
  } while (elem);

  var lastElem = elements[elements.length-1];
  return {
    type: '#Regex.Branch',
    elements: elements,
    start: elements[0].start,
    end: lastElem.end,
    loc: { start: elements[0].loc.start, end: lastElem.loc.end }
  };
};

this.regTryMix =
function(list, elem) {
  if (list.length === 0) 
    return elem;
  var last = list[list.length-1];
  if (isLead(last) && isTrail(elem)) {
    last.next = elem;
    if (this.regexFlags.u && uAkin(last, elem)) {
      list.pop();
      this.regIsQuantifiable = true;
      return this.regMakeSurrogate(last, elem);
    }
  }
  return elem;
};

this.regBareElem =
function() {
  var c = this.c, s = this.src, l = this.regLastOffset;
  if (c >= l)
    return null;

  var elem = null;
  var c0 = this.c, li0 = this.li, col0 = this.col, luo0 = this.luo;
  switch (s.charCodeAt(c)) {
  case CH_LSQBRACKET:
    return this.regClass();
  case CH_LPAREN:
    return this.regParen();
  case CH_LCURLY:
    if (this.rf.u)
      return this.regErr_looseLCurly();
    if (!this.regCurlyChar) {
      elem = this.regCurlyQuantifier();
      if (elem)
        return this.regErr_looseCurlyQuantifier(elem);
      if (this.regErr) // shouldn't hold
        return null;
    }
    ASSERT.call(this, this.regCurlyChar, 'rcc' );
    this.regCurlyChar = false;
    // regCurlyQuantifier does the rw itself
    elem = this.regChar(false); // '{'
    return elem;
  case CH_RCURLY:
    return this.regErr_looseRCurly();
  case CH_BACK_SLASH:
    return this.regEsc(false);
  case CH_$:
  case CH_XOR:
    return this.regUnitAssertion();
  case CH_QUESTION:
  case CH_ADD:
  case CH_MUL:
    return this.regErr_looseQuantifier();
  case CH_OR:
  case CH_RPAREN:
    return null;
  case CH_SINGLEDOT:
    return this.regDot();
  default:
    return this.regChar(false);
  }
};

},
function(){
// characters do not test for early semi-ranges, because that makes things needlessly complicated -- after all, we are only a single character away
// from telling whether the semi range is deterministically erroneous, which is not much of a calculation
this.regChar =
function(ce) { // class elem
  var c0 = this.c; 
  var s = this.src;
  var ch = s.charCodeAt(c0);

  if (ch >= 0x0d800 && ch <= 0x0dbff)
    return this.regSurrogateComponent_VOKE(ch, c0 + 1, 'lead', 'none');
  if (ch >= 0x0dc00 && ch <= 0x0dfff)
    return this.regSurrogateComponent_VOKE(ch, c0 + 1, 'trail', 'none');

  var l = this.regChar_VECI(s.charAt(c0), c0 + 1, ch, ce);
  if (ce && ch === CH_MIN)
    l.type = '#Regex.Hy'; // '-'
  return l;
};

this.regChar_VECI =
function(value, offset, ch, ce) {
  var s = this.src, c0 = this.c;
  var loc0 = this.loc(), raw = s.substring(c0, offset);
  this.setsimpoff(offset);
  var li = this.li, col = this.col;
  var parent = ce ? null : this.regLEIAC();
  if (!ce && this.regPrepareQ()) // `parent &&` is necessary because we might be parsing a class element
    parent = null;

  if (parent) {
    parent.raw += raw;
    parent.charLength += 1;
    parent.value += value;
    parent.end += raw.length;
    parent.loc.end.column += raw.length;
    if (parent.cp !== -1)
      parent.cp = -1;
    return parent;
  }

  this.regIsQuantifiable = true;
  return {
    type: '#Regex.CharSeq',
    raw: raw,
    start: c0,
    end: offset,
    cp: ch,
    charLength: 1,
    loc: { start: loc0, end: { line: li, column: col } },
    value: value,
  };
};



},
function(){
this.regClass =
function() {
  var c0 = this.c, loc0 = this.loc(), list = [];
  var e = null, latest = null;
  var n = null;

  var inverse = false;
  if (this.scat(c0+1) === CH_XOR)
    inverse = true;

  this.setsimpoff(inverse ? c0 + 2 : c0 + 1);

  while (true) {
    e = this.regClassElem(); 
    if (this.regErr)
      return null;
    if (e === null)
      break;
    this.regPushClassElem(list, e);
  }

  if (this.regSemiRange && !this.regTryCompleteSemiRange())
    return null; // an error has got set

  if (!this.expectChar(CH_RSQBRACKET))
    return this.regErr_classUnfinished(n);

  n = {
    type: '#Regex.Class',
    elements: list,
    start: c0,
    end: this.c,
    inverse: inverse,
    loc: { start: loc0, end: this.loc() }
  };

  this.regIsQuantifiable = true;
  return n;
};

this.regPushClassElem =
function(list, tail) {
  if (list.length === 0) { list.push(tail); return; }

  var len = list.length;
  var ltop = list[len-1];
  var sr = this.regSemiRange;

  if (sr) {
    ASSERT.call(this, sr === ltop, 'semiRange must not have existed if it were not the last elem');
    ASSERT.call(this, isTrail(tail), 'semiRange should not have existed if the next class elem is a non-unicode escape');
    ASSERT.call(this, this.regexFlags.u, 'semiRange could not have existed if the u flags was not initially set');
    sr.max.next = tail;
    if (uAkin(sr.max, tail))
      sr.max = this.regMakeSurrogate(sr.max, tail);
    else
      list.push(tail);
    this.regTryCompleteSemiRange();
    return;
  }

  if (isLead(ltop) && isTrail(tail)) {
    if (this.regexFlags.u && ltop.escape !== '{}' && uAkin(ltop, tail)) {
      list.pop();
      list.push(this.regMakeSurrogate(ltop, tail));
    }
    else
      list.push(tail);
    ltop.next = tail;
    return;
  }

  if (ltop.type === '#Regex.Range' && isLead(ltop.max) && isTrail(tail)) ltop.max.next = tail;
  if (len < 2 || ltop.type !== '#Regex.Hy') { list.push(tail); return; }

  var max = tail;
  var maxv = cpReg(max);
  if (maxv === -1) { list.push(tail); return; }

  var min = list[len-2];
  var minv = cpReg(min);
  if (minv === -1) { list.push(tail); return; }

  var semi = false;
  if (this.regexFlags.u && isLead(tail) && tail.escape !== '{}')
    semi = true;
  else if (minv > maxv)
    return this.regErr_minBiggerThanMax(min, tail);

  list.pop(); // '-'
  list.pop(); // head

  var elem = {
    type: semi ? '#Regex.SemiRange' : '#Regex.Range',
    min: min,
    start: min.start,
    end: max.end,
    max: max,
    loc: { start: min.loc.start, end: max.loc.end }
  };
  if (semi) {
    ASSERT.call(this, this.regSemiRange === null, 'semi' );
    this.regSemiRange = elem;
  }
  list.push(elem);
};

this.regTryCompleteSemiRange =
function() {
  var sr = this.regSemiRange;
  ASSERT.call(this, sr.type === '#Regex.SemiRange', 'semi' );
  ASSERT.call(this, sr.max.cp >= 0, 'max');
  ASSERT.call(this, sr.min.cp >= 0, 'min');
  if (sr.min.cp > sr.max.cp)
    return this.regErr_minBiggerThanMax(sr.min, sr.max);

  sr.type = '#Regex.Range';
  sr.end = sr.max.end;
  sr.loc.end = sr.max.loc.end;

  this.regSemiRange = null;
  return sr;
};

// true if completeing the semi-range results in a `regErr
this.testSRerr =
function() {
  return this.regSemiRange && !this.regTryCompleteSemiRange();
};

this.regClassElem =
function() {
  var c = this.c, s = this.src, l = this.regLastOffset;
  if (c >= l)
    return null;
  switch (s.charCodeAt(c)) {
  case CH_BACK_SLASH:
    return this.regEsc(true);
  case CH_RSQBRACKET:
    return null;
  default:
    return this.regChar(true);
  }
};

},
function(){
this.regCurlyQuantifier =
function() {
  ASSERT_EQ.call(this, this.regCurlyChar, false);
  var c0 = this.c, c = c0, s = this.src, l = this.regLastOffset, li0 = this.li, col0 = this.col, luo0 = this.luo;
  c++; // '{'
  this.setsimpoff(c);
  VALID: {
    var minVal = this.regTryToParseNum();
    if (minVal === -1)
      break VALID;
    var minRaw = s.substring(c, this.c);
    c = this.c;
    if (c >= l)
      break VALID;
    var maxVal = -1, maxRaw = "";
    if (s.charCodeAt(c) === CH_COMMA) {
      c++; // ','
      this.setsimpoff(c);
      maxVal = this.regTryToParseNum();
      if (maxVal !== -1) {
        maxRaw = s.substring(c,this.c);
        c = this.c;
      }
      else
        maxRaw = 'inf';
    }
    if (c >= l)
      break VALID;
    if (s.charCodeAt(c) !== CH_RCURLY)
      break VALID;

    this.setsimpoff(c+1);

    if (maxVal >= 0 && maxVal < minVal)
      return this.regErr_curlyMinIsBiggerThanMax(); // TODO: max's location rather than }'s location

    var min = { raw: minRaw, value: minVal }, max = min;
    if (maxRaw !== "")
      max = maxVal === -1 ? null : { raw: maxRaw, value: maxVal };

    return {
      type: '#Regex.CurlyQuantifier',
      min: min,
      max: max,
      end: this.c,
      start: c0,
      loc: { start: { line: li0, column: col0 }, end: this.loc() }
    };
  }

  this.rw(c0,li0,col0,luo0);
  this.regCurlyChar = true;

  return null;
};

},
function(){
this.regErr_nonexistentRef =
function(ref) {
  return this.regErrNew('nonexistent-ref', this.loc(), { ref: ref });
};

this.regErr_looseLCurly =
function() {
  return this.regErrNew('loose-lcurly', this.loc());
};

this.regErr_looseRCurly =
function() {
  return this.regErrNew('loose-rcurly', this.loc());
};

this.regErr_invalidUEsc =
function(esc) {
  return this.regErrNew('invalid-uesc', this.loc(), { esc: esc });
};

this.regErr_classUnfinished =
function() {
  return this.regErrNew('class-unfinished', this.loc());
};

this.regErr_looseCurlyQuantifier =
function(elem) {
  return this.regErrNew('loose-cq', elem.loc.start);
};

this.regErr_trailSlash =
function() {
  return this.regErrNew('trail-slash', this.loc());
};

this.regErr_hexEOF =
function() {
  return this.regErrNew('hex-eof', this.loc());
};

this.regErr_hexEscNotHex =
function() {
  return this.regErrNew('hex-not', this.loc());
};

this.regErr_minBiggerThanMax =
function(min, max) {
  return this.regErrNew('min-bigger-than-max', this.loc(), { min: min, max: max });
};

this.regErr_controlAZaz =
function(esc) {
  return this.regErrNew('control-AZaz', this.loc(), { esc: esc });
};

this.regErr_controlEOF =
function() {
  return this.regErrNew('control-eof', this.loc());
};

this.regErr_insufficientNumsAfterU =
function(ce) {
  if (ce && this.testSRerr()) return null;
  return this.regErrNew('insufficient-nums-after-u', this.loc());
};

this.regErr_nonNumInU =
function(ce) {
  if (ce && this.testSRerr()) return null;
  return this.regErrNew('non-num-in-u', this.loc());
};

this.regErr_looseQuantifier =
function() {
  return this.regErrNew('loose-quantifier', this.loc());
};

this.regErr_uRCurlyNotReached =
function(ce) {
  if (ce && this.testSRerr()) return null;
  return this.regErrNew('u-rcurly', this.loc());
};

this.regErr_1114111U =
function(ch, ce) {
  if (ce && this.testRSerr()) return null;
  return this.regErrNew('1114111-u', this.loc(), { value: ch });
};

this.regErr_curlyMinIsBiggerThanMax =
function(min, max) {
  return this.regErrNew('curly-min-is-bigger-max', this.loc(), { min: min, max: max });
};

this.regErr_unfinishedParen =
function(n) {
  return this.regErrNew('rparen-missing', this.loc(), { element: n });
};

this.regErr_invalidCharAfterQuestionParen =
function(ch) {
  return this.regErrNew('qparen', this.loc(), { ch: ch });
};

this.regErrNew =
function() {
  var kind = arguments[0];
  var eloc = (arguments.length > 1 && arguments[1]) || this.loc();
  var ctx = (arguments.length > 2 && arguments[2]) || null;

  ASSERT.call(this, this.regErr === null, 'regErr');
  this.regErr = {
    type: '#Regex.Err',
    kind: kind,
    context: ctx,
    position: this.c,
    loc: eloc
  };
  return null;
};

},
function(){
// errors pertaining to u escapes will first check for pending semi ranges at the start of their corresponding routines
this.regEsc_u =
function(ce) {
  if (ce && this.regSemiRange &&
    this.regSemiRange.max.escape !== 'hex4' && !this.regTryCompleteSemiRange())
    return null;

  var c = this.c, s = this.src, l = this.regLastOffset;
  c += 2; // \u
  if (c >= l)
    return this.rf.u ? this.regErr_insufficientNumsAfterU() : null;

  var r = s.charCodeAt(c);
  if (this.rf.u && r === CH_LCURLY)
    return this.regEsc_uCurly(ce);

  var ch = 0, n = 0;
  while (true) {
    r = hex2num(r);
    if (r === -1) {
      this.setsimpoff(c);
      return this.rf.u ? this.regErr_insufficientNumsAfterU() : null;
    }
    ch = (ch<<4)|r;
    c++; n++;

    // fail early if there is a pending semi-range and this is not a surrogate trail
    if (ce) {
      if ((n === 1 && r !== 0x0d) ||
        (n === 2 && r < 0x0c))
        if (this.testSRerr())
          return null;
    }
    if (n >= 4)
      break;
    if (c >= l)
      return this.rf.u ? this.regErr_insufficientNumsAfterU() : null;
    r = s.charCodeAt(c);
  }

  if (ch >= 0x0d800 && ch <= 0x0dbff)
    return this.regSurrogateComponent_VOKE(ch, c, 'lead', 'hex4');
  if (ch >= 0x0dc00 && ch <= 0x0dfff)
    return this.regSurrogateComponent_VOKE(ch, c, 'trail', 'hex4');

  return this.regChar_VECI(String.fromCharCode(ch), c, ch, ce);
};

this.regEsc_uCurly =
function(ce) {
  if (ce && this.testSRerr())
    return null;

  var c = this.c, s = this.src, l = this.regLastOffset;
  c += 3; // \u{
  if (c >= l)
    return this.regErr_insufficientNumsAfterU(ce);
  var r = s.charCodeAt(c);
  var ch = hex2num(r);
  if (ch === -1) {
    this.setsimpoff(c);
    return this.regErr_nonNumInU(ce);
  }
  c++;
  while (true) {
    if (c >= l)
      return this.regErr_uRCurlyNotReached();

    r = s.charCodeAt(c);
    if (r === CH_RCURLY) { c++; break; }

    r = hex2num(r);
    if (r === -1) {
      this.setsimpoff(c);
      return this.regErr_nonNumInU();
    }

    ch = (ch<<4)|r;
    if (ch > 1114111) {
      this.setsimpoff(c);
      return this.regErr_1114111U(ch, ce);
    }
    c++;
  }

  if (ch >= 0x0d800 && ch <= 0x0dbff)
    return this.regSurrogateComponent_VOKE(ch, c, 'lead', '{}');

  if (ch >= 0x0dc00 && ch <= 0x0dfff)
    return this.regSurrogateComponent_VOKE(ch, c, 'trail', '{}');

  if (ch <= 0xffff)
    return this.regChar_VECI(String.fromCharCode(ch), c, ch, ce);

  var c0 = this.c, loc0 = this.loc();
  this.setsimpoff(c);
  if (!ce)
    this.regIsQuantifiable = true;
  return {
    type: '#Regex.Ho', // Higher-order, i.e., > 0xFFFF
    cp: ch,
    start: c0,
    end: c,
    raw: s.substring(c0, c),
    loc: { start: loc0, end: this.loc() },
    c1: null, c2: null
  };
};



},
function(){
this.regEsc =
function(ce) {
  var c = this.c, s = this.src, l = this.regLastOffset;
  if (c+1 >= l)
    return this.regErr_trailSlash();

  var elem = null;
  var c0 = this.c, li0 = this.li, col0 = this.col, luo0 = this.luo;
  // fail early for pending SRs
  var w = s.charCodeAt(c+1);
  if (w !== CH_u) {
    if (ce && this.testSRerr())
      return null;
  }
  else {
    elem = this.regEsc_u(ce);
    if (elem || this.regErr) return elem;
    this.rw(c0,li0,col0,luo0);
    return this.regEsc_itself(CH_u, ce);
  }

  switch (w) {
  case CH_v:
    return this.regEsc_simple('\v', ce);
  case CH_b:
    return ce ? this.regEsc_simple('\b', ce) : this.regBbAssertion();
  case CH_f:
    return this.regEsc_simple('\f', ce);
  case CH_t:
    return this.regEsc_simple('\t', ce);
  case CH_r:
    return this.regEsc_simple('\r', ce);
  case CH_n:
    return this.regEsc_simple('\n', ce);
  case CH_x:
    elem = this.regEsc_hex(ce);
    if (elem || this.regErr) return elem;
    this.rw(c0,li0,col0,luo0);
    return this.regEsc_itself(ce);
  case CH_c:
    elem = this.regEsc_control(ce);
    if (elem || this.regErr) return elem;
    this.rw(c0,li0,col0,luo0);
    return this.regChar(ce); // ... but not c
  case CH_D: case CH_W: case CH_S:
  case CH_d: case CH_w: case CH_s:
    return this.regClassifier();
  case CH_B:
    return ce ? this.regEsc_itself(w, ce) : this.regBbAssertion();
  default:
    if (w >= CH_0 && w <= CH_9) {
      elem = this.regEsc_num(w, ce);
      if (elem || this.regErr) return elem;
      this.rw(c0,li0,col0,luo0);
    }
    return this.regEsc_itself(w, ce);
  }
};

this.regClassifier =
function() {
  var c0 = this.c, loc0 = this.loc(), t = this.src.charAt(c0+1);
  this.setsimpoff(c0+2);
  this.regIsQuantifiable = true;
  return {
    type: '#Regex.Classifier',
    start: c0,
    loc: { start: loc0, end: this.loc() },
    end: this.c,
    kind: t
  };
};

this.regEsc_hex =
function(ce) { 
  var s = this.src, l = this.regLastOffset, c = this.c;
  c += 2; // \x
  if (c>=l)
    return this.rf.u ? this.regErr_hexEOF() : null;

  var ch1 = hex2num(s.charCodeAt(c));
  if (ch1 === -1) {
    this.setsimpoff(c);
    return this.rf.u ? this.regErr_hexEscNotHex() : null;
  }
  c++;
  if (c>=l)
    return this.rf.u ? this.regErr_hexEOF() : null;
  var ch2 = hex2num(s.charCodeAt(c));
  if (ch2 === -1) {
    this.setsimpoff(c);
    return this.rf.u ? this.regErr_hexEscNotHex() : null;
  }

  c++;
  var ch = (ch1<<4)|ch2;
  // Last Elem If A CharSeq
  return this.regChar_VECI(String.fromCharCode(ch), c, ch, ce);
};

this.regEsc_simple =
function(v, ce) {
  return this.regChar_VECI(v, this.c+2, v.charCodeAt(0), ce);
};

this.regEsc_control =
function(ce) {
  var c0 = this.c, c = c0;
  var s = this.src, l = this.regLastOffset;
  c += 2; // \c
  if (c>=l) {
    this.setsimpoff(c);
    return this.rf.u ? this.regErr_controlEOF() : null;
  }
  var ch = s.charCodeAt(c);

  INV:
  if ((ch > CH_Z || ch < CH_A) && (ch < CH_a || ch > CH_z)) {
    if (!this.rf.u && ce && ((ch >= CH_0 && ch <= CH_9) || ch === CH_UNDERLINE))
      break INV;
    this.setsimpoff(c); // TODO: unnecessary if there is no 'u' flag
    return this.rf.u ? this.regErr_controlAZaz(ch) : null;
  }

  c++;
  ch &= 31;

  return this.regChar_VECI(String.fromCharCode(ch), c, ch, ce);
};

var isUIEsc = makeAcceptor('^$\\.*+?()[]{}|/');
this.regEsc_itself =
function(ch, ce) {
  var c = this.c, s = this.src;
  c++; // \
  if (this.rf.u) {
    if (!isUIEsc(ch) && (!ce || ch !== CH_MIN)) {
      this.setsimpoff(c);
      return this.regErr_invalidUEsc(ch);
    }
  } else 
    ASSERT.call(this, ch !== CH_c, 'c' );

  c++;
  return this.regChar_VECI(String.fromCharCode(ch), c, ch, ce);
};

this.regEsc_num =
function(ch, ce) {
  var c = this.c, s = this.src, l = this.regLastOffset;
  if (ch === CH_0)
    return this.regEsc_num0(ce);
  var r0 = ch;
  var num = ch - CH_0;
  c += 2; // \[:num:]
  while (c < l) {
    ch = s.charCodeAt(c);
    if (!isNum(ch)) break;
    num *= 10;
    num += ch - CH_0;
    c++;
  }
  if (num <= this.regNC) {
    var c0 = this.c, loc0 = this.loc();
    this.setsimpoff(c);
    return {
      type: '#Regex.Ref',
      value: num,
      start: c0,
      end: this.c,
      raw: s.substring(c0, this.c),
      loc: { start: loc0, end: this.loc() }
    };
  }
  if (this.rf.u) {
    this.setsimpoff(c);
    return this.regErr_nonexistentRef(num);
  }
  if (r0 >= CH_8)
    return null;
  return this.regEsc_legacyNum(r0, ce);
};

// TODO: strict-chk
this.regEsc_legacyNum =
function(ch, ce) {
  var c = this.c, s = this.src, l = this.regLastOffset;
  var max = ch >= CH_4 ? 1 : 2, num = ch - CH_0;
  c += 2; // \[:num:]
  while (c < l) {
    ch = s.charCodeAt(c);
    if (ch < CH_0 || ch > CH_7) break;
    num = (num<<3)|(ch-CH_0);
    c++;
    if (--max === 0) break;
  }
  return this.regChar_VECI(String.fromCharCode(num), c, num, ce);
};

this.regEsc_num0 =
function(ce) {
  var c = this.c, s = this.src, l = this.regLastOffset;
  c += 2; // \0
  if (c < l) {
    var r = s.charCodeAt(c);
    if (r >= CH_0 && r <= CH_7)
      return this.regEsc_legacyNum(CH_0, ce);
  }
  return this.regEsc_simple('\0', ce);
};

},
function(){
this.resetLastRegexElem =
function() {
  var lbe = this.regLastBareElem;
  if (lbe !== null)
    this.regLastBareElem = null;

  return lbe;
};

this.regLEIAC =
function() {
  return (this.regLastBareElem && isCharSeq(this.regLastBareElem)) ?
    this.regLastBareElem : null;
};

this.expectChar =
function(ch) {
  var c = this.c, s = this.src, l = this.regLastOffset;
  if (c >= l)
    return false;
  if (s.charCodeAt(c) === ch) {
    this.setsimpoff(c+1);
    return true;
  }
  return false;
};

this.regTryToParseNum =
function() {
  var c = this.c, s = this.src, l = this.regLastOffset;
  if (c >= l)
    return -1;
  var v = 0, ch = s.charCodeAt(c);
  if (!isNum(ch))
    return -1;
  do {
    v *= 10;
    v += (ch - CH_0);
    c++;
    if (c >= l)
      break;
    ch = s.charCodeAt(c);
  } while (isNum(ch));

  this.setsimpoff(c);
  return v;
};

},
function(){
this.regParen =
function() {
  var c0 = this.c;
  var s = this.src;
  var l = this.regLastOffset;

  if (c0+1 >= l)
    return this.regErr_unfinishedParen();

  if (s.charCodeAt(c0+1) === CH_QUESTION)
    return this.regPeekOrGroup();

  var loc0 = this.loc();
  this.setsimpoff(c0+1);

  var elem = this.regPattern();
  if (this.regErr)
    return null;

  this.regIsQuantifiable = true;
  var finished = this.expectChar(CH_RPAREN);
  var n = {
    type: '#Regex.Paren',
    capturing: true,
    start: c0,
    end: this.c,
    pattern: elem,
    loc: { start: loc0, end: this.loc() }
  };

  if (finished)
    return n;

  return this.regErr_unfinishedParen(n);
};

this.regPeekOrGroup =
function() {
  var c0 = this.c, s = this.src, l = this.regLastOffset;
  var r = this.scat(c0+2);
  switch (r) {
  case CH_EQUALITY_SIGN:
    return this.regPeek(true);
  case CH_EXCLAMATION:
    return this.regPeek(false);
  case CH_COLON:
    return this.regGroup();
  default:
    return this.regErr_invalidCharAfterQuestionParen(r); // (?
  }
};

this.regPeek =
function(notInverse) {
  var c0 = this.c, loc0 = this.loc(), n = null, elem = null, finished = false;
  this.setsimpoff(c0+3);
  elem = this.regPattern();
  finished = this.expectChar(CH_RPAREN);
  n = {
    type: '#Regex.Peek',
    inverse: !notInverse,
    start: c0,
    pattern: elem,
    end: this.c,
    loc: { start: loc0, end: this.loc() }
  };
  this.regIsQuantifiable = !this.rf.u;

  if (finished) return n;
  return this.regErr_unfinishedParen(n);
};

this.regGroup = 
function() {
  var c0 = this.c, loc0 = this.loc(), n = null, elem = null, finished = false;
  this.setsimpoff(c0+3);
  elem = this.regPattern();
  finished = this.expectChar(CH_RPAREN);
  n = {
    type: '#Regex.Paren',
    capturing: false,
    start: c0,
    end: this.c,
    pattern: elem,
    loc: { start: loc0, end: this.loc() }
  };
  this.regIsQuantifiable = !this.rf.u;

  if (finished) return n;
  return this.regErr_unfinishedParen(n);
};

},
function(){
this.regPattern =
function() {
  var c0 = this.c, li0 = this.li, col0 = this.col;
  var l = this.resetLastRegexElem();
  var branches = null, elem = this.regBranch();
  if (this.regErr)
    return null;

  if (this.expectChar(CH_OR)) {
    branches = [];
    branches.push(elem)
    do {
      this.resetLastRegexElem();
      elem = this.regBranch();
      if (this.regErr)
        return null;
      branches.push(elem);
    } while (this.expectChar(CH_OR));
  }
  else if (elem)
    branches = [elem];
  else
    return null;
  
  var startLoc = branches.length && branches[0] ? branches[0].loc.start : { line: li0, column: col0 };
  var lastElem = branches.length ? branches[branches.length-1] : null;
  var endLoc = lastElem ? lastElem.loc.end : this.loc();

  this.lastRegexElem = l;

  return {
    type: '#Regex.Main',
    branches: branches,
    start: c0,
    end: lastElem ? lastElem.end : this.c, // equal either way, actually
    loc: { start: startLoc, end: endLoc }
  };
};

this.regDot =
function() {
  var c0 = this.c, loc0 = this.loc();
  this.setsimpoff(c0+1);
  this.regIsQuantifiable = true;
  return {
    type: '#Regex.Dot',
    start: c0,
    loc: { start: loc0, end: this.loc() },
    end: this.c
  };
};

},
function(){
this.regPrepareQ =
function() {
  var c = this.c, s = this.src, l = this.regLastOffset;
  if (c >= l)
    return false;
  switch (s.charCodeAt(c)) {
  case CH_ADD:
  case CH_QUESTION:
  case CH_MUL:
    this.regPendingCQ = true; // peek charQuantifier
    return true;
  case CH_LCURLY:
    this.regPendingBQ = this.regCurlyQuantifier();
    return this.regPendingBQ !== null;
  }
  return false;
};

this.regQuantify =
function(elem) {
  var c = this.c, li = this.li, col = this.col;
  var loc = null, s = this.src;
  var t = '', bq = null;

  if (this.regPendingCQ) {
    ASSERT.call(this, this.regPendingBQ === null, 'hasPBQnt');
    this.regPendingCQ = false;
    t = s.charAt(c);
    c++;
    this.setsimpoff(c);
    loc = this.loc();
  } 
  else if (this.regPendingBQ) {
    ASSERT.call(this, !this.regPendingCQ, 'hasPCQnt');
    t = '{}';
    bq = this.regPendingBQ;
    this.regPendingBQ = null;
    loc = bq.loc.end;
  }
  else 
    ASSERT.call(this, false, 'neither PCQnt nor PBQnt');

  var greedy = true;
  if (this.scat(this.c) === CH_QUESTION) {
    if (bq)
      loc = { line: loc.line, column: loc.column };
    c++;
    this.setsimpoff(c);
    loc.column++;
    greedy = false;
  }

  return {
    type: '#Regex.Quantified' ,
    rangeQuantifier: bq,
    quantifier: t,
    pattern: elem,
    start: elem.start,
    loc: { start: elem.loc.start, end: loc },
    end: this.c,
    greedy: greedy
  };
};



},
function(){
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

},
function(){
// GENERAL RULE: if error occurs while parsing an elem, the parse routine sets the `regexErr and returns null
this. parseRegex =
function(rc, rli, rcol, regLast, nump, flags, 
  /* tail (flags) */
  tc, tli, tcol) {
  var c = this.c;
  var li = this.li;
  var col = this.col;
  var luo0 = this.luo;
  var src0 = this.src;

  var e = 0, str = 'guymi';
  while (e < str.length) 
    this.rf[str[e++]] = false;
  e = 0;

  this.li = tli;
  this.col = tcol;
  this.c = tc;
  this.luo = this.c;

  var n = null;
  while (e < flags.length) {
    var fl = flags[e];
    if (!HAS.call(this.rf, fl)) {
      this.setsimpoff(tc+e);
      n = { type: '#Regex.Err', kind: 'flagunknown', loc: this.loc(), position: tc + e, ctx: { flag: fl } };
      break;
    }
    if (this.rf[fl]) {
      this.setsimpoff(tc+e);
      n = { type: '#Regex.Err', kind: 'flagduplicate', loc: this.loc(), position: tc + e, ctx: { flag: fl } };
      break;
    }
    this.rf[fl] = true;
    e++;
  }

  if (n === null) {
    this.c = rc;
    this.li = rli;
    this.col = rcol;
    this.regLastOffset = regLast - 1 - flags.length; // -('/'.length+flags.length)
    this.regNC = nump;

    this.luo = this.c;

    var n = this.regPattern();
    
    if (this.regErr) { n = this.regErr; this.regErr = null; }
    else if (this.c !== this.regLastOffset) {
      this.err('regex.no.complete.parse');
      // must never actually happen or else an error-regex-elem would have existed for it
      if (n.branches.length <= 0)
        this.err('regex.with.no.elements');
    }
  }

  this.c = c;
  this.li = li;
  this.col = col;

  this.luo = luo0;
  this.src = src0;

  return n;
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
  if (!decl.site) {
    ASSERT.call(this, decl.site === null, 'null');
    decl.s(id);
  }

  id['#ref'] = decl.ref;

  // lexport {e as E}; lexport var e = 12
  var entry = null;

  if (decl.isExported()) {
    entry = this.scope.registerExportedEntry_oi(id.name, id, id.name);
    this.scope.regulateOwnExport(entry);
    this.scope.refreshUnresolvedExportsWith(decl);
  }
  else {
    var sourceScope = decl.ref.scope;
    sourceScope.isSourceLevel() && sourceScope.refreshUnresolvedExportsWith(decl);
  }
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
[PathMan.prototype, [function(){
this.isSlash =
function(path, at) {
  return path.length <= at ? false : 
    path.charCodeAt(at) === CH_DIV;
};

this.findSlash =
function(path, at) {
  ASSERT.call(this, arguments.length === 2, 'arguments');
  return path.indexOf('/', at);
};

this.findLastSlash =
function(path, at) {
  ASSERT.call(this, arguments.length === 2, 'arguments');
  return path.lastIndexOf('/', at);
}; 

// tail(a/b) -> b; tail(a) -> ""
this.tail =
function(path) {
  var slash = this.findLastSlash(path, path.length);
  if (slash === -1)
    return "";
  ++slash;
  return slash >= path.length ? "" : path.substring(slash);
};

// head(a/b) -> a; head(a) -> ""
this.head =
function(path) {
  var slash = this.findLastSlash(path, path.length);
  return slash === -1 ? "" : slash === 0 ? path.charAt(0) : path.substring(0, slash);
};
 
this.len =
function(path, start) {
  if (start >= path.length)
    return 0;
  var tail = -1;
  if (this.isSlash(path, start))
    tail = start + 1;
  else {
    tail = this.findSlash(path, start);
    if (tail === -1) 
      tail = path.length;
  }
  while (path.length > tail && this.isSlash(path, tail))
    tail++;
  return tail - start;
};

this.trimSlash =
function(path) {
  return path !== '/' && this.isSlash(path, path.length-1) ?
    path.substring(0, path.length-1) : path;
};

this.trimAll =
function(path) {
  var slash = this.findSlash(path, 0);
  return slash === -1 ? path :
    slash === 0 ? path.charAt(0) : path.substring(0,slash);
};

this.hasTailSlash =
function(path) {
  return this.isSlash(path, path.length-1) ;
};

this.hasHeadSlash =
function(path) {
  return this.isSlash(path, 0);
};

this.joinRaw =
function(a, b, nd) {
  if (this.hasHeadSlash(b))
    return b;
  if (b === '.' && nd)
    return a;
  a = this.trimSlash(a);
  if (a != '/') a += '/';
  return a + b
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

this.getDecl_nearest =
function() {
  if (this.targetDecl_nearest !== null)
    return this.targetDecl_nearest;
  var ref = this.parentRef;
  while (ref) {
    if (ref.targetDecl_nearest)
      return this.targetDecl_nearest = ref.targetDecl_nearest;
    ref = ref.parentRef;
  }

  ASSERT.call(this, false, 'ref unresolved');
};

this.getDecl_real =
function() {
  return this.getDecl_nearest().getDecl_real();
};

this.assigned =
function() {
  // TODO: assert target ref is not a relocated ref (i.e., it is a master decl)
  var targetRef = this.getDecl_nearest().ref;
  if (targetRef.lhs < 0)
    targetRef.lhs = 0;
  return targetRef.lhs++;
};

}]  ],
[ResourceResolver.prototype, [function(){
// TODO: fetch nodes based on id's, such that, in case the uri's 'a/b' and 'l/e' both point to the same file on a disk, and we have only saved 'a/b', this.get('l/e') returns the 
// same node saved under 'a/b' (by the way, this is more of a bundler's job than a resource loader's)

this.hasInCache =
function(uri) {
  return HAS.call(this.savedNodes, _m(uri));
};

this.loadCached =
function(uri) {
  var mname = _m(uri);
  return HAS.call(this.savedNodes, mname) ?
    this.savedNodes[mname] : null;
};

this.cache =
function(uri, n) {
  var mname = _m(uri);
  ASSERT.call(this, !this.hasInCache(uri), 'existing');
  this.savedNodes[mname] = n;
};

this.loadNew =
function(uri) {
  ASSERT.call(this, !this.hasInCache(uri), 'existing');
  return this.asNode(uri);
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
    if (ref && (ref.d || ref.i)) {
      if (isCatch)
        this.refDirect_m(mname, ref);
      else
        this.refInHead(mname, ref);
    }
    e++;
  }
  this.inBody = false;
};

},
function(){
this.spReportGlobal_m =
function(mname, ref) {
  var globalBinding = this.findGlobal_m(mname);

  if (globalBinding) {
    ASSERT.call(this, this.isBundle(), 'not');
    globalBinding.refreshRSListWithList(ref.rsList);
    ref.parentRef = globalBinding.ref;
  }
  else {
    globalBinding = new Decl().t(DT_GLOBAL).r(ref).n(_u(mname));
    this.insertGlobal_m(mname, globalBinding);
  }

  ref.scope = this;
  return globalBinding;
};

this.insertGlobal_m =
function(mname, global) {
  ASSERT.call(this, this.isGlobal() || this.isBundle(), 'global or bundler' );
  ASSERT.call(this, global.isGlobal(), 'global');
  ASSERT.call(this, this.defs.has(mname) === false, 'existing');

  return this.defs.set(mname, global);
};

this.findGlobal_m =
function(mname) {
  var global = null;
  if (this.defs.has(mname)) {
    global = this.defs.get(mname);
    ASSERT.call(this, global.isGlobal(), 'not');
  }
  return global;
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

  ASSERT.call(this, this.isSourceLevel(),
    'a script scope was expected');

  ASSERT.call(this, this.parent.isGlobal() || this.parent.isBundle(),
    'script must have a parent scope with type global');

  if (ref_this_m(mname))
    return this.spCreate_this(ref);

  return this.parent.spReportGlobal_m(mname, ref);
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
  return this.isScript() || this.isAnyFn() || this.isCatch() || this.isModule() || this.isBundle() || this.isGlobal();
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

this.getThisBase =
function() { return this.scs; };

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
  return nd.ref.scope === this /* && (!nd.isImported()) */;
};

this.determineFlags =
function() {
  if (this.isParen())
    return this.parent.flags;

  var fl = SF_NONE;
  if (!this.parent) {
    ASSERT.call(this, this.isGlobal() || this.isBundle(),
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

this.setSynthBase =
function(base) {
  ASSERT.call(this, this.synthBase === this.scs, 'synth-base is not intact');
  ASSERT.call(this, base.isConcrete(), 'base' );
  this.synthBase = base;
};

this.getSourceLevelScope =
function() {
  var l = this.sourceScope ; // up
  if (l === null) {
    var u = this.parent;
    while (u) {
      if (u.isSourceLevel()) {
        l = this.sourceScope = u;
        break;
      }
    }
    ASSERT.call(this, u, 'source-scope ' );
  }
  return l;
};

},
function(){
this.declareHoisted_m =
function(mname, t) {
  var tdecl = this.findDeclAny_m(mname);

  if (tdecl) {
    if (tdecl.isOverridableByVar()) {
      tdecl.type |= t;
      return tdecl;
    }
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
  else { tdecl.type |= t; tscope = tdecl.ref.scope; }

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

//if (this.isCatch() && !this.inBody )
//  return this.args.has(mname) ?
//    this.args.get(mname) : null;

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
    newDecl.ref = ref; // unnecessary; also, no Decl::`r() is needed -- `ref.hasTarget` holds
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
  var list = this.defs, e = 0, len = list.length(), insertSelf = this.isCatch() && !this.argIsSimple;
  while (e < len) {
    var tdclr = list.at(e++);
    if (this.owns(tdclr) && !tdclr.isFnArg() &&
      !(tdclr.isCatchArg() && this.argIsSimple)) {
      if ( tdclr.isImported())
        ASSERT.call(this, this.isSourceLevel(), 'not' );
      else {
        targetScope.synthDecl(tdclr);
        insertSelf && this.insertSynth_m(_m(tdclr.synthName), tdclr);
      }
    }
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

  var list = this.keys;
  var i = list.length - 1; // slighty optimize for pops

  while (name !== list[i])
    i--;

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

this.pop = function(out) {
  var list = this.keys;
  ASSERT.call(this, list.length, 'len' );
  var name = list.pop();
  var elem = this.obj[name]; delete this.obj[name];
  if (out) { out.name = name; out.value = elem; }
  else out = elem;
  return out;
};

}]  ],
[SourceScope.prototype, [function(){
this.regulateForwardExportList =
function(list, src) {
  var sourceImported = this.gocSourceImported(src.value);
  var l = 0;
  while (l < list.length)
    this.regulateForwardExport(list[l++], sourceImported );
};

this.regulateForwardExport =
function(ex, sourceImported) {
  var entry = ex['#entry'];
  var nd = this.createImportedBinding(ex.local, DT_EFW);
  this.addImportedAlias_ios(nd, entry.innerName /* or outerName */, sourceImported );
  ASSERT.call(this, entry.target === null, 'entry');
  entry.target = entry.target || { prev: null, v: nd, next: null };
};

this.regulateOwnExportList =
function(list) {
  var l = 0;
  while (l < list.length)
    this.regulateOwnExport(list[l++]['#entry']);
};

this.regulateOwnExport =
function(entry) {
  var mname = _m(entry.innerName), nd = this.findDeclAny_m(mname);
  entry.target = nd ?
    {p: null, v: nd, n: null} :
    this.focUnresolvedExportedTarget(entry.innerName);
};

this.registerForwardedSource =
function(src) {
  var mname = _m(src.value);
  if (this.allSourcesForwarded.has(mname))
    return;

  this.allSourcesForwarded.set(mname, null);

  this.allSourcesImported.has(mname) ||
  this.allSourcesImported.set(mname, null);
};

this.refreshUnresolvedExportsWith =
function(n) {
  var mname = _m(n.name);
  var target = this.allUnresolvedExports.has(mname) ?
    this.allUnresolvedExports.get(mname) : null;
  if (target === null)
    return;

  ASSERT.call(this, target.v === null, 'target' );
  this.allUnresolvedExports.set(mname, null);

  target.v = n;
  var tp = target.prev, tn = target.next;
  if (target === this.latestUnresolvedExportTarget)
    this.latestUnresolvedExportTarget = tp;

  tp && (tp.next = tn);
  tn && (tn.prev = tp);

  target.next = target.prev = null;
};

this.registerExportedEntry_oi =
function(outerName, outerID, innerName) {
  var mname = _m(outerName);
  var entry = this.allNamesExported.has(mname) ?
    this.allNamesExported.get(mname) : null;
  entry && this.err('existing.export');
  return this.allNamesExported.set(
    mname, {innerName: innerName, outerName: outerName, target: null, outerID: outerID});
};

this.focUnresolvedExportedTarget =
function(name) {
  var mname = _m(name);
  if (this.allUnresolvedExports.has(mname))
    return this.allUnresolvedExports.get(mname);

  var target = null;
  target = { prev: null, v: null, next: null };

  var luet = this.latestUnresolvedExportTarget;
  this.latestUnresolvedExportTarget = target;
  if (luet) { luet.next = target; target.prev = luet; }

  return this.allUnresolvedExports.set(mname, target  );
};

},
function(){
this.regulateImports_sl =
function(src, list) {
  var sourceImported = this.gocSourceImported(src.value);
  var e = 0;
  while (e < list.length) {
    var item = list[e++], target = item['#decl'];
    this.addImportedAlias_ios(
      target,
      target.isIAliased() ? item.imported.name :
      target.isIDefault() ? '*default*' : '*', sourceImported
    );
  }
};

this.addImportedAlias_ios =
function(inner, outer, sourceImported) {
  var aliases = this.gocAliasesImported(sourceImported, outer);
  aliases.push(inner);
};

this.gocSourceImported =
function(src) {
  var mname = _m(src);
  var im = this.allSourcesImported.has(mname) ?
    this.allSourcesImported.get(mname) : null;

  return im || this.allSourcesImported.set(mname, new SortedObj());
};

this.declareImportedName =
function(id, t) {
  var mname = _m(id.name);
  var existing = this.findDeclAny_m(mname);
  existing && this.err('existing.binding.for.import');

  var nd = this.createImportedBinding(id, t);
  nd.r(this.rocRefU_m(mname));
  this.insertDecl_m(mname, nd);
  this.refreshUnresolvedExportsWith(nd );

  return nd;
};

this.gocAliasesImported =
function(sourceImported, outerName) {
  var mname = _m(outerName);
  return sourceImported.has(mname) ? 
    sourceImported.get(mname) :
    sourceImported.set(mname, []);
};

this.createImportedBinding =
function(id, t) {
  var nd = new Decl()
  nd.t(t).s(id).n(id.name);
  return nd;
};

},
function(){
this.forwardsSource =
function(src) {
  return this.allSourcesForwarded.has(_m(src));
};

this.fillForwardedSourceEntryWith =
function(fw, scope ) {
  var mname = _m(fw);
  ASSERT.call(this, this.allSourcesForwarded.has(mname) &&
    this.allSourcesForwarded.get(mname) === null, 'not null');
  ASSERT.call(this, this.allSourcesImported.has(mname),
    'must also be in importsList');

  this.allSourcesForwarded.set(mname, scope);
};

},
function(){
this.satisfyWithBundler =
function(bundler) {
  var bundlerSources = bundler.freshSources;
  var allSourcesImported = this.allSourcesImported,
      e = 0, len = allSourcesImported.length();

  bundler.freshSources = [];

  while (e < len) {
    var sourcePath = _u(allSourcesImported.keys[e]);
    var exitPath = bundler.enter(sourcePath);
    var src = bundler.getExistingSourceNode();
    var isNew = false;
    if (src === null) {
      src = bundler.loadNewSource();
      src['#scope']['#loader'] = this['#uri'];
      isNew = true;
    }
    ASSERT.call(this, src, 'source not found: "'+sourcePath+'"' );

    var satisfierScope = src['#scope'];
    if (this.forwardsSource(sourcePath))
      this.fillForwardedSourceEntryWith(sourcePath, satisfierScope);

    if (isNew)
      src['#imports'] = src['#scope'].satisfyWithBundler(bundler);

    var entriesImported = allSourcesImported.at(e);
    entriesImported && satisfierScope.satisfyEntries(entriesImported );

    bundler.setURIAndDir(exitPath.uri, exitPath.dir);
    e++;
  }

  var im = bundler.freshSources;
  bundler.freshSources = bundlerSources;

  return im;
};

this.satisfyEntries =
function(list) {
  var len = list.length(), l = 0;
  while (l < len) {
    var name = _u(list.keys[l]);
    var bindingList = list.at(l), bi = 0;
    while (bi < bindingList.length)
      this.satisfyBindingWithName(bindingList[bi++], name);
    l++;
  }
};

this.satisfyBindingWithName =
function(binding, name) {
  var ex = this.searchExports(name, null);

  if (!ex) {
    console.error('Unresoved ['+name+'] in ['+this['#uri']+']');
    this.err('unresolved.name');
  }

  this.resolve1to2(binding, ex.ref.getDecl_real());
};

this.searchInOwnExports =
function(name) {
  var mname = _m(name);
  var entry = this.allNamesExported.has(mname) ?
    this.allNamesExported.get(mname) : null;
  if (entry) {
    ASSERT.call(this, entry.target.v, 'entry ['+name+'] in ['+this['#uri']+']'  );
    return entry.target.v;
  }
  return null;
};

this.searchExports =
function(name, soFar) {
  var ex = this.searchInOwnExports(name);
  if (ex === null) {
    if (soFar === null) soFar = {};
    soFar[this.ai] = this;
    ex = this.searchInForwardedExports(name, soFar);
  } 
  return ex;
};

this.searchInForwardedExports =
function(name, soFar) {
  var list = this.allSourcesForwarded, l = 0, len = list.length();
  var entry = null
  while (l < len) {
    var satisfier = list.at(l++);
    if (!HAS.call(soFar, satisfier.ai)) {
      entry = satisfier.searchExports(name, soFar);
      if (entry) break;
    }
  }
  return entry;
};

this.resolve1to2 =
function(slave, master) {
  ASSERT.call(this, master === master.ref.getDecl_real(), 'master');
  ASSERT.call(this, master !== slave, 'same');

  var slaveRef = slave.ref;
  if (slaveRef) {
//  slaveRef.hasTarget = false;
//  slaveRef.targetDecl = null;

    var slaveRSList = slaveRef.rsList, l = 0;
    if (master.rsMap === null)
      master.refreshRSListWithList(master.ref.rsList);

    master.refreshRSListWithList(slaveRef.rsList);
    master.refreshRSListWith(slaveRef.scope);

    ASSERT.call(this, slaveRef.parentRef === null, 'slaveRef');
    slaveRef.parentRef = master.ref;
  }
  else {
    ASSERT.call(this, slave.type & DT_EFW, 'slave' );
    slave.ref = master.ref;
  }

  master.ref.i += slaveRef.i;
  master.ref.d++; // TODO: must be exact
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
this.ac =
function(to, name, from) {
  if (from === null)
    return;
  ASSERT.call(this, from, 'from');
  if (!HAS.call(to, name))
    to[name] = from;
  else
    to[name].mergeWith(from );
};

this.gec0 =
function(cb, n) {
  return HAS.call(cb, n) ? cb[n] : null;
};

},
function(){
this.setCVTZ =
function(cvtz) {
  var l = this.cvtz;
  this.cvtz = cvtz;
  return l;
};

this.setRR =
function(reachedRef) {
  var rr = this.reachedRef;
  this.reachedRef = reachedRef;
  return rr;
};

this.setScope =
function(scope) {
  var cur = this.cur;
  this.cur = scope ;
  return cur;
};

this.setTS =
function(ts) {
  var ts0 = this.tempStack;
  this.tempStack = ts;
  return ts0;
};

this.setThis =
function(thisState) {
  var th = this.thisState;
  this.thisState = thisState;
  return th;
};

this.tr =
function(n, isVal) {
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

  return transformer.call(this, n, isVal);
};

this.rename =
function(base, i) { return this.renamer(base, i); };

},
function(){
this.getTCCache =
function(decl) {
  var mname =_m(decl.ref.scope.scopeID+':'+decl.name);
  return decl.ref.scope.reached ? this.cvtz[mname] :
    HAS.call(this.cvtz, mname) ? this.cvtz[mname] : CHK_NONE;
};

this.needsTZ =
function(decl) {
  if (!decl.isTemporal())
    return false;

  var tc = this.getTCCache(decl) ;
  if (tc && (tc & CHK_T))
    return false;

  TZ: {
    var tz = false;
    if (!decl.isReached()) {
      tz = true;
      break TZ; 
    }
    if (decl.isClassName())
      return tz;

    var ownerScope = decl.ref.scope, cur = this.cur;
    if (ownerScope === cur) {
      tz = false;
      break TZ;
    }
    while (cur.parent !== ownerScope) {
      cur = cur.parent;
      ASSERT.call(this, cur, 'reached top before decl owner is reached -- tz test is only allowed in scopes that '+
        'can access the decl');
    }
    tz = cur.isHoisted();
  }
  tz && this.cacheTZ(decl);
  return tz;
};

this.cacheTZ =
function(decl) {
  var tc = this.getTCCache(decl);
  if (tc)
    ASSERT.call(this, !(tc & CHK_T), 'cache');
  else
    tc = CHK_NONE;
  this.cvtz[_m(decl.ref.scope.scopeID+':'+decl.name)] = tc | CHK_T;
};

this.makeReached =
function(target) {
  ASSERT.call(this, target.reached === null, 'reached used');
  target.reached = this.reachedRef;
};

this.toResolvedName =
function(id, bes, manualActivation) {
  ASSERT.call(this, id.type == 'Identifier', 'no');

  var ref = id['#ref'], target = ref.getDecl_real();
  ASSERT.call(this, target, 'unresolved <'+id.name+'>');

  var isB = bes === 'binding';

  var hasTZ = !isB && this.needsTZ(target);
  if (hasTZ) {
    if (target.isClassName())
      return this.synthCheckForTZ(target, null, -1);

    target.activateTZ();
    this.accessTZ(target.ref.scope);
  }

  if (hasTZ) id['#cvtz'] |= CVTZ_T;

  id.type = '#-ResolvedName.' + bes;
  return id;
};

this.getDeclFor =
function(name, isB) {
  ASSERT.call(this, isB === true || isB === false, 'isB' );
  var target = null;
  if (isB)
    target = this.cur.findDeclAny_m(_m(name));
  else {
    var ref = this.cur.findRefAny_m(_m(name));
    ASSERT.call(this, ref, 'name is not used in the current scope: <'+name+'>');
    target = ref.getDecl_real();
  }
  return target;
};

this.synthCheckForTZ =
function(target, t, num) {
  this.accessJZ();
  return {
    liq: t,
    idx: num,
    kind: 'tzchk',
    type: '#Untransformed' ,
    target: target
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
TransformByLeft['ArrayPattern'] =
function(n, isVal, isB) {
  n.right = this.tr(n.right, true);

  var s = [],
      t = this.saveInTemp(this.synth_ArrIter(n.right), s),
      list = n.left.elements,
      idx = 0,
      tElem = null;

  var cbl = CB(n.left);
  while (idx < list.length) {
    var elem = list[idx];
    tElem = this.trArrayElem(elem, t, idx, isB, cbl);
    tElem && s.push(tElem);
    idx++;
  }

  tElem = this.synth_ArrIterEnd(t);
  tElem && s.push(tElem);

  this.releaseTemp(t);

  var res = this.synth_AssigList(s); // result
  var cb = CB(res);

  this.ac(cb, 'bef', this.gec0(cbl, 'bef'));
  this.ac(cb, 'inner', this.gec0(cbl, 'inner'));
  this.ac(cb, 'left.aft', this.gec0(cbl, 'aft'));
  this.ac(cb, 'aft', this.gec0(CB(n), 'aft'));

  return res;
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

  var res = this.synth_AssigList(s);
  var cb = CB(res), cbl = CB(n.left);

  this.ac(cb, 'bef', this.gec0(cbl, 'bef'));
  this.ac(cb, 'inner', this.gec0(cbl, 'inner'));
  this.ac(cb, 'left.aft', this.gec0(cbl, 'aft'));
  this.ac(cb, 'aft', this.gec0(CB(n), 'aft'));

  return res;
};

TransformByLeft['AssignmentPattern'] =
function(n, isVal, isB) {
  var l = n.left.left;
  var d = n.left.right;
  var r = n.right;

  ASSERT.call(this, r.type === '#Untransformed',
    'assignment pattern can not have a transformable right');

  var t = this.allocTemp();

  var test = this.synth_U(this.synth_TempSave(t, r) || t);
  this.releaseTemp(t);

//var cvtz = this.setCVTZ(createObj(this.cvtz));
  var consequent = /* this.tr(d, true) */ d;
//this.setCVTZ(cvtz);

  var assig = this.synth_SynthAssig(
    l,
    this.synth_UCond(test, consequent, t, (true)),
    isB
  );

  var res = this.tr(assig, isVal);
  var cb = CB(res);

  this.ac(cb, 'aft', this.gec0(CB(n.left), 'aft'));
  return res;
};

TransformByLeft['MemberExpression'] =
function(n, isVal, isB) {
  ASSERT_EQ.call(this, isB, false);
  if (n.operator === '**=') {
    var mem = n.left;
    mem.object = this.tr(mem.object, true );
    var t1 = this.allocTemp();
    mem.object = this.synth_TempSave(t1, mem.object);
    var t2 = null;
    if (mem.computed) {
      mem.property = this.tr(mem.property, true);
      t2 = this.allocTemp();
      mem.property = this.synth_TempSave(t2, mem.property);
      this.releaseTemp(t2);
    } else
      t2 = mem.property;

    this.releaseTemp(t1);
    var r = this.tr(n.right, true );

    n.left = mem;
    n.operator = '=';

    var sm = this.synth_node_MemberExpression(t1,t2);
    sm.computed = mem.computed;
    sm.loc = mem.loc;
    sm['#acloc'] = mem['#acloc'];

    n.right = this.synth_node_BinaryExpression(sm, '**', r);
  } else {
    n.left = this.trSAT(n.left);
    n.right = this.tr(n.right, true);
  }
  return n;
};

TransformByLeft['Identifier'] =
function(n, isVal, isB) {
  n.right = this.tr(n.right, true);
  var rn = n.left = this.toResolvedName(n.left, isB ? 'binding' : 'sat', true); // target
  if (!isB) {
    var l = tg(n.left);
    l.ref.assigned();
    if (this.needsCVLHS(l)) {
      n.left['#cvtz'] |= CVTZ_C;
      this.cacheCVLHS(l);
    }
    else if (l.isRG())
      n = this.synth_GlobalUpdate(n, false);
  }

  if (tzc(rn) || cvc(rn))
    n.right = this.synth_TC(n.right, n.left)

  if (isB) {
    var target = tg(n.left);
    if (!target.isReached())
      this.makeReached(target);
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
function(left, iter, at, isB, cbn) {
  var right = null, rest_cb = null;
  if (left && left.type === 'RestElement') {
    right = this.synth_ArrIterGetRest(iter, at);
    rest_cb = CB(left);
    left = left.argument;
  }
  else
    right = this.synth_ArrIterGet(iter, at);

  if (left === null) {
    if (cbn.h < cbn.holes.length) {
      var h = cbn.holes[cbn.h];
      if (h[0] <= at) {
        this.ac(CB(right), 'bef', h[1]);
        cbn.h++;
      }
    }
    return right;
  }

  var assig = this.synth_SynthAssig(left, right, isB);

  var res = this.tr(assig, false), cb = CB(res);
  if (rest_cb) {
    this.ac(cb, 'bef', this.gec0(rest_cb, 'bef'));
    this.ac(cb, 'aft', this.gec0(rest_cb, 'aft'));
  }
  return res;
};

this.trObjElem =
function(elem, iter, isB) {
  var name = elem.key;
  if (elem.computed)
    name = elem.key = this.tr(name, true );

  var right = this.synth_ObjIterGet(iter, name, elem.computed);
  var left = elem.value;

  return this.tr(this.synth_SynthAssig(left, right, isB), false);
};

this.needsCVLHS =
function(decl) {
  if (!decl.isImmutable())
    return false;
  var tc = this.getTCCache(decl);
  if (tc && (tc & CHK_V))
    return false;
  return true;
};

this.cacheCVLHS =
function(decl) {
  var tc = this.getTCCache(decl);
  if (tc)
    ASSERT.call(this, !(tc & CHK_V), 'cache');
  else
    tc = CHK_NONE;
  this.cvtz[_m(decl.ref.scope.scopeID+':'+decl.name)] = tc | CHK_V;
};

},
function(){
Transformers['LogicalExpression'] =
function(n, isVal) {
  n.left = this.tr(n.left, true);
  var cvtz = this.setCVTZ(createObj(this.cvtz));
  var th = this.thisState;
  n.right = this.tr(n.right, true);
  this.thisState = th;
  this.setCVTZ(cvtz );
  return n;
};

Transformers['BinaryExpression'] =
function(n, isVal) {
  n.left = this.tr(n.left, true);
  n.right = this.tr(n.right, true);
  return n;
};

},
function(){
Transformers['BlockStatement'] =
function(n, isVal) {
  ASSERT_EQ.call(this, isVal, false);
  var bs = n['#scope'];
  if (bs.isCatch())
    bs = null;
  if (bs !== null) {
    var s = this.setScope(bs);
    this.cur.synth_defs_to(this.cur.synthBase);
  }
  this.trList(n.body, isVal);
  if (bs !== null) this.setScope(s);
  return n;
};

},
function(){
Transformers['BreakStatement'] =
function(n, isVal) {
  return n; // TODO: try { break } finally { yield }
};

},
function(){
Transformers['CallExpression'] =
function(n, isVal) {
  var ti = false, l = n.callee;
  if (l.type === 'Super') {
    l['#liq'] = this.cur.findRefU_m(RS_SCALL).getDecl_nearest();
    var th = this.cur.findRefU_m(RS_THIS).getDecl_nearest();
    l['#this'] = this.synth_BareThis(th);
    if (!(this.thisState & THS_IS_REACHED)) {
      ti = true;
      var lg = th.ref.scope.gocLG('ti'), li = lg.getL(0);
      if (li === null) { li = lg.newL(); lg.seal(); li.name = 'ti'; }
      l['#ti'] = li;
      li.track(this.cur); li.ref.d--;
    }
  }

  var si = findElem(n.arguments, 'SpreadElement');
  if (si === -1) {
    if (l.type !== 'Super')
      n.callee = this.tr(n.callee, true );
    this.trList(n.arguments, true );
    if (ti) { this.thisState |= THS_IS_REACHED; this.thisState &= ~THS_NEEDS_CHK; }
    return n;
  }

  this.accessJZ();

  var head = n.callee, mem = null;
  if ( head.type === 'MemberExpression') {
    head.object = this.tr(head.object, true);
    var loc = head.object.loc;
    var t = this.allocTemp();
    var h0 = head;
    head = this.synth_TempSave(t, head.object);
    h0.object = t;
    t.loc = loc;
    this.releaseTemp(t);
    if (h0.computed)
      h0.property = this.tr(h0.property, true );
    mem = h0;
  }
  else if (l.type === 'Super') {
    mem = l;
    head = this.synth_BareThis(this.cur.findRefU_m(RS_THIS).getDecl_nearest());
  }
  else
    head = this.tr(head, true );

  this.trList(n.arguments, true );

  if (ti) { this.thisState |= THS_IS_REACHED; this.thisState &= ~THS_NEEDS_CHK; }

  var synthcall = this.synth_Call(head, mem, n.arguments);
  synthcall.loc = n.loc;
  synthcall['#argloc'] = n['#argloc'];

  return synthcall;
};

},
function(){
// TODO: when transforming is done and the original cvtz is re-activated, it should be augment by the
// elements common between if.cvtz and else.cvtz; e.g., 12 ? l /* <-- tz */ : l() /* <-- tz */; /* cvtz += if.cvtz :@: else.cvtz let l = l /* has tz but no chk */
Transformers['ConditionalExpression'] =
function(n, isVal) {
  n.test = this.tr(n.test, true);
  var cvtz = this.setCVTZ(createObj(this.cvtz));
  var th = this.thisState;
  n.consequent = this.tr(n.consequent, isVal);
  var thc = this.thisState; this.thisState = th;
  this.setCVTZ(createObj(cvtz));
  n.alternate = this.tr(n.alternate, isVal);
  this.thisState = th|(this.thisState & thc); // same should be done for the tz/cv-thing, below
  this.setCVTZ(cvtz) ;
  return n;
};

},
function(){
Transformers['ContinueStatement'] =
function(n, isVal) {
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
Transformers['ForOfStatement'] =
function(n, isVal) {
  var s = this.setScope(n['#scope']);
  this.cur.synth_defs_to(this.cur.synthBase);

  var t = null;
  n.right = this.tr(n.right, true);
  t = this.allocTemp();
  var l = n.left; 
  n.left = t;

  var lead = null;
  var tval = this.synth_TVal(t), isVar = false, simp = true;
  if (l.type === 'VariableDeclaration' && l.kind !== 'var') {
    isVar = true;
    simp = l.declarations[0].id.type === 'Identifier'; 
    l.declarations[0].init = tval;
    lead = this.tr(l, false);
  }
  else
    lead = this.tr(this.synth_SynthAssig(l, tval, false), false);

  if (isVar)
    lead = this.synth_AssigList([this.synth_NameList(this.cur, true), lead]);

  n.body = this.tr(n.body, false);
  if (n.body.type === 'BlockStatement')
    n.body['#lead'] = lead;
  else
    n.body = this.synth_AssigList([lead, n.body]);

  this.releaseTemp(t);

  n.type = '#ForOfStatement';
//if (isVar && simp)
//  n = this.synth_AssigList([this.synth_NameList(this.cur, false), n]);

  this.setScope(s);

  return n;
};

Transformers['ForInStatement'] =
function(n, isVal) {
  var left = n.left;
  var simp = true;
  var s = this.setScope(n['#scope']);

  this.cur.synth_defs_to(this.cur.synthBase );
  var isVar = false;
  if (left.type === 'VariableDeclaration') {
    isVar = true;
    var elem = left.declarations[0];
    left = elem.init === null ? elem.id : { // TODO: ugh
      type: 'AssignmentPattern',
      right: elem.init,
      left: elem.id,
      end: elem.init.end,
      loc: { start: elem.id.loc.start, end: elem.init.loc.end },
      start: elem.id.start,
      '#c': {}
    };

    n.left = left;
    simp = left.type === 'Identifier';
  }

  var lead = null, t = left.type ;

  if (t === 'Identifier') // TODO: must also handle renamedGlobals
    TransformByLeft['Identifier'].call(this, n, false, isVar);
  else if (t === 'MemberExpression') {
    n.right = this.tr(n.right, true);
    n.left = this.trSAT(n.left);
  }
  else {
    n.right = this.tr(n.right, true);
    var t = this.allocTemp(); this.releaseTemp(t);
    var assig = this.synth_SynthAssig(n.left, t, isVar);
    lead = this.tr(assig, false );
    n.left = t;
  }

  if (isVar && !simp) {
    var a = [this.synth_NameList(this.cur, true)];
    if (lead) a. push(lead );
    lead = this.synth_AssigList(a);
  }

  n.body = this.tr(n.body,false);
  if (n.body.type === 'BlockStatement')
    n.body['#lead'] = lead;
  else if (lead)
    n.body = this.synth_AssigList([lead, n.body]);

  n.type = (isVar && simp) ? '#ForInStatementWithDeclarationHead' : 
    '#ForInStatementWithExHead';

  if (isVar && simp)
    n = this.synth_AssigList([this.synth_NameList(this.cur, false), n]);

  this.setScope(s);
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
  var altax = n['#elseScope'], conax = n['#ifScope'];

  n.test = this.tr(n.test, true);

  var s = this.setScope(conax);
  n.consequent = this.tr(n.consequent, false);

  if (n.alternate) {
    this.setScope(altax);
    n.alternate = this.tr(n.alternate, false);
  }

  this.setScope(s);

  return n;
};

},
function(){
Transformers['LabeledStatement'] =
function(n, isVal) {
  n.body = this.tr(n.body, false );
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
  var t = null;
  if (n['#rest'] >= 0)
    t = n['#t'] = this.allocTemp();
  var list = n.properties, e = 0;
  while (e < list.length) {
    var elem = list[e++];
    if (elem.computed)
      elem.key = this.tr(elem.key, true);
    elem.value = this.tr(elem.value, true);
  }
  t && this.releaseTemp(t);
  return n;
};

},
function(){
Transformers['ReturnStatement'] =
function(n, isVal) {
  // TODO: try { return 'a' /* <-- this */ } finally { yield 'b' }
  if (n.argument)
    n.argument = this.tr(n.argument, true);
  var retRoot = this.cur.scs;
  RET:
  if (retRoot.isCtor() && retRoot.parent.hasHeritage()) {
    var lg = retRoot.gocLG('ti'), l = lg.getL(0);
    if (l===null) { l = lg.newL(); lg.seal(); l.name = 'ti'; }
    if ((this.thisState & THS_IS_REACHED) || !(this.thisState & THS_NEEDS_CHK)) break RET;
    l.track(this.cur);
    n.argument = this.synth_RCheck(n.argument, l);
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
  n. discriminant = this.tr(n.discriminant, true);
  var s = this.setScope(n['#scope']);
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
Transformers['TaggedTemplateExpression'] =
function(n, isVal) {
  n.tag = this.tr(n.tag, true);
  n.quasi = this.tr(n.quasi, true);

  return n;
};

},
function(){
Transformers['TemplateLiteral'] =
function(n, isVal) {
  var list = n.expressions, l = 0;
  while (l < list.length) {
    var item = list[l];
    list[l] = this.tr(item, true);
    l++;
  }
  return n;
};

},
function(){
Transformers['ThisExpression'] =
function(n, isVal) {
  var ref = this.cur.findRefU_m(RS_THIS);
  ASSERT.call(this, ref, 'could not find [:this:]');
  var th = ref.getDecl_nearest();
  var ths = this.thisState;
  if ((ths & THS_NEEDS_CHK) && !(ths & THS_IS_REACHED)) {
    var lg = th.ref.scope.scs.gocLG('ti');
    var ti = lg.getL(0);
    if (ti === null) { ti = lg.newL(); ti.name = 'ti'; lg.seal(); }
    ti.track(this.cur);

    // that is, no longer check; but, TODO: better make this optimization optional to turn off
    // class A extends L { constructor() { this/* <-- need */; this /* <-- needn't since the previous one has done it */ } }
    this.thisState &= ~THS_NEEDS_CHK;

    return this.synth_ResolvedThis(n, th, true);
  }

  return this.synth_ResolvedThis(n, th, false);
};

},
function(){
Transformers['ThrowStatement'] =
function(n, isVal) {
  n.argument = this.tr(n.argument, true);
  return n;
};

},
function(){
Transformers['TryStatement'] =
function(n, isVal) {
//var s = this.setScope(n['#tryScope']);
//this.cur.synth_defs_to(this.cur.scs);
  n.block = this.tr(n.block, false);
//this.setScope(s);

  if (n.handler)
    n.handler = this.transformCatch(n.handler);

  if (n.finalizer) {
//  s = this.setScope(n['#finScope']);
    n.finalizer = this.tr(n.finalizer, false);
//  this.setScope(s);
  }
 
  return n;
};

this.transformCatch =
function(n) {
  var a = null, s = this.setScope(n['#scope']);
  ASSERT.call(this, !this.inBody, 'inside catch' );

  if (this.cur.argIsSimple) {
    this.cur.argIsSignificant = true;
    this.cur.synth_start(this.renamer);
  }
  else {
    this.cur.synth_start(this.renamer);
    a = this.transformCatchArgs(n);
  }
  this.cur.activateBody();
  n.body = this.tr(n.body, false);
  this.cur.deactivateBody();
  this.cur.argIsSignificant || this.cur.synth_lcv();
  n.body['#lead'] = a;
  this.setScope(s);
  return n;
};

this.transformCatchArgs =
function(n) {
  ASSERT.call(this, !this.cur.argIsSimple, 'catch' );
  var l = this.synth_SynthAssig(n.param, this.synth_SynthName(this.cur.catchVar), true);

  return this.tr(l, false);
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
    tg(arg).ref.assigned();
    var leftsig = false;
    if (this.needsCVLHS(tg(arg))) {
      arg['#cvtz'] |= CVTZ_C;
      this.cacheCVLHS(tg(arg));
    }
    if (tg(arg).isRG())
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
  return s.length === 1 ? s[0] : this.synth_AssigList(s);
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
  var w = n['#scope'];
  var l = this.setScope(w);
  n.body = this.tr(n.body, false);

  this.setScope(l);

  return n;
};

},
function(){
this.transformCls =
function(n, isVal, oBinding) { // o -> outer
  var scope = this.setScope(n['#scope']), ex = oBinding === null;
  var ctor = n['#ct'] && n['#ct'].value, reached = {v: true};
  var list = [];

  var tempsup = null, tempsupSave = null, s = null;
  if (n.superClass) {
    n.superClass = this.synth_Heritage(this.tr(n.superClass, true));
    tempsup = this.allocTemp();
    tempsupSave = this.synth_TempSave(tempsup, n.superClass);
    s = ctor && ctor['#scope'].spSuperCall;
  }

  if (null === ctor) ctor = this.syntheticCtor(n, tempsup);
  else {
    ctor = this.transformCtor(ctor, oBinding, reached);
    if (s) { ctor.scall = { inner: s, outer: tempsup } };
  }
  var clsTemp = null;
  var classSave = null;
  if (ex) {
    clsTemp = this.allocTemp();
    classSave = this.synth_TempSave(clsTemp, ctor);
  } else
    classSave = this.synth_ClassSave(oBinding, ctor);

  var jzCreateCls = this.synth_MakeClass(clsTemp, tempsup, oBinding);
  var tproto = null;

  var memList = n.body.body, i = 0;
  var m = 0;
  while (i < memList.length) {
    var elem = memList[i];
    if (elem.kind === 'constructor') {
      memList[i++] = null;
      continue;
    }
    if (m === 0) {
      tproto = tempsup || this.allocTemp();
      jzCreateCls = this.synth_TempSave(tproto, jzCreateCls);
    }
    if (elem.computed)
      elem.key = this.tr(elem.key, true);
    var mem = elem.value = this.transformMem(elem.value, oBinding, reached);
    if (mem.cls) mem.cls.outer = clsTemp;
    m++;
    i++;
  }

  tempsupSave && list.push(tempsupSave );
  list. push(classSave);
  list. push(jzCreateCls);

  if (m) {
    var classcut = this.synth_MemList(memList, tproto);
    list. push(classcut);
  }

  if (isVal) {
    ASSERT.call(this, oBinding === null, 'binding');
    ASSERT.call(this, clsTemp !== null, 'cls');
    list.push(clsTemp);
  }

  tproto && tproto !== tempsup && this.releaseTemp(tproto);
  clsTemp && this.releaseTemp(clsTemp);
  tempsup && this.releaseTemp(tempsup );

  oBinding && this.makeReached(oBinding);
  this.setScope(scope);

  var cls = this.synth_AssigList(list); // transformed cls
  cls.raw = n;
  cls.loc = n.loc;
  return cls;
};

this.transformCtor =
function(ctor, oBinding, r) {
  var r0 = null;
  if (oBinding) {
    r0 = oBinding.reached;
    oBinding.type |= DT_CLSNAME;
    oBinding.reached = r;
    ctor = this.transformRawFn(ctor, true) ;
    oBinding.reached = r0;
    oBinding.type &= ~DT_CLSNAME;
    return ctor;
  }
  var scope = ctor['#scope'];
  REF: { 
    var clsName = ctor['#scope'].parent.scopeName;
    if (clsName === null) break REF;
    var ref = scope.findRefU_m(_m(clsName.name));
    if (ref === null || ref.getDecl_nearest() !== clsName) break REF;
    var sn = scope.scopeName = new ScopeName(clsName.name, null).t(DT_FNNAME); 

    sn.r(new Ref(scope));

    ref.hasTarget = false;
    ref.parentRef = null;
    ref.targetDecl_nearest = null;
    sn.ref.absorbDirect(ref);
  }

  return this.transformExprFn(ctor);
};

this.transformMem =
function(mem, oBinding, r) {
  var r0 = null, scope = mem['#scope'], cls = scope.parent;
  if (oBinding) {
    r0 = oBinding.reached;
    oBinding.type |= DT_CLSNAME;
    oBinding.reached = r;
    mem = this.transformExprFn(mem);
    oBinding.reached = r0;
    oBinding.type &= ~DT_CLSNAME;
    return mem;
  }

  var sn = null;
  REF:
  if (cls.scopeName && !cls.scopeName.isInsignificant()) {
    sn = cls.scopeName;
    var ref = scope.findRefU_m(_m(sn.name));
    if (ref === null) { sn = null; break REF; }
    ASSERT.call(this, sn === ref.getDecl_nearest(), 'sn' );
    sn = new ScopeName(sn.name, null).t(DT_CLSNAME);
    ASSERT.call(this,scope.parent.isClass(),'cls');
    sn.r(new Ref(scope.parent));

    ref.hasTarget = false;
    ref.parentRef = null;
    ref.targetDecl_nearest = null;
    sn.ref.absorbDirect(ref);

    this.makeReached(sn);
    this.synthFnExprName(sn);
  }

  mem = this.transformExprFn(mem);
  if (sn) mem.cls = { inner: sn, outer: null };

  return mem;
};

this.syntheticCtor =
function(cls, heritage) {
  return {
    kind: 'synthc',
    heritage: heritage,
    name: cls['#scope'].scopeName,
    type: '#Untransformed'
  };

};

Transformers['ClassExpression'] =
function(n, isVal) {
  return this.transformCls(n, isVal, null);
};

Transformers['ClassDeclaration'] =
function(n, isVal) {
  var target = tg(n.id );
  return this.transformCls(n, isVal, target);
};

},
function(){
Transformers['ExportNamedDeclaration'] = 
function(n, isVal) {
  // TODO: transform local names to rns when bundling is not active

  // console.error('transform#ExportNamedDeclaration', n);
  if (n.declaration !== null)
    n.declaration = this.tr(n.declaration, false);

  n.type = '#' + n.type ;
  return n;
};

Transformers['ExportDefaultDeclaration'] =
function(n, isVal) {
  var elem = n.declaration;
  var isVal = true;
  switch (elem.type) {
  case 'FunctionDeclaration':
    if (elem.id === null)
      elem.type = 'FunctionExpression';
    else
      isVal = false;
    break;
  case 'ClassDeclaration':
    if (elem.id === null)
      elem.type = 'ClassExpression';
    else
      isVal = false;
    break;
  }

  n. declaration = this.tr(elem, isVal);
  n.type = '#' + n.type ;

  return n;
};

Transformers['ExportAllDeclaration'] =
function(n, isVal) {
  n.type = '#' + n.type ;
  return n;
};

Transformers['ImportDeclaration'] =
function(n, isVal) {
  n.type = '#' + n.type ;
  return n; 
};

},
function(){
this.transformRawFn =
function(n, isVal) {
  var s = n['#scope'];
  s = this.setScope(s);
  ASSERT.call(this, s.reached, 'not reached');
  var unreach = n.type === 'FunctionDeclaration';
  if (unreach) s.reached = false;

  var cvtz = this.setCVTZ(createObj(this.cvtz));
  var ts = this.setTS([]);
  var th = this.thisState, lg = null, l = null;

  if (this.cur.isCtor() && this.cur.parent.hasHeritage()) {
    lg = this.cur.gocLG('ti');
    l = lg.getL(0);
    if (l===null) { l = lg.newL(); lg.seal(); l.name = 'ti'; }
  }

  this.cur.closureLLINOSA = this.cur.parent.scs.isAnyFn() ?
    createObj(this.cur.parent.scs.closureLLINOSA) : {};

  this.cur.synth_start(this.renamer);
  ASSERT.call(this, !this.cur.inBody, 'inBody');

  if (n.type === 'FunctionDeclaration') {
    var out = s.scs;
    this.thisState = out.isCtor() && out.parent.hasHeritage() ? THS_NEEDS_CHK : THS_NONE;
  }

  var argsPrologue = this.transformParams(n.params);
  if (argsPrologue) n.params = null;

  if (n.type === 'ArrowFunctionExpression')
    this.thisState = th;
  else
    this.thisState = this.cur.isCtor() && this.cur.parent.hasHeritage() ?
      THS_NEEDS_CHK : THS_NONE;

  this.cur.activateBody();
  var fnBody = n.body.body;
  this.trList(fnBody, false);

  if (l && !(this.thisState & THS_IS_REACHED) && (this.thisState & THS_NEEDS_CHK)) {
    var len = fnBody.length;
    if (len === 0 || fnBody[len-1].type !== 'ReturnStatement') {
      l.track(this.cur);
      fnBody.push(this.synth_RCheck(null, l));
    }
  }

  this.cur.deactivateBody();
  this.cur.synth_finish();

  if (unreach) {
    ASSERT.call(this, !s.reached, 'reached');
    s.reached = true;
  }

  this.setScope(s);

  this.setCVTZ(cvtz) ;
  this.thisState = th;

  return this.synth_TransformedFn(n, argsPrologue);
};

this.transformDeclFn =
function(n) {
  var target = tg(n.id);
  ASSERT.call(this, target, 'unresolved ('+n.id.name+')');
  n = this.transformRawFn(n, false);
  n.target = target;
  return n;
};

this.transformExprFn =
function(n) {
  var sn = n['#scope'].scopeName;
  if (sn) sn.isInsignificant() || this.synthFnExprName(sn);
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

  return this.synth_Skip();
};

Transformers['ArrowFunctionExpression'] =
function(n, isVal) {
  if (n.expression) 
    n.body = this.e2b(n.body);
  return this.transformExprFn(n);
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
//ASSERT.call(this, fnName.ref.scope.isExpr() || fnName.ref.scope.isCtor(), 'fn not an expr');
  var baseName = fnName.name, mname = "", synthName = this.rename(baseName, 0), num = 0;
  var rsList = fnName.ref.rsList;

  RENAME:
  do {
    mname = _m(synthName);
    var synth = null;
    var l = 0;

    while (l < rsList.length) {
      var scope = rsList[l++ ];
      if (!scope.synth_ref_may_escape_m(mname, this.renamer))
        continue RENAME;

      synth = scope.synth_ref_find_homonym_m(mname, this.renamer);
      if (synth && synth !== fnName)
        continue RENAME;
    }

    break;
  } while (synthName = this.rename(baseName, ++num), true);

  fnName.synthName = synthName;
};

this.e2b =
function(ex) {
  return {
    type: 'BlockStatement',
    body: [{
      type: 'ReturnStatement',
      argument: ex,
      start: ex.start,
      end: ex.end,
      loc: ex.loc,
      '#c': {}, '#y': 0
    }],
    start: ex.start,
    end: ex.end,
    loc: ex.loc, '#c': {}, '#y': 0
  };
};

},
function(){
// Transformers['ForOfStatement'] = function(n, isVal) { return n; };
// Transformers['ForInStatement'] = function(n, isVal) { return n; };
Transformers['ForStatement'] = function(n, isVal) { return n; };

},
function(){
Transformers['#Bundler'] =
function(n, isVal) {
  var bs = n.bundleScope ;
  bs.synth_globals(this.renamer);
  n.rootNode = this.transformBundleItem(n.rootNode);

  return n;
};

this.transformBundleItem =
function(n) {
//n['#scope'].setSynthBase(this.bundleScope);
  // console.error('transforming', n);
  var list = n['#imports'], len = list ? list.length : 0, l = 0;

  while (l < len) {
    list[l] =
      this.transformBundleItem(list[l]);
    l++;
  }

  return this.tr(n, false);
};

},
function(){
Transformers['DoWhileStatement'] =
function(n, isVal) {
  var w = n['#scope'];
  var s = this.setScope(w);
  n.body = this.tr(n.body, false);
  this.setScope(s);
  n.test = this.tr(n.test, true);

  return n;
};

},
function(){
Transformers['Program'] =
function(n, isVal) {
  ASSERT_EQ.call(this, isVal, false);
  this.script = n['#scope'];

  var g = this.global = this.script.parent;

  if (g.isGlobal())
    g.synth_globals(this.renamer);
  else
    ASSERT.call(this, g.isBundle(), 'script can not have a non-global parent');


  var ps = this.setScope(this.script);
  var ts = this.setTS([]);

  this.cur.synth_start(this.renamer);
  this.trList(n.body, isVal);
  this.cur.synth_finish();

  this.setScope(ps);
  this.setTS(ts);

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
    type: '#Untransformed',
    '#c': {},
    loc: null
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
    type: '#Untransformed',
    loc: expr.loc,
    '#c': {}
  };
};

this.synth_AssigList =
function(list) {
  return {
    kind: 'assig-list',
    type: '#Untransformed' ,
    list: list,
    '#c': {},
    raw: null, // cls-exclusive
    loc: null
  };
};

this.synth_UCond =
function(t,c,a,tr) {
  return {
    kind: 'ucond' ,
    test: t,
    consequent: c,
    type: tr ? 'ConditionalExpression' : '#Untransformed' ,
    alternate: a,
    '#c': {}
  };
};

this.synth_ArrIterEnd =
function(iterVal) {
  return {
    kind: 'arr-iter-end' ,
    type: '#Untransformed' ,
    iter: iterVal,
    '#c': {}
  };
};

this.synth_ArrIter =
function(iterVal) {
  this.accessJZ();
  return {
    kind: 'arr-iter',
    type: '#Untransformed' ,
    iter: iterVal,
    '#c': {}
  };
};

this.synth_ArrIterGet =
function(iterVal, at) {
  return {
    kind: 'arr-iter-get',
    type: '#Untransformed',
    iter: iterVal,
    idx: at,
    '#c': {}
  };
};

this.synth_SynthAssig =
function(left, right, isB) {
  return {
    binding: isB || false,
    right: right,
    left: left,
    type: '#SynthAssig',
    operator: '=',
    '#c': {}
  };
};

this.synth_Call =
function(head, mem, list) {
  return {
    head: head,
    mem: mem,
    list: list,
    type: '#Untransformed' ,
    kind: 'call',
    '#c': {},
    '#argloc': null,
    loc: null
  };
};

this.synth_U =
function(expr) {
  this.accessJZ();
  return {
    kind: 'u',
    type: '#Untransformed' ,
    value: expr,
    '#c': {}
  };
};

this.synth_ArrIterGetRest =
function(iter, at) {
  return {
    kind: 'arr-iter-get-rest',
    type: '#Untransformed' ,
    iter: iter,
    idx: at,
    '#c': {}
  };
};

this.synth_ObjIter =
function(iterVal) {
  return {
    kind: 'obj-iter',
    type: '#Untransformed' ,
    iter: iterVal,
    '#c': {}
  };
};

this.synth_ObjIterEnd =
function(iterVal) {
  return {
    kind: 'obj-iter-end' ,
    type: '#Untransformed' ,
    iter: iterVal,
    '#c': {}
  };
};

this.synth_ObjIterGet =
function(iter, at, isC) {
  return {
    kind: 'obj-iter-get',
    type: '#Untransformed' ,
    iter: iter,
    idx: at,
    computed: isC,
    '#c': {}
  };
};

this.synth_ArgAt =
function(at) {
  return {
    type: '#Untransformed' ,
    idx: at,
    kind: 'arg-at',
    '#c': {}
  };
};

this.synth_ArgRest =
function(ex, at) {
  return {
    idx: at,
    left: ex,
    kind: 'arg-rest',
    type: '#Untransformed',
    '#c': {}
  };
};

var SYNTH_VOID0 = {
  type: 'UnaryExpression',
  operator: 'void',
  argument: {
    type: 'Literal',
    value: 0,
    raw: '0',
    '#c': {}
  },
  '#y': 0,
  '#c': {}
};

this.synth_node_BinaryExpression =
function(left,o,right,y) {
  return {
    left: left,
    operator: o,
    right: right,
    type: 'BinaryExpression',
    '#y': y || 0,
    '#c': {}
  };
};

this.synth_Void0 = function() { return SYNTH_VOID0; };

this.synth_SynthName =
function(liq) {
  return {
    type: '#Untransformed' ,
    kind: 'synth-name',
    liq: liq,
    '#c': {}
  };
};

this.synth_node_MemberExpression =
function(n,v) {
  return {
    loc: null,
    computed: true,
    object: n,
    property: v,
    '#y': 0,
    '#c': {},
    type: 'MemberExpression'
  };
};

this.synth_TransformedFn =
function(n, a) {
  return {
    type: '#Untransformed' ,
    kind: 'transformed-fn' ,
    fun: n,
    argsPrologue: a,
    target: null,
    '#c': {},
    scall: null, cls: null,
    loc: n.loc
  };
};

this.synth_GlobalUpdate =
function(assig, isU) {
  return {
    isU: isU,
    kind: 'global-update',
    assig: assig,
    type: '#Untransformed',
    '#c': {}
  };
};

this.synth_SynthLiteral =
function(l) {
  switch (l.type) {
  case 'Literal':
    return l;
  case 'Identifier':
    return {
      kind: 'synth-literal',
      raw: l.raw,
      loc: l.loc,
      type: '#Untransformed',
      value: l.name,
      '#c': CB(l)
    };
  }
  ASSERT.call(this, false, 'Unknown ['+l.type+']');
};

var SKIP = {type: '#Untransformed', kind: 'skip' };
this.synth_Skip =
function() { return SKIP; };

this.synth_ResolvedThis =
function(src, th, chk) {
  var simp = th.ref.scope === this.cur.getThisBase();
  return {
    kind: 'resolved-this',
    id: src,
    target: th,
    type: '#Untransformed' ,
    chk: chk,
    loc: src.loc,
    plain: simp
  };

};

this.synth_BareThis =
function(th) {
  return {
    type: '#Untransformed' ,
    target: th,
    kind: 'bthis',
    plain: th.ref.scope === this.cur.getThisBase()
  };

};

this.synth_MakeClass =
function(cls, herit, target) {
  return {
    cls: cls,
    heritage: herit,
    kind: 'cls',
    type: '#Untransformed' ,
    target: target
  };

};

this.synth_RCheck =
function(v,t) {
  this.accessJZ();
  return {
    val: v,
    th: t,
    kind: 'rcheck',
    type: '#Untransformed'
  };

};

this.synth_MemList =
function(mList, tProto) {
  return {
    m: mList,
    type: '#Untransformed' ,
    kind: 'memlist',
    p: tProto
  };

};

this.synth_ClassSave =
function(target, ctor) {
  return {
    target: target,
    ctor: ctor,
    kind: 'cls-assig',
    type: '#Untransformed'
  };

};
this.synth_Heritage =
function(h) {
  return {
    type: '#Untransformed' ,
    heritage: h,
    kind: 'heritage',
  };
};

this.synth_TC =
function(right, rn) {
  this.accessJZ(); // jz  o
  return {
    value: right,
    kind: 'cvtz',
    rn: rn,
    type: '#Untransformed' ,
  };

};

this.synth_TVal =
function(ex) {
  return {
    type: '#Untransformed' ,
    kind: 'tval',
    ex: ex
  };
};

this.synth_NameList =
function(scope, vinit) {
  return {
    type: '#Untransformed' ,
    kind: 'llinosa-names',
    scope: scope ,
    withV: vinit
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
    if (list[s] !== null)
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
  var lg = this.script.gocLG('jz');
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
[VirtualResourceResolver.prototype, [function(){
this.asNode =
function(uri) {
  ASSERT.call(this, this.has(uri), 'resource not found ('+uri+')');
  var newParser = new Parser(this.fsMap[_m(uri)], {sourceType: 'module'});
  newParser.bundleScope = this.bundleScope;
  var n = newParser.parseProgram();
  return n;
};

this.has =
function(uri) { return HAS.call(this.fsMap, _m(uri)); };

this.set =
function(uri, value) {
  ASSERT.call(this, !this.has(uri), 'has' );
  this.fsMap[_m(uri)] = value;
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
 this. PathMan = PathMan;

// this.Emitter2 = Emitter2;

this.AutoImex = AutoImex;

this.transpile = function(src, options) {
  var p = new Parser(src, options);
  return new Emitter().eA(
    new Transformer().tr(p.parseProgram()),
    EC_NONE,
    false).code ;
};

this.vlq = vlq;

this.Scope = Scope; 
this.FunScope = FunScope; 
this.CatchScope = CatchScope; 
this.GlobalScope = GlobalScope; 
this.ConcreteScope = ConcreteScope; 

this.BundleScope = BundleScope ;

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

this.ResourceResolver = ResourceResolver;
this. VirtualResourceResolver = VirtualResourceResolver;
this. Bundler = Bundler;

this. makeAcceptor = makeAcceptor;

// this.cd = cd;
// this.pathFor = pathFor;
// this.tailFor = tailFor;

this.renamer_incremental = renamer_incremental;
this.renamer_minify = renamer_minify;
;}).call (function(){try{return module.exports;}catch(e){return this;}}.call(this))