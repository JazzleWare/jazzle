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
