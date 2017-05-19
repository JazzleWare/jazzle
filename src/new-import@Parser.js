this.parseImport =
function() {
  this.v<=5 && this.err('ver.exim');
  this.isScript && this.err('import.not.in.module');
  this.testStmt() || this.err('not.stmt');

  var hasTail = true;
  var c0 = this.c0, loc0 = this.loc0(), list = [];

  this.next();

  var lName = null;
  if (this.lttype === TK_ID) {
    this.validate(this.ltval);
    lName = this.id();
    list.push({
      type: 'ImportDefaultSpecifier',
      local: lName,
      start: lName.start,
      end: lName.end,
      loc: lName.loc,
      '#y': 0
    });
    if (this.lttype === CH_COMMA)
      this.next();
    else
      hasTail = false;
  }

  if (hasTail) {
    if (this.peekMul())
      list.push(this.parseImport_namespace());
    else if (this.lttype === CH_LCURLY)
      this.parseImport_slist(list);
    else {
      if (list.length) {
        ASSERT.call(this, list.length === 1,
          'how come has more than a single specifier been parsed before the comma '+
          'was reached?!');
        this.err('import.invalid.specifier.after.comma');
      }
      hasTail = false;
    }
  }

  // test whether we need `from`
  if (list.length || hasTail /* any tail */) {
    this.peekID('from') || this.err('import.from');
    this.next();
  }

  this.peekStr() || this.err('import.source.is.not.str');
  var src = this.parseString(this.lttype);

  this.semi() || this.err('no.semi');

  var ec = this.semiC || src.end, eloc = this.semiLoc || src.loc.end;
  this.foundStatement = true;

  return {
    type: 'ImportDeclaration',
    start: c0,
    loc: { start: loc0, end: eloc },
    end: ec, 
    specifiers: list,
    source: src,
    '#y': 0
  };
};

this.parseImport_slist =
function(list) {
  this.next(); // '{'
  while (this.lttype === TK_ID) {
    var eName = this.id();
    var lName = eName;
    if (this.lttype !== TK_ID)
      this.validate(lName.name);
    else {
      this.ltval === 'as' || this.err('import.specifier.no.as');
      this.next();
      this.lttype === TK_ID || this.err('import.specifier.local.not.id');
      this.validate(this.ltval);
      lName = this.id();
    }
    list.push({
      type: 'ImportSpecifier',
      start: eName.start,
      loc: { start: eName.loc.start, end: lName.loc.end },
      end: lName.end,
      imported: eName,
      local: lName,
      '#y': 0
    });

    if (this.lttype === CH_COMMA)
      this.next();
    else
      break;
  }

  this.expectT(CH_RCURLY) || this.err('import.specifier.list.unfinished');
};
      
this.parseImport_namespace =
function() {
  var c0 = this.c0, loc0 = this.loc0();

  this.next();
  if (!this.peekID('as'))
    this.err('import.namespace.specifier.no.as');

  this.next();
  if (this.lttype !== TK_ID)
    this.err('import.namespace.specifier.local.not.id');

  this.validate(this.ltval);
  var lName = this.id();

  return {
    type: 'ImportNamespaceSpecifier',
    start: c0,
    loc: { start: loc0, end: lName.loc.end },
    end: lName.end,
    local: lName,
    '#y': 0
  };
};
