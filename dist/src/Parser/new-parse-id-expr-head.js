  import {DT_LET, DT_VAR, DT_CONST, ST_NONE} from '../other/scope-constants.js';
  import {TK_UNARY, VDT_VOID, TK_YIELD, VDT_AWAIT, VDT_DELETE} from '../other/lexer-constants.js';
  import {CTX_NONE, CTX_FOR, ASSERT} from '../other/constants.js';
  import {ERR_NONE_YET, ERR_PIN_UNICODE_IN_RESV} from '../other/error-constants.js';
  import {cls} from './cls.js';

cls.parseIDExprHead =
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
 
cls.resvchk = function() {
  if (this.ct !== ERR_NONE_YET) {
    ASSERT.call(this.ct === ERR_PIN_UNICODE_IN_RESV,
      'the error in this.ct is something other than ERR_PIN_UNICODE_IN_RESV: ' + this.ct);
    this.err('resv.unicode');
  }
};



