var VDT_VOID = 1;
var VDT_TYPEOF = 2;
var VDT_NONE = 0;
var VDT_DELETE = 4;
var VDT_AWAIT = 8;

var TK_NONE = 0;
var TK_EOF = 1 << 8;
var TK_QUOTE = TK_EOF << 1;
var TK_NUM = TK_QUOTE << 1;
var TK_ID = TK_NUM << 1;
var TK_SIMP_ASSIG = TK_ID << 1;
var TK_UNARY = TK_SIMP_ASSIG << 1;
var TK_SIMP_BINARY = TK_UNARY << 1;
var TK_AA_MM = TK_SIMP_BINARY << 1;
var TK_OP_ASSIG = TK_AA_MM << 1;
var TK_DIV = TK_OP_ASSIG << 1;
var TK_UNBIN = TK_SIMP_BINARY|TK_UNARY;
var TK_ANY_ASSIG = TK_SIMP_ASSIG|TK_OP_ASSIG;
var TK_ANY_BINARY = TK_SIMP_BINARY|TK_ANY_ASSIG;

function nextl(nPrec) { return (nPrec&1) ? nPrec + 1 : nPrec + 2; }
function nextr(nPrec) { return (nPrec&1) ? nPrec + 2 : nPrec + 1; }

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
