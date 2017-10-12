this.writeStringValue =
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
      this.finishCurrentLine();
      this.curLineIndent = 0;
    }

    this.writeToCurrentLine_raw(v);
    c++;
  }
};

this.isNormalCh =
function(ch) {
  switch (ch) {
  case CH_BACK_SLASH:
  case CH_SINGLE_QUOTE:
  case CH_MULTI_QUOTE:
    return false;
  }

  return ch <= CH_COMPLEMENT && ch >= CH_WHITESPACE;
};

this.stringEscapeFor =
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

this.writeString =
function(sv, quotation) {
  this.tt(ETK_STR);
  this.writeToCurrentLine_checked(quotation); // must take care of wrapping for the quotation
  this.writeStringValue(sv, quotation.length);

  // raw because the wrapping has been taken care of when in the writeStringValue routine
  this.writeToCurrentLine_raw(quotation); 
};

this.emitCommaList =
function(list, flags) {
  var e = 0;
  while (e < list.length) {
    if (e) this.wm(',','');
    this.eN(list[e], flags, false);
    if (e === 0) flags &= EC_IN;
    e++;
  }
};

this.emitStmtList =
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

this.emitStmt =
function(stmt) { return this.emitAny(stmt, EC_START_STMT, true); };

this.emitAttached =
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

  this.i();
  this.l(); // TODO: unnecessary when the body has nothing in it (like as in #Skip nodes)

  var own = {used: false};
  this.listenForEmits(own);
  this.emitStmt(stmt);
  this.u();
  if (!own.used) { this.grmif(own); this.w(';'); }
};

// a, b, e, ...l -> [a,b,e],sp(l)
// a, b, e, l -> a,b,e,l
this.emitElems =
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

this.emitSpread =
function(n) {
  var cb = CB(n); this.emc(cb, 'bef' );
  this.jz('sp').sl(n.loc.start);
  this.w('(').eN(n.argument, EC_NONE, false).w(')').emc(cb, 'aft');
};

this.emitElems_toRest =
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

this.writeMemName =
function(memName, asStr) {
  switch (memName.type) {
  case 'Literal':
    this.eA(memName, EC_NONE, false);
    return this;
  case 'Identifier':
    var cb = CB(memName); this.emc(cb, 'bef' );
    asStr ?
      this.writeString(memName.name,"'") :
      this.writeIDName(memName.name);
    this.emc(cb, 'aft');
    return this;
  }
  ASSERT.call(this, false, 'unknown name');
};

this.writeIDName =
function(nameStr) { return this.writeToCurrentLine_checked(nameStr); };

this.emitSAT =
function(n, flags, olen) {
  if (n.type === 'MemberExpression')
    return this.emitSAT_mem(n, flags, olen);
  if (isResolvedName(n))
    return this.emitRName_SAT(n, flags);

  ASSERT.call(this, false, 'got <'+n.type+'>');
};