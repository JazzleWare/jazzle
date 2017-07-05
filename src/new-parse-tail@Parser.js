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

  var cb = null;
  var inner = core(head), elem = null;

  LOOP:
  while (true) {
    switch (this.lttype) {
    case CH_SINGLEDOT:
      this.spc(inner, 'aft');
      this.next();
      if (this.lttype !== TK_ID)
        this.err('mem.name.not.id');
      elem = this.mem_id();
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
        '#y': this.Y(head), '#c': {}
      };
      continue;

    case CH_LSQBRACKET:
      this.spc(inner, 'aft');
      this.next();
      elem = this.parseExpr(PREC_NONE, CTX_NONE);
      head = inner = {
        type: 'MemberExpression',
        property: core(elem),
        start: head.start,
        end: this.c,
        object: inner,
        loc: {
          start: head.loc.start,
          end: this.loc() },
        computed: true,
        '#y': this.Y(head)+this.Y(elem), '#c': {}
      };
      this.spc(core(elem), 'aft');
      if (!this.expectT(CH_RSQBRACKET))
        this.err('mem.unfinished');
      continue;

    case CH_LPAREN:
      this.spc(inner, 'aft');
      elem = this.parseArgList();
      cb = {};
      elem.length || this.suc(cb, 'inner');
      head = inner = {
        type: 'CallExpression',
        callee: inner,
        start: head.start,
        end: this.c,
        arguments: elem,
        loc: {
          start: head.loc.start,
          end: this.loc() },
        '#y': this.Y(head)+this.y, '#c': cb
      };
      if (!this.expectT(CH_RPAREN))
        this.err('call.args.is.unfinished');
      continue;

    case CH_BACKTICK:
      this.spc(inner, 'aft');
      elem = this.parseTemplate();
      head = inner = {
        type: 'TaggedTemplateExpression',
        quasi: elem,
        start: head.start,
        end: elem.end,
        loc: {
          start: head.loc.start,
          end: elem.loc.end },
        tag: inner,
        '#y': this.Y(head)+this.Y(elem)
      };
      continue;

    default: break LOOP;
    }
  }

  return head;
};
