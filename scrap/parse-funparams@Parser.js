this.parseArgs = function (argLen) {
  var c0 = -1, li0 = -1, col0 = -1, tail = true,
      list = [], elem = null;

  if (!this.expectType_soft('('))
    this.err('func.args.no.opening.paren');

  var gotNonSimple = false;
  while (list.length !== argLen) {
    elem = this.parsePattern();
    if (elem) {
      if (this.lttype === 'op' && this.ltraw === '=') {
        this.scope.enterUniqueArgs();
        elem = this.parseAssig(elem);
      }
      if (!gotNonSimple && elem.type !== 'Identifier') {
        gotNonSimple = true;
        this.scope.firstNonSimple = elem;
      }
      list.push(elem);
    }
    else {
      if (list.length !== 0) {
        if (this.v < 7)
          this.err('arg.non.tail.in.func',
            {c0:c0,li0:li0,col0:col0,extra:{list:list}});
      }
      break ;
    }

    if (this.lttype === ',' ) {
      c0 = this.c0, li0 = this.li0, col0 = this.col0;
      this.next();
    }
    else { tail = false; break; }
  }
  if (argLen === ARGLEN_ANY) {
    if (tail && this.lttype === '...') {
      this.scope.enterUniqueArgs();
      elem = this.parseRestElement();
      list.push(elem);
      if (!gotNonSimple) {
        gotNonSimple = true;
        this.scope.firstNonSimple = elem;
      }
    }
  }
  else if (list.length !== argLen)
    this.err('func.args.not.enough');

  if (!this.expectType_soft (')'))
    this.err('func.args.no.end.paren');

  if (this.scope.insideUniqueArgs())
    this.scope.exitUniqueArgs();

  return list;
};


