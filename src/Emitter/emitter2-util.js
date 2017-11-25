  import {CH_BACK_SLASH, CH_SINGLE_QUOTE, CH_MULTI_QUOTE, CH_COMPLEMENT, CH_WHITESPACE, CH_VTAB, CH_BACK, CH_FORM_FEED, CH_TAB, CH_CARRIAGE_RETURN, CH_LINE_FEED, ASSERT, ETK_STR, EC_IN, EC_START_STMT, ASSERT_EQ, EC_ATTACHED, EC_NONE, ETK_ID} from '../other/constants.js';
  import {hex2, hex, isAssigList, CB, isResolvedName} from '../other/util.js';
  import {wcb_afterStmt} from '../other/wcb.js';
  import {cls} from './cls.js';

cls.writeStringValue =
function(sv, ql) {
  var ch = -1, len = sv.length, c = 0, v = "";
  while (c < len) {
    ch = sv.charCodeAt(c);
    v = this.isNormalCh(ch) ?
      sv.charAt(c) :
      this.stringEscapeFor(ch);

    var vLen = v.length;
    if (vLen === c+ql)
      vLen += ql;

    if (this.ol(vLen) > 0) {
      this.writeToCurrentLine_raw('\\');
      this.nextLineHasLineBreakBefore = true;
      this.finishCurrentLine();
      this.curLineIndent = 0;
    }

    this.writeToCurrentLine_raw(v);
    c++;
  }
};

cls.isNormalCh =
function(ch) {
  switch (ch) {
  case CH_BACK_SLASH:
  case CH_SINGLE_QUOTE:
  case CH_MULTI_QUOTE:
    return false;
  }

  return ch <= CH_COMPLEMENT && ch >= CH_WHITESPACE;
};

cls.stringEscapeFor =
function(ch) {
  switch (ch) {
  case CH_BACK_SLASH: return '\\\\';
  case CH_SINGLE_QUOTE: return '\\\'';
  case CH_MULTI_QUOTE: return '\\\"';
  case CH_VTAB: return '\\v';
  case CH_BACK: return '\\b';
  case CH_FORM_FEED: return '\\f';
  case CH_TAB: return '\\t';
  case CH_CARRIAGE_RETURN: return '\\r';
  case CH_LINE_FEED: return '\\n';
  default:
    if (ch<=0xFF)
      return '\\x'+hex2(ch);

    ASSERT.call(this, ch <= 0xFFFF, 'ch not a 16bit');
    return '\\u'+hex(ch);
  }
};

cls.writeString =
function(sv, quotation) {
  this.tt(ETK_STR);
  this.writeToCurrentLine_checked(quotation); // must take care of wrapping for the quotation
  this.writeStringValue(sv, quotation.length);

  // raw because the wrapping has been taken care of when in the writeStringValue routine
  this.writeToCurrentLine_raw(quotation); 
};

cls.emitCommaList =
function(list, flags) {
  var e = 0;
  while (e < list.length) {
    if (e) this.wm(',','');
    this.eN(list[e], flags, false);
    if (e === 0) flags &= EC_IN;
    e++;
  }
};

cls.emitStmtList =
function(list) {
  var own = {used: false};

  var lsn = this.listenForEmits(own), l = 0;
  while (l < list.length) {
    this.emitStmt(list[l++]);
    if (lsn.used) {
      own.used = false;
      this.trygu(wcb_afterStmt, own);
      lsn = this.listenForEmits(own);
    }
  }

  own.used || this.grmif(own);
};

cls.emitStmt =
function(stmt) { return this.emitAny(stmt, EC_START_STMT, true); };

cls.emitTZCheckPoint =
function(l) {
  ASSERT_EQ.call(this, l.hasTZCheck, true);
  var tz = l.ref.scope.scs.getLG('tz').getL(0);
  this.wm(tz.synthName,'','=','',l.idx+"",';');
};

cls.wsndl =
function(list) {
  var e = 0;
  while (e < list.length) {
    e && this.wm(',','');
    this.writeIDName(list[e].synthName);
    ++e ;
  }
  return true;
};

