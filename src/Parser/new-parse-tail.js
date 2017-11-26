  import {_m} from '../other/scope-util.js';
  import {CH_SINGLEDOT, CH_LSQBRACKET, CH_LPAREN, CH_BACKTICK, CTX_NONE, CH_RSQBRACKET, CH_RPAREN} from '../other/constants.js';
  import {core} from '../other/util.js';
  import {TK_ID, PREC_NONE} from '../other/lexer-constants.js';
  import {cls} from './ctor.js';

cls.parseTail =
function(head) {
  if (head.type === 'Identifier')
    head['#ref'] = this.scope.refDirect_m(_m(head.name), null);

  switch (this.lttype) {
  case CH_SINGLEDOT:
  case CH_LSQBRACKET:
  case CH_LPAREN:
  case CH_BACKTICK:
    this.st_flush();
  }

  var argloc = null, cb = null;
  var inner = core(head), elem = null;

  LOOP:
  while (true) {
    switch (this.lttype) {
    case CH_SINGLEDOT:
      this.spc(inner, 'aft');
      argloc = this.loc0();
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
        '#y': this.Y(head), '#acloc': argloc, '#c': {}
      };
      continue;

    case CH_LSQBRACKET:
      this.spc(inner, 'aft');
      argloc = this.loc0();
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
        '#y': this.Y(head)+this.Y(elem), '#acloc': argloc, '#c': {}
      };
      this.spc(core(elem), 'aft');
      if (!this.expectT(CH_RSQBRACKET))
        this.err('mem.unfinished');
      continue;

    case CH_LPAREN:
      this.spc(inner, 'aft');
      elem = this.parseArgList();
      argloc = this.argploc; this.argploc = null;
      cb = {};
      this.suc(cb, 'inner'); // a(/* inner */); b(e, /* inner */)
      head = inner = {
        type: 'CallExpression',
        callee: inner,
        start: head.start,
        end: this.c,
        arguments: elem,
        loc: {
          start: head.loc.start,
          end: this.loc() },
        '#y': this.Y(head)+this.y, '#argloc': argloc, '#c': cb
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
        '#c': {}, '#y': this.Y(head)+this.Y(elem)
      };
      continue;

    default: break LOOP;
    }
  }

  return head;
};


