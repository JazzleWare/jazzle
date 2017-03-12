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
