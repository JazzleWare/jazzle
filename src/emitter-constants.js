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
