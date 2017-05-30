// write a string value as an ECMAScript string, but without quotes
this.writeStringValue =
function(sv) {
  var ch = -1, len = sv.length, o = 0, luo = o;
  while (o<len) {
    ch = sv.charCodeAt(o);
    if (!this.isStringCh(ch)) {
      if (luo<o)
        this.w(sv.substring(luo,o));

      this.w(this.stringEscapeFor(ch));
      luo=o+1  ;
    }
    o++;
  }

  if (luo<o)
    this.w(sv.substring(luo,o));

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

this.writeIDName =
function(nameStr) {
  return this.w(nameStr);
};

this.writeMemName =
function(memName, asStr) {
  switch (memName.type) {
  case 'Literal':
    return this.eA(memName, EC_NONE, false);
  case 'Identifier':
    return asStr ?
      this.w("'").writeStringValue(memName.name).w("'") :
      this.writeIDName(memName.name);
  }
  ASSERT.call(this, false, 'unknown name');
};

this.emitCommaList =
function(list, flags) {
  var e = 0;
  while (e < list.length) {
    if (e) this.wm(',',' ');
    this.eN(list[e], flags, false);
    if (e === 0) flags &= EC_IN;
    e++;
  }
  return this;
};

this.emitBody =
function(stmt) {
  switch (stmt.type) {
  case 'BlockStatement':
    this.s();
  case 'EmptyStatement':
    this.eA(stmt, EC_START_STMT, true);
    return true;
  }
  this.l().i();
  var em = this.emitAny(stmt, EC_START_STMT, true);
  this.u();
  if (em)
    return true;
  this.w(';'); // TODO: else; rather than else[:newline:]  ;
  return false;
};

this.emitStmtList =
function(list) {
  var em = false, e = 0;
  while (e < list.length) {
    em = this.eA(list[e++], EC_START_STMT, true) || em;
    em && this.wsl();
  }
  return em;
};

this.emitSAT =
function(n, flags) {
  switch (n.type) {
  case '#ResolvedName':
    return this.emitSAT_resolvedName(n, flags);
  case 'MemberExpression':
    return this.emitSAT_mem(n, flags);
  }
  ASSERT.call(this, false, 'got <'+n.type+'>');
};

this.emitElems =
function(list, s, e) {
  var nElem = 0;
  var hasRest = false;
  while (s <= e) {
    var t0 = this.sc("");
    s = this.emitElems_toRest(list, s);
    t0 = this.sc(t0);
    if (s <= e) {
      if (!hasRest) hasRest = true;
      nElem && this.w(',').s();
      t0.length ? this.w('[').ac(t0).w(']') : this.w('null'); // evens are not arrays
      nElem++;
      this.w(',').s().eN(list[s].argument, EC_NONE, false);
      nElem++;
      s++;
    }
    else { this.ac(t0); break; }
  }

  return hasRest;
};

this.emitElems_toRest =
function(list, s) {
  while (s < list.length) {
    var elem = list[s];
    if (elem && elem.type === 'SpreadElement')
      break;
    s && this.w(',').s();
    if (elem)
      this.eN(elem, EC_NONE, false);
    else
      this.w('void 0');
    s++;
  }
  return s;
};
