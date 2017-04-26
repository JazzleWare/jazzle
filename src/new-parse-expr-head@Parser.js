this.parseExprHead =
function(ctx) {
  var head = null;
  switch (this.lttype) {
  case TK_ID:
    if (head = this.parseIDExprHead(ctx))
      break;

    // the head is not an id-statement,
    // but it is not an id-expr either.
    // this is actually the case for
    // void, typeof, yield, delete, and await
    return null;

  case CH_LSQBRACKET:
    head = this.parseArrayExpression(ctx);
    break;

  case CH_LPAREN:
    head = this.parseParen(ctx);
    break;

  case CH_LCURLY:
    head = this.parseObjectExpression(ctx);
    break;

  case CH_MULTI_QUOTE:
  case CH_SINGLE_QUOTE:
    head = this.parseString(this.lttype);
    break;

  case TK_NUM:
    head = this.getLit_num();
    break;

  case CH_DIV:
    head = this.parseRegExpLiteral();
    break;

  case CH_BACKTICK:
    head = this.parseTemplateLiteral();
    break;

  case TK_UNBIN:
    this.prec = PREC_UNARY;
    return null;

  default: return null;
  }

  if (head.type === 'Identifier')
    this.scope.refDirect_m(_m(head.name), null);

  switch (this.lttype) {
  case CH_SINGLEDOT:
  case CH_LSQBRACKET:
  case CH_LPAREN:
  case CH_BACKTICK:
    this.flushNonSimpErrors();
  }

  var inner = core(head), elem = null;

  LOOP:
  while (true) {
    switch (this.ltype) {
    case CH_SINGLEDOT:
      this.next();
      if (this.lttype !== TK_ID)
        this.err('mem.name.not.id');
      elem = this.memberID();
      if (elem === null)
        this.err('mem.id.is.null');
      head = inner = {
        type: 'MemberExpression',
        property: elem,
        start: head.start,
        end: elem.end,
        object: inner,
        loc: {
          start: head.loc.start,
          end: elem.loc.end },
        computed: false,
        '#y': -1
      };
      continue;

    case CH_LSQBRACKET:
      this.next();
      elem = this.parseExpr(PREC_NONE, CTX_NONE);
      head = inner = {
        type: 'MemberExpression',
        property: core(elem),
        start: head.start,
        end: this.c,
        loc: {
          start: head.loc.start,
          end: this.loc() },
        computed: true,
        '#y': -1
      };
      if (!this.expectType_soft(CH_RSQBRACKET))
        this.err('mem.unfinished');
      continue;

    case CH_LPAREN:
      elem = this.parseArgList();
      head = inner = {
        type: 'CallExpression',
        callee: inner,
        start: head.start,
        end: this.c,
        arguments: elem,
        loc: {
          start: head.loc.start,
          end: this.loc() },
        '#y': -1
      };
      if (!this.expectType_soft(CH_RPAREN))
        this.err('call.args.is.unfinished');
      continue;

    case CH_BACKTICK:
      elem = this.parseTemplateLiteral();
      head = inner = {
        type: 'TaggedTemplateLiteral',
        quasi: elem,
        start: head.start,
        end: elem.end,
        loc: {
          start: head.loc.start,
          end: elem.loc.end },
        tag: inner,
        '#y': -1
      };
      continue;

    default: break LOOP;
    }
  }

  return head;
};
