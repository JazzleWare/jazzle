  import {DT_LET, DT_VAR, DT_CONST, DT_GLOBAL, DT_FN, DT_FNARG, DT_CLS, DT_CATCHARG, DT_LIQUID, DT_IDEFAULT, DT_IALIASED, DT_INAMESPACE, DT_EDEFAULT, DT_EALIASED, DT_ESELF, DT_FNNAME, DT_CLSNAME, DT_INFERRED} from '../other/scope-constants.js';
  import {cls} from './cls.js';

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

