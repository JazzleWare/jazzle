var Parser = function (src, o) {

  this.src = src;
  this.unsatisfiedLabel = null;
  this.nl = false;

  this.ltval = null;
  this.lttype= "";
  this.ltraw = "" ;
  this.prec = 0 ;
  this.vdt = VDT_NONE;

  this.labels = {};

  this.li0 = 0;
  this.col0 = 0;
  this.c0 = 0;

  this.li = 1;
  this.col = 0;
  this.c = 0;

  this.luo = 0; // latest used offset
 
  this.canBeStatement = false;
  this.foundStatement = false;

  this.isScript = !o || o.sourceType === 'script';
  this.v = 7;

  this.first__proto__ = false;

  this.scope = null;
  this.declMode = DT_NONE;
 
  this.exprHead = null;

  // ERROR TYPE           CORE ERROR NODE    OWNER NODE
  this.pt = ERR_NONE_YET; this.pe = null; this.po = null; // paramErr info
  this.at = ERR_NONE_YET; this.ae = null; this.ao = null; // assigErr info
  this.st = ERR_NONE_YET; this.se = null; this.so = null; // simpleErr info

  this.suspys = null;
  this.missingInit = false;

  this.yc= -1; // occasionally used to put yield counts in
  this.ex = DT_NONE;

  this.bundleScope = null;

  this.bundler = null;
  this.chkDirective = false;
  this.alreadyApplied = false;
  // "pin" location; for errors that might not have been precisely caused by a syntax node, like:
  // function l() { '\12'; 'use strict' }
  //                 ^
  // 
  // for (a i\u0074 e) break;
  //         ^
  //
  // var e = [a -= 12] = 5
  //            ^
  this.ct = ERR_NONE_YET;
  this.pin = {
    c: { c:-1, li:-1, col:-1 },
    a: { c:-1, li:-1, col:-1 },
    s: { c:-1, li:-1, col:-1 },
    p: { c:-1, li:-1, col:-1 }
  };

  this.cb = null;
  this.parenAsync = null; // so that things like (async)(a,b)=>12 will not get to parse.
  this.commentBuf = null;
  this.errorListener = this; // any object with an `onErr(errType "string", errParams {*})` will do
  this.parenScope = null;  

  this.regPendingBQ = null;
  this.regPendingCQ = false;
  this.regLastBareElem = null;
  this.regErr = null;
  this.regIsQuantifiable = false;
  this.regSemiRange = null;
  this.regCurlyChar = false;
  this.regLastOffset = -1;
  this.regNC = -1;

  this.regexFlags = this.rf = {};

  this.commentCallback = null;

  this.argploc = null;

  this.pure = false; // pure-ness
};
