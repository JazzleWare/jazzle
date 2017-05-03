this.err = function(errorType, errParams) {
  errParams = this.normalize(errParams);
  return this.errorListener.onErr(errorType, errParams);
};

this.normalize = function(err) {
  // normalized err
  var loc0 = { li: this.li0, col: this.col0 },
      loc = { li: this.li, col: this.col };

  var e = {
    cur0: { c: this.c0, loc: loc0 },
    cur: { c: this.c, loc: loc },
    tn: null,
    parser: this,
    extra: null
  };
  
  if (err) {
    if (err.tn) {
      var tn = err.tn;
      e.tn = tn;

      if (HAS.call(tn,'start')) e.cur0.c = tn.start;
      if (HAS.call(tn,'end')) e.cur.c = tn.end;
      if (tn.loc) {
	if (HAS.call(tn.loc, 'start')) {
          e.cur0.loc.li = tn.loc.start.line;
          e.cur0.loc.col =  tn.loc.start.column;
        }
        if (HAS.call(tn.loc, 'start')) {
          e.cur.loc.li = tn.loc.end.line;
          e.cur.loc.col = tn.loc.end.column;
        }
      }
    }
    if (err.loc0) {
      var loc0 = err.loc0;
      e.cur.loc.li = loc0.line;
      e.cur.loc.col = loc0.column;
    }
    if (err.loc) {
      var loc = err.loc;
      e.cur.loc.li = loc.line;
      e.cur.loc.col = loc.column;
    }

    if (HAS.call(err,'c0'))
      e.cur0.c = err.c0;
    
    if (HAS.call(err,'c'))
      e.cur.c = err.c;

    if (HAS.call(err, 'extra')) 
      e.extra = err.extra;
  }

  e.c0 = e.cur0.c; e.li0 = e.cur0.loc.li; e.col0 = e.cur0.loc.col;
  e.c = e.cur.c; e.li = e.cur.loc.li; e.col = e.cur.loc.col;

  e.loc0 = e.cur0.loc;
  e.loc = e.cur.loc;

  return e;
};

