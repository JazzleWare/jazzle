this.parseNewHead = function () {
  var startc = this.c0, end = this.c,
      startLoc = this.locBegin(), li = this.li,
      col = this.col, raw = this.ltraw ;

  this.next();
  if (this.lttype === '.') {
    this.next();
    return this.parseMeta(startc, end, startLoc, {line:li,column:col}, raw);
  }

  var head, elem, inner;
  switch (this  .lttype) {
  case 'Identifier':
    head = this.parseIdStatementOrId (CTX_NONE);
    break;

  case '[':
    head = this. parseArrayExpression(CTX_NONE);
    break;

  case '(':
    head = this. parseParen();
    break;

  case '{':
    head = this. parseObjectExpression(CTX_NONE) ;
    break;

  case '/':
    head = this. parseRegExpLiteral () ;
    break;

  case '`':
    head = this. parseTemplateLiteral () ;
    break;

  case 'Literal':
    head = this.numstr ();
    break;

  default:
    this.err('new.head.is.not.valid');

  }

  // #if V
  if (head.type === 'Identifier')
    this.scope.reference(head.name);
  // #end

  var inner = core( head ) ;
  while ( true ) {
    switch (this. lttype) {
    case '.':
      this.next();
      if (this.lttype !== 'Identifier')
        this.err('mem.name.not.id');

      elem = this.memberID();
      head = { type: 'MemberExpression', property: elem, start: head.start, end: elem.end,
        loc: { start: head.loc.start, end: elem.loc.end }, object: inner, computed: false/* ,y:-1*/ };
      inner = head;
      continue;

    case '[':
      this.next() ;
      elem = this.parseExpr(CTX_NONE) ;
      head = { type: 'MemberExpression', property: core(elem), start: head.start, end: this.c,
        loc: { start : head.loc.start, end: this.loc() }, object: inner, computed: true/* ,y:-1*/ };
      inner = head ;
      if ( !this.expectType_soft (']') ) {
        this.err('mem.unfinished')  ;
      }
 
      continue;

    case '(':
      elem = this. parseArgList();
      inner = { type: 'NewExpression', callee: inner, start: startc, end: this.c,
        loc: { start: startLoc, end: this.loc() }, arguments: elem /* ,y:-1*/};
      if ( !this. expectType_soft (')') ) {
        this.err('new.args.is.unfinished') ;
      }

      return inner;

    case '`' :
      elem = this.parseTemplateLiteral () ;
      head = {
        type : 'TaggedTemplateExpression' ,
        quasi :elem ,
        start: head.start,
         end: elem.end,
        loc : { start: head.loc.start, end: elem.loc.end },
        tag : inner /* ,y:-1*/
      };

      inner = head;
      continue ;

    default: return { type: 'NewExpression', callee: inner, start: startc, end: head.end,
      loc: { start: startLoc, end: head.loc.end }, arguments : [] /* ,y:-1*/};

    }
  }
};

