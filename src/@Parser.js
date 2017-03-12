var Parser = function (src, o) {

  this.src = src;

  this.unsatisfiedLabel = null;

  this.nl = false;

  this.ltval = null;
  this.lttype= "";
  this.ltraw = "" ;
  this.prec = 0 ;
  this.isVDT = VDT_NONE;

  this.labels = {};

  this.li0 = 0;
  this.col0 = 0;
  this.c0 = 0;

  this.li = 1;
  this.col = 0;
  this.c = 0;
  
  this.canBeStatement = false;
  this.foundStatement = false;
  this.scopeFlags = 0;

  this.isScript = false;
  this.v = 7;

  this.throwReserved = true;

  this.first__proto__ = false;

  this.scope = null;
  this.directive = DIR_NONE;
  
  this.declMode = DECL_NONE;
 
  // TODO:eliminate
  this.pendingExprHead = null;

  // ERROR TYPE           CORE ERROR NODE    OWNER NODE
  this.pt = ERR_NONE_YET; this.pe = null; this.po = null; // paramErr info
  this.at = ERR_NONE_YET; this.ae = null; this.ao = null; // assigErr info
  this.st = ERR_NONE_YET; this.se = null; this.so = null; // simpleErr info

  this.suspys = null;
  this.missingInit = false;

  this.dv = { value: "", raw: "" };

  // "pin" location; for errors that might not have been precisely cause by a syntax node, like:
  // function l() { '\12'; 'use strict' }
  //                 ^
  // 
  // for (a i\u0074 e) break;
  //         ^
  //
  // var e = [a -= 12] = 5
  //            ^
  this.ploc = { c0: -1, li0: -1, col0: -1 }; // paramErr locPin; currently only for the last error above
  this.aloc = { c0: -1, li0: -1, col0: -1 }; // assigErr locPin; currently only for the last error above

  // escErr locPin; like the name suggests, it's not a simpleErr -- none of the simpleErrs needs a pinpoint
  this.esct = ERR_NONE_YET;
  this.eloc = { c0: -1, li0: -1, col0: -1 };

  this.parenAsync = null; // so that things like (async)(a,b)=>12 will not get to parse.

  this.errorListener = this; // any object with an `onErr(errType "string", errParams {*})` will do

  this.onToken_ = null;
  this.onComment_ = null;
//this.core = MAIN_CORE;
  this.misc = {
    alloHashBang: false,
    allowImportExportEverywhere: false,
    allowReturnOutsideFunction: false,
    directSourceFile: "",
    sourceFile: ""
  };
  this.program = null;

  this.parenScope = null;
  this.setOptions(o);
};