cls.emitAttached =
function(stmt) {
  switch (stmt.type) {
  case 'BlockStatement':
    this.os();
  case 'EmptyStatement':
    return this.emitStmt(stmt);
  }

  // TODO: eliminate
  if (stmt.type === 'ExpressionStatement') {
    var ex = stmt.expression;
    if (isAssigList(ex))
      return this.os().emitAny(ex, EC_START_STMT|EC_ATTACHED, true);
  }
  else if (isAssigList(stmt))
    return this.os().emitAny(stmt, EC_START_STMT|EC_ATTACHED, true);

  this.i();
  this.l(); // TODO: unnecessary when the body has nothing in it (like as in #Skip nodes)

  var own = {used: false};
  var lsn = this.listenForEmits(own);
  this.emitStmt(stmt);
  this.u();
  if (!lsn.used) { this.grmif(own); this.w(';'); }
};

// a, b, e, ...l -> [a,b,e],sp(l)
// a, b, e, l -> a,b,e,l
cls.emitElems =
function(list, selem /* i.e., it contains a spread element */, cb) {
  var e = 0, em = 0;
  while (e < list.length) {
    em && this.w(',').os();
    var elem = list[e];
    if (elem && elem.type === 'SpreadElement') {
      this.emitSpread(elem);
      e >= list.length - 1 && this.emc(cb, 'inner');
      e++;
    }
    else {
      var br = selem || em;
      br && this.w('[');
      e = this.emitElems_toRest(list, e, cb);
      e >= list.length && this.emc(cb, 'inner');
      br && this.w(']');
    }
    ++em;
  }
};

cls.emitSpread =
function(n) {
  var cb = CB(n); this.emc(cb, 'bef' );
  this.jz('sp').sl(n.loc.start);
  this.w('(').eN(n.argument, EC_NONE, false).w(')').emc(cb, 'aft');
};

cls.emitElems_toRest =
function(list, s, cb) {
  var e = s;
  while (e < list.length) {
    var elem = list[e];
    if (elem && elem.type === 'SpreadElement')
        break;
    e > s && this.w(',').os();
    if (elem)
      this.eN(elem, EC_NONE, false);
    else {
      if (cb.h < cb.holes.length) {
        var holeComments = cb.holes[cb.h];
        if (holeComments[0] === e)
          this.emcim(holeComments[1]);
        cb.h++;
      }
          
      this.w('void').bs().w('0');
    }
    ++e; 
  }
  return e;
};

cls.writeMemName =
function(memName, asStr) {
  switch (memName.type) {
  case 'Literal':
    this.eA(memName, EC_NONE, false);
    return this;
  case 'Identifier':
  case '#-ResolvedName.ex':
    var cb = CB(memName); this.emc(cb, 'bef' );
    asStr ?
      this.writeString(memName.name,"'") :
      this.writeIDName(memName.name);
    this.emc(cb, 'aft');
    return this;
  }
  ASSERT.call(this, false, 'unknown name');
};

cls.writeIDName =
function(nameStr) { return this.writeToCurrentLine_checked(nameStr); };

cls.emitSAT =
function(n, flags, olen) {
  if (n.type === 'MemberExpression')
    return this.emitSAT_mem(n, flags, olen);
  if (isResolvedName(n))
    return this.emitRName_SAT(n, flags);

  ASSERT.call(this, false, 'got <'+n.type+'>');
};

cls.emitAccessChk_tz =
function(nd, loc) {
  ASSERT.call(this, nd.hasTZCheck, 'unnecessary tz');
  var scope = nd.ref.scope;
  ASSERT.call(this, scope.hasTZCheckPoint, 'could not find any tz');
  var tz = scope.scs.getLG('tz').getL(0);
  this.wt(tz.synthName,ETK_ID).wm('<',nd.idx+"",'&&').jz('tz');
  loc && this.sl(loc);
  this.w('(').writeString(nd.name, "'");
  this.w(')');
  return true;
};

cls.emitAccessChk_invalidSAT =
function(nd, loc) {
  this.jz('cc');
  loc && this.sl(loc);
  this.w('(').writeString(nd.name,"'");
  this.w(')');
  return true;
};


