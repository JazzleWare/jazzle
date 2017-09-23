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
    EC_ATTACHED = EC_IN << 1;

var EST_BREAKABLE = 1,
    EST_OMITTABLE = EST_BREAKABLE << 1,
    EST_NONE = 0;

var ETK_NONE = 0,
    ETK_ID = 1,
    ETK_MIN = ETK_ID << 1,
    ETK_DIV = ETK_MIN << 1,
    ETK_ADD = ETK_DIV << 1,
    ETK_NUM = ETK_ADD << 1,
    ETK_STR = ETK_NUM << 1,
    ETK_NL = ETK_STR << 1;

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

