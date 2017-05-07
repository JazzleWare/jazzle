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

this.isLLINOSA =
function() {
  return this.isLexicalLike() &&
    this.ref.scope.insideLoop() &&
    this.ref.i;
};

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
var _VARLIKE = DT_FNARG|DT_FNARG;
this.isVarLike =
function() {
  if (this.isFn())
    return !this.ref.scope.isLexical();
  return this.type & _VARLIKE;
};

var _OVERRIDABLE = DT_CATCHARG|_VARLIKE;
this.isOverridableByVar =
function() { return this.type & _OVERRIDABLE; };
