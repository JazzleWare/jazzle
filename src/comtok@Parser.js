this.onComment = function(isBlock,c0,loc0,c,loc) {
  var start_comment = -1, end_comment = -1;
  var start_val = -1, end_val = -1;
  if (isBlock) {
    start_comment = c0 - 2; end_comment = c;
    start_val = c0; end_val = c - 2;
    loc0.column -= 2;
  }
  else {
    var stepBack = -1;
    switch (this.src.charCodeAt(c0-1)) {
    case CH_DIV: // i.e, // comment
      stepBack = 2;
      break;
    case CH_GREATER_THAN: // i.e, --> comment
      stepBack = 1 + 2;
      break;
    case CH_MIN: // i.e, <!-- comment
      stepBack = 2 + 2;
      break;
    }

    start_comment = c0 - stepBack;
    end_comment = c;
    start_val = c0;
    end_val = c;
    loc0.column -= stepBack;
  
  }

  var comment = this.onComment_,
      value = this.src.substring(start_val,end_val);

  if (typeof comment === FUNCTION_TYPE) {
    comment(isBlock,value,c0,c,loc0,loc);
  }
  else {
    comment.push({
      type: isBlock ? 'Block' : 'Line',
      value: value,
      start: start_comment,
      end: end_comment,
      loc: { start: loc0, end: loc }
    });
  }
};

this.onToken = function(token) {
  if (token === null) {
    var ttype = "", tval = "";
    switch (this.lttype) {
    case 'op':
    case '--':
    case '-':
    case '/':
      ttype = 'Punctuator';
      tval = this.ltraw;
      break;

    case 'yield':
    case 'Keyword':
      ttype = 'Keyword';
      tval = this.ltval;
      break;

    case 'u':
      ttype = 'Punctuator';
      tval = this.ltraw;
      break;

    case 'Literal':
      ttype = typeof this.ltval === NUMBER_TYPE ?
        'Numeric' : 'String';
      tval = this.ltraw;
      break;

    case 'Identifier':
      ttype = 'Identifier';
      tval = this.ltraw;
      switch (tval) {
      case 'static':
        if (!this.scope.insideStrict()) 
          break;
      case 'in':
      case 'instanceof':
        ttype = 'Keyword';
      }
      break;

    case 'Boolean':
    case 'Null':
      ttype = this.lttype;
      tval = this.ltval;
      break;

    default:
      ttype = 'Punctuator';
      tval = this.lttype;
      break;
    }

    token = { type: ttype, value: tval, start: this.c0, end: this.c,
      loc: {
        start: { line: this.li0, column: this.col0 },
        end: { line: this.li, column: this.col } } };
  }
  else {
    if (token.type === 'Identifier' &&
       token.value === 'static')
      token.type = 'Keyword';
  }

  var onToken_ = this.onToken_;
  if (typeof onToken_ === FUNCTION_TYPE) {
    onToken_(token);
  }
  else
    onToken_.push(token);

};

this.onToken_kw = function(c0,loc0,val) {
  // TODO: val must=== raw
  this.onToken({
    type: 'Keyword',
    value: val,
    start: c0,
    end: c0+val.length,
    loc: {
      start: loc0,
      end: { line: loc0.line, column: loc0.column + val.length }
    }
  });
};
