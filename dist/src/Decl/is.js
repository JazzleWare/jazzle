  import {DT_LET, DT_VAR, DT_CONST, DT_GLOBAL, DT_FN, DT_FNARG, DT_CLS, DT_CATCHARG, DT_LIQUID, DT_IDEFAULT, DT_IALIASED, DT_INAMESPACE, DT_EDEFAULT, DT_EALIASED, DT_ESELF, DT_FNNAME, DT_CLSNAME, DT_INFERRED} from '../other/scope-constants.js';
  import {cls} from './cls.js';

cls.isLet =
function() { return this.type & DT_LET; };

cls.isVar =
function() { return this.type & DT_VAR; };

cls.isConst =
function() { return this.type & DT_CONST; };

cls.isGlobal =
function() { return this.type & DT_GLOBAL; };

cls.isFn =
function() { return this.type & DT_FN; };

cls.isFnArg =
function() { return this.type & DT_FNARG; };

cls.isCls =
function() { return this.type & DT_CLS; };

cls.isCatchArg =
function() { return this.type & DT_CATCHARG; };

cls.isTemporal =
function() {
  if (this.isFnArg())
    return !this.ref.scope.inBody;
  if (this.isCatchArg())
    return !this.ref.scope.inBody;
  if (this.isFn())
    return false;

  return this.isCls() || this.isClassName() || this.isLexicalLike();
};

cls.isLLINOSA =
function() {
  return this.isLexicalLike() &&
    this.ref.scope.insideLoop() &&
    this.ref.i;
};

cls.isLiquid =
function() { return this.type & DT_LIQUID; };

var _HOISTED = DT_FN|DT_VAR;
cls.isHoisted =
function() { return this.type & _HOISTED; };

var _ARG = DT_FNARG|DT_CATCHARG;
cls.isArg =
function() { return this.type & _ARG; };

var _LEXICAL = DT_CLS|DT_LET|DT_CONST;
cls.isLexicalLike =
function() {
  if (this.isFn())
    return this.ref.scope.isLexicalLike();
  return this.type & _LEXICAL;
};

// TODO: CATCHARG
var _VARLIKE = DT_FNARG|DT_VAR;
cls.isVarLike =
function() {
  if (this.isFn())
    return !this.ref.scope.isLexicalLike();
  return this.type & _VARLIKE;
};

var _OVERRIDABLE = DT_CATCHARG|_VARLIKE;
cls.isOverridableByVar =
function() { return this.isVarLike() || (this.type & _OVERRIDABLE); };

cls.isIDefault =
function() { return this.type & DT_IDEFAULT; };

cls.isIAliased =
function() { return this.type & DT_IALIASED; };

cls.isINamespace =
function() { return this.type & DT_INAMESPACE; };

cls.isImported =
function() {
  return this.isIDefault() || this.isIAliased() || this.isINamespace();
};

cls.isEDefault =
function() { return this.type & DT_EDEFAULT; };

cls.isEAliased =
function() { return this.type & DT_EALIASED; };

cls.isESelf =
function() { return this.type & DT_ESELF; };

cls.isExported =
function() {
  return this.isEDefault() || this.isEAliased() || this.isESelf();
};

cls.isFnName =
function() { return this.type & DT_FNNAME; };

cls.isClassName =
function() { return this.type & DT_CLSNAME; };

cls.isName =
function() { return this.type & (DT_FNNAME|DT_CLSNAME); };

cls.isInsignificant =
function() { return this.type & DT_INFERRED; };

cls.isImmutable =
function() {
  return this.isConst() || this.isName();
};

// renamed global
cls.isRG =
function() {
  return this.isGlobal() && this.name !== this.synthName;
};


