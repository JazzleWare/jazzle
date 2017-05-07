this.parseParams =
function(argLen) {
  var
    c0 = -1, li0 = -1, col0 = -1,
    tail = true, elem = null,
    list = [],
    gnsa = false;

  if (!this.expectT(CH_LPAREN))
    this.err('fun.args.no.opening.paren');

  while (list.length !== argLen) {
    elem = this.parsePat();
    if (elem) {
      if (this.peekEq()) {
        this.scope.enterUniqueArgs();
        elem = this.parsePat_assig(elem);
      }
      if (!gnsa && elem.type !== 'Identifier') {
        gnsa = true;
        this.scope.firstNonSimple = elem;
      }
      list.push(elem);
    }
    else {
      if (list.length !== 0) // trailing comma
        this.v<7 &&
        this.err('arg.non.tail.in.fun',
          {c0:c0,li0:li0,col0:col0});

      break;
    }

    if (this.lttype === CH_COMMA) {
      c0 = this.c0;
      li0 = this.li0;
      col0 = this.col0;
      this.next();
    }
    else { tail = false; break; }
  }

  if (argLen === ARGLEN_ANY) {
    if (tail && this.lttype === TK_ELLIPSIS) {
      this.scope.enterUniqueArgs();
      elem = this.parsePat_rest();
      list.push(elem);
      if (!gnsa) {
        gnsa = true;
        this.scope.firstNonSimple = elem;
      }
    }
  }
  else if (list.length !== argLen)
    this.err('fun.args.not.enough');

  if (!this.expectT(CH_RPAREN))
    this.err('fun.args.no.end.paren');

  return list;
};
