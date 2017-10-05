// write a string value as an ECMAScript string, but without quotes
this.writeStringValue =
function(sv,ql) {
  var ch = -1, len = sv.length, o = 0, v = "";
  while (o<len) {
    v = sv.charAt(o);
    ch = sv.charCodeAt(o);
    if (!this.isStringCh(ch))
      v = this.stringEscapeFor(ch);
    var l = v.length;
    if (o === len-1)
      l  += ql;
    if (this.ol(l) > 0) {
      this.rwr('\\');
      this.l();
      this.curLineIndent = -1; // deactivate indentation
    }
    this.rwr(v);
    o++;
  }

  return this;
};

this.isStringCh =
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

this. dot =
function() { return this.w('.'); };

this.writeIDName =
function(nameStr) {
  return this.w(nameStr);
};

this.wsndl =
function(list) {
  var e = 0;
  while (e < list.length) {
    e && this.wm(',','');
    this.writeIDName(list[e].synthName);
    ++e ;
  }
  return true;
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

this.writeString =
function(sv,quotation) {
  this.wt(quotation, ETK_STR); // rwr is not used, because it might involve wrapping
  this.writeStringValue(sv,1);
  this.rwr(quotation); // rwr because the wrapping-thing is taken care of when calling writeStringValue
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
  return this;
};

this.emitStmt =
function(stmt, isAttached) {
  var flags = EC_START_STMT;
  if (isAttached)
    flags |= EC_ATTACHED;

  return this.eA(stmt, EC_START_STMT, true);
};

this.emitBody =
function(stmt) {
  switch (stmt.type) {
  case 'BlockStatement':
    this.os();
  case 'EmptyStatement':
    this.emitStmt(stmt, false);
    return true;
  }
  if (isAssigList(stmt) || 
    (stmt.type === 'ExpressionStatement' && isAssigList(stmt.expression))) {
    this.os().emitAny(stmt, EC_START_STMT|EC_ATTACHED, true);
    return true;
  }
  this.i().l();
  var em = this.emitAny(stmt, EC_START_STMT, true);
  this.u();
  if (em)
    return true;
  this.w(';'); // TODO: else; rather than else[:newline:]  ;
  return false;
};

this.emitStmtList =
function(list) {
  var emittedSoFar = 0, e = 0;
  var em = 0, wcbu = null, wcbuOuter = true;
  ASSERT.call(this, this.wcb, 'wcb');
  if (!this.wcbUsed) {
    this.wcbUsed = wcbu = {v: false};
    wcbuOuter = false;
  }
  else wcbu = this.wcbUsed;

  while (e < list.length) {
    this.emitStmt(list[e++]);
    if (wcbu.v) {
      if (wcbuOuter) { wcbuOuter = false; wcbu = {v: false }; }
      ++em;
      if (!this.wcb) {
        this.onw(wcb_afterStmt);
        this.wcbUsed = wcbu;
        wcbu.v = false;
      }
    }
  }

  em && !wcbu.v && this.clear_onw(); // cleanup wcb's this rountine enqueued; if there is a wcb, but it has not been enqueued by this routine, it isn't cleaned
  return emittedSoFar;
};

this.emitSAT =
function(n, flags) {
  if (n.type === 'MemberExpression')
    return this.emitSAT_mem(n, flags);
  if (isResolvedName(n))
    return this.emitRName_SAT(n, flags);

  ASSERT.call(this, false, 'got <'+n.type+'>');
};

this.emitWrappedInV =
function(n) {
  this.wm('{','v',':').os().eN(n, EC_NONE, false).w('}');
  return true;
};

this.v =
function() {
  return this.wm('.','v');
};

this.emitSpread =
function(n) {
  var cb = CB(n); this.emc(cb, 'bef' );
  this.jz('sp').lw(n.loc.start);
  this.w('(').eN(n.argument, EC_NONE, false).w(')').emc(cb, 'aft');
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
  return true;
};

this.emitTZCheckPoint =
function(l) {
  ASSERT_EQ.call(this, l.hasTZCheck, true);
  var tz = l.ref.scope.scs.getLG('tz').getL(0);
  this.wm(tz.synthName,'','=','',l.idx,';');
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

this.emitAccessChk_tz =
function(nd, loc) {
  ASSERT.call(this, nd.hasTZCheck, 'unnecessary tz');
  var scope = nd.ref.scope;
  ASSERT.call(this, scope.hasTZCheckPoint, 'could not find any tz');
  var tz = scope.scs.getLG('tz').getL(0);
  this.wt(tz.synthName,ETK_ID).wm('<',nd.idx,'&&').jz('tz');
  loc && this.lw(loc);
  this.w('(').writeString(nd.name, "'");
  this.w(')');
  return true;
};

this.emitAccessChk_invalidSAT =
function(nd, loc) {
  this.jz('cc');
  loc && this.lw(loc);
  this.w('(').writeString(nd.name,"'");
  this.w(')');
  return true;
};
