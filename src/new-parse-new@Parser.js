this.parseNew =
function() {
  this.resvchk();
  var c0 = this.c0, loc0 = this.loc0();
  var c = this.c, li = this.li, col = this.col;

  this.next(); // 'new'
  if (this.lttype === CH_SINGLEDOT) {
    this.next();
    return this.parseMeta(c0,loc0,c,li,col);
  }

  var head = this.parseExprHead(CTX_NONE);
  if (head === null)
    this.err('new.head.is.not.valid');

  var inner = core(head), elem = null;

  LOOP:
  while (true)
  switch (this.lttype) {
  case CH_SINGLEDOT:
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
      '#y': this.Y(head)
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
      object: inner,
      loc: {
        start: head.loc.start,
        end: this.loc() },
      computed: true,
      '#y': this.Y(head)+this.Y(elem)
    };
    if (!this.expectT(CH_RSQBRACKET))
      this.err('mem.unfinished');
    continue;

  case CH_LPAREN:
    elem = this.parseArgList();
    head = inner = {
      type: 'NewExpression',
      callee: inner,
      start: c0,
      end: this.c,
      arguments: elem,
      loc: {
        start: loc0,
        end: this.loc() },
      '#y': this.Y(head)+this.y
    };
    if (!this.expectT(CH_RPAREN))
      this.err('new.args.is.unfinished');
    break LOOP;

  case CH_BACKTICK:
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

  default:
    head = {
      type: 'NewExpression',
      callee: inner,
      start: c0,
      end: head.end,
      loc: {
        start: loc0,
        end: head.loc.end },
      arguments : [],
      '#y': this.Y(head)
    };
    break LOOP;
  }

  return head;
};
