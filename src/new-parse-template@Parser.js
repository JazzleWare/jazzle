this.parseTemplate =
function() {
  this.v<=5 && this.err('ver.temp');

  // c is on the char after `
  var c0 = this.c0, loc0 = this.loc0();
  var c = this.c, li = this.li, col = this.col;
  var str = [], ex = [];
  var v = "";
  var luo = c;

  var s = this.src, l = s.length;

  var c0s = c0, loc0s = loc0;

  LOOP:
  while (c<l)
  switch (s.charCodeAt(c)) {
  case CH_$:
    if (c+1<l &&
      s.charCodeAt(c+1) === CH_LCURLY) {
      if (luo<c)
        v += s.substring(luo,c);

      this.setoff(c+2);
      str.push({
        type: 'TemplateElement', 
        start: c0s,
        loc: { 
          start: loc0s, 
          end: {
            line: this.li, 
            column: this.col-2 
          }
        },        
        end: c,
        value: {
          raw : s.slice(c0s, c).replace(/\r\n|\r/g,'\n'), 
          cooked: v
        }, 
        tail: false,
      });

      this.next(); // prepare the next token
      var e = this.parseExpr(CTX_TOP);
      if (e === null)
        this.err('templ.expr.is.a.null');
      ex.push(e);
      if (this.lttype !== CH_RCURLY)
        this.err('templ.expr.is.unfinished');

      c = luo = this.c;
      v = "";
      c0s = c;
      loc0s = this.loc0();
    }
    else
      c++;
 
    continue;

  case CH_CARRIAGE_RETURN:
    if (c+1<l && s.charCodeAt(c+1) === CH_LINE_FEED)
      c++;
  case CH_LINE_FEED:
  case 0x2028: case 0x02029:
    if (luo<c)
      v += s.substring(luo,c);
    v += s.charAt(c);
    this.setnewloff(c);
    luo = c;
    continue;

  case CH_BACK_SLASH:
    if (luo<c) v += s.substring(luo,c);

    this.setsimpoff(c);
    v += this.readEsc(true);
    c = luo = this.c;
    continue;

  case CH_BACTTICK:
    break LOOP;

  default: c++;
  }

  if (c >= l || s.charCodeAt(c) !== CH_BACKTICK)
    this.err('template.literal.is.unfinished');

  if (luo<c)
    v += s.substring(luo,c);

  this.setsimpoff(c+1); // '`'
  str.push({
    type: 'TemplateElement',
    start: c0s,
    loc: {
      start: loc0s,
      end: {
        line: this.li,
        column: this.col-1
      }
    },
    end: c,
    value: {
      raw: s.slice(c0s,c).replace(/\r\n|\r/g,'\n'), 
      cooked: v 
    },
    tail: true
  });

  var n = {
    type: 'TemplateLiteral',
    start: c0,
    quasis: str,
    end: c,
    expressions: ex,
    loc: { start: loc0, end : this.loc() },
    '#y': -1
  };

  this.next();

  return n;
};