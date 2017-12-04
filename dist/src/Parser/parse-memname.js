  import {PREC_NONE} from '../other/lexer-constants.js';
  import {CTX_NULLABLE, CTX_TOP, PAREN, CH_RSQBRACKET} from '../other/constants.js';
  import {CB, core} from '../other/util.js';
  import {cls} from './cls.js';

cls.mem_id = 
function() {
  if (this.v>5)
    return this.id();

  this.validate(this.ltval);
  return this.id();
};

cls.mem_expr = 
function() {
  if (this.v <= 5)
    this.err('ver.mem.comp');

  var c0 = this.c0, b = this.cc(), loc0 = this.loc0();
  this.next() ;
  
  // none of the modifications memberExpr may make to this.pt, this.at, and this.st
  // overwrite some other unrecorded this.pt, this.at, or this.st -- an unrecorded value of <pt:at:st>
  // means a whole elem was just parsed, and <pt:at:st> is immediately recorded after that whole
  // potpat element is parsed, so if a memberExpr overwrites <pt:at:st>, that <pt:at:st> is not an
  // unrecorded one.
  
  // TODO: it is not necessary to reset <pt:at>
  this.pt = this.at = this.st = 0;

  // TODO: should be CTX_NULLABLE, or else the next line is in vain  
  var e = this.parseNonSeq(PREC_NONE, CTX_NULLABLE|CTX_TOP);
  e || this.err('prop.dyna.no.expr');

  var cb = CB(e);
  if (cb.bef) cb.bef.c = b.c.concat(cb.bef.c);
  else cb.bef = b;

  var n = {
    type: PAREN,
    expr: core(e), 
    start: c0,
    end: this.c,
    loc: { start: loc0, end: this.loc() }
  };

  this.spc(core(e), 'aft');
  if (!this.expectT(CH_RSQBRACKET))
    this.err('prop.dyna.is.unfinished');

  return n;
};


