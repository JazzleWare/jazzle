this.parseTail =
function(head) {
  if (head.type === 'Identifier')
    this.scope.refDirect_m(_m(head.name), null);

  switch (this.lttype) {
  case CH_SINGLEDOT:
  case CH_LSQBRACKET:
  case CH_LPAREN:
  case CH_BACKTICK:
    this.st_flush();
  }

  var inner = core(head), elem = null;

  LOOP:
  while (true) {
    switch (this.lttype) {
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
      if (!this.expectT(CH_RSQBRACKET))
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
      if (!this.expectT(CH_RPAREN))
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
