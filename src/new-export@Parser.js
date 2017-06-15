this.parseExport_elemOther =
function(c0,loc0) {
  var elem = null, stmt = false;
  if (this.lttype === TK_ID) {
    this.canBeStatement = true;
    switch (this.ltval) {
    case 'class':
      this.ex = DT_ESELF;
      elem = this.parseClass(CTX_NONE);
      break;
    case 'var':
      this.ex = DT_ESELF;
      elem = this.parseVar(DT_VAR, CTX_NONE);
      break;
    case 'let':
      this.ex = DT_ESELF;
      elem = this.parseVar(DT_LET, CTX_NONE);
      break;
    case 'async':
      elem = this.id();
      this.ex = DT_ESELF;
      if (this.peekID('function')) {
        this.nl && this.err('newline.async');
        elem = this.parseAsync_fn(elem, CTX_NONE);
      }
      else
        this.err('async.lone');
      break;
    case 'function':
      this.ex = DT_ESELF;
      elem = this.parseFn(CTX_NONE, ST_DECL);
      break;
    case 'const':
      this.ex = DT_ESELF;
      elem = this.parseVar(DT_CONST, CTX_NONE);
      break;
    default:
      this.canBeStatement = false;
      elem = this.parseNonSeq(PREC_NONE, CTX_NONE);
      break;
    }
    stmt = this.foundStatement;
  }
  if (elem === null)
    this.err('export.named.no.exports');

  if (!stmt)
    this.semi() || this.err('no.semi');

  return {
    type: 'ExportNamedDeclaration',
    start: c0,
    loc: { start: loc0, end: elem.loc.end },
    end: elem.end,
    declaration: elem,
    specifiers: [],
    source: null,
    '#y': 0 
  };
};

this.parseExport_elemList = 
function(c0,loc0) {
  this.next();
  var firstResv = null;
  var list = [];
  while (this.lttype === TK_ID) {
    var lName = this.id();
    var eName = lName;
    if (this.lttype === TK_ID) {
      this.ltval === 'as' || this.err('export.specifier.not.as');
      this.next();
      if (this.lttype !== TK_ID)
        this.err('export.specifier.after.as.id');
      eName = this.id();
    }
    if (!firstResv && this.isResv(lName.name))
      firstResv = lName;

    var entry = this.scope.attachExportedEntry(eName.name);
    entry.site = eName;

    list.push({
      type: 'ExportSpecifier',
      start: lName.start,
      loc: { start: lName.loc.start, end: eName.loc.end }, 
      end: eName.end,
      exported: eName,
      local: lName ,
      '#y': 0,
      '#entry': entry 
    });

    if (this.lttype === CH_COMMA)
      this.next();
    else
      break;
  }

  var ec = this.c, eli = this.li, ecol = this.col;
  this.expectT(CH_RCURLY) || this.err('export.named.list.not.finished');

  var src = null;
  if (this.peekID('from'))
    src = this.parseExport_from();
  else
    firstResv && this.err('export.named.has.reserved',{tn: firstResv});

  this.semi() || this.err('no.semi');
  
  ec = this.semiC || (src && src.end) || ec;
  var eloc = this.semiLoc || (src && src.loc.end) || { line: li, column: col };

  this.foundStatement = true;

  this.scope.trackExports(src ? src.value : "", list);
  return {
    type: 'ExportNamedDeclaration',
    start: c0,
    loc: { start: loc0, end: eloc },
    end: ec,
    declaration: null,
    specifiers: list,
    source: src,
    '#y': 0 
  };
};

this.parseExport_elemAll =
function(c0,loc0) {
  this.next();
  var src = null;
  src = this.parseExport_from();
  this.semi() || this.err('no.semi');
  
  this.foundStatement = true;
  this.scope.attachFWNamespace(src.value);
  return {
    type: 'ExportAllDeclaration',
    start: c0,
    loc: { start: loc0, end: this.semiLoc || src.loc.end },
    end: this.semiC || src.end,
    source: src,
    '#y': 0
  };
};

this.parseExport_elemDefault =
function(c0,loc0) {
  this.next();
  var elem = null, stmt = false;

  var entry = this.scope.attachExportedEntry('*default*');
  if (this.lttype !== TK_ID)
    elem = entry.value = this.parseNonSeq(PREC_NONE, CTX_TOP);
  else {
    this.canBeStatement = true;
    switch (this.ltval) {
    case 'async':
      this.ex = DT_EDEFAULT;
      elem = this.id(); // 'async'
      if (this.nl) {
        this.canBeStatement = false;
        elem = this.parseAsync_exprHead(elem, CTX_TOP);
      }
      else
        elem = this.parseAsync(elem, CTX_TOP|CTX_DEFAULT) ;

      if (!this.foundStatement) {
        this.exprHead = elem;
        elem = this.parseNonSeq(PREC_NONE, CTX_TOP) ;
      }
      break;
    case 'function':
      this.ex = DT_EDEFAULT;
      elem = this.parseFn(CTX_DEFAULT, ST_DECL);
      break;
    case 'class':
      this.ex = DT_EDEFAULT;
      elem = this.parseClass(CTX_DEFAULT);
      break;
    default:
      this.canBeStatement = false;
      elem = entry.value = this.parseNonSeq(PREC_NONE, CTX_TOP);
      break;
    }
    stmt = this.foundStatement;
  }

  if (!stmt)
    this.semi() || this.err('no.semi');

  this.foundStatement = true;
  return {
    type: 'ExportDefaultDeclaration',    
    start: c0,
    loc: { start: loc0, end: this.semiLoc || elem.loc.end },
    end: this.semiC || elem.end,
    declaration: core(elem),
    '#y': 0
  };
};

this.parseExport_from =
function() {
  this.peekID('from') || this.err('export.from');
  this.next();
  this.peekStr() || this.err('export.src');

  return this.parseString(this.lttype);
};

this.parseExport =
function() {
  if (this.v<=5) this.err('ver.exim');
  this.testStmt() || this.err('not.stmt');
  this.isScript && this.err('export.not.in.module');

  var c0 = this.c0, loc0 = this.loc0();

  this.next();

  return (
    this.peekMul() ?
      this.parseExport_elemAll(c0,loc0) :
    this.peekID('default') ?
      this.parseExport_elemDefault(c0,loc0) :
    this.lttype === CH_LCURLY ?
      this.parseExport_elemList(c0,loc0) :
      this.parseExport_elemOther(c0,loc0)
  );
};

this.parseExport_elemDefault_async =
function() {
  var a = this.id(); // 'async'
  if (this.nl) {
    this.canBeStatement = false;
    this.exprHead = this.parseAsync_exprHead(a);
    return this.parseNonSeq(PREC_NONE, CTX_TOP);
  }

  return this.parseAsync(a, CTX_TOP|CTX_DEFAULT);
};
