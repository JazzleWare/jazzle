  import {DT_LET, DT_VAR, DT_CONST} from '../other/scope-constants.js';
  import {CTX_FOR, PE_NO_NONVAR, PE_NO_LABEL, CTX_TOP, CH_COMMA} from '../other/constants.js';
  import {PREC_NONE} from '../other/lexer-constants.js';
  import {core} from '../other/util.js';
  import {cls} from './cls.js';

cls.parseVar =
function(dt, ctx) {
  if (!this.testStmt()) {
    if (dt === DT_LET)
      return this.handleLet(this.id());
    this.err('not.stmt');
  }

  var kind = this.ltval;
  var letID = dt === DT_LET ? this.id() : null;
  var c0 = letID ? letID.start : this.c0;
  var loc0 = letID ? letID.loc.start : this.loc0();
  var vpat = null;

  var y = 0;

  var cb = null;
  if (letID) 
    cb = letID['#c'];
  else { 
    cb = {}; this.suc(cb, 'bef');
    this.next();
  }

  ctx &= CTX_FOR;

  if (!letID || !ctx || !this.peekID('in')) {
    this.setPatCheck(dt !== DT_VAR);
    this.declMode = dt|this.cutEx();
    vpat = this.parsePat();

    if (vpat === null)
    switch (this.vpatErr) {
    case PE_NO_NONVAR:
      this.err('lexical.decl.not.in.block',
        {c0:c0,loc0:loc0,extra:kind});
      break;

    case PE_NO_LABEL:
      this.err('decl.label',{c0:c0,loc0:loc0});
      break;
    }
  }

  if (vpat === null) {
    if (letID) {
      this.canBeStatement = true; // restore it to the value it had when parseVar was initially called
      return this.handleLet(letID);
    }
    this.err('var.has.no.declarators');
  }

  // this.unsatisfiedLabel is intact -- there has been no parsing, only lexing actually
  this.fixupLabels(false);

  var isConst = dt === DT_CONST, mi = false;

  var list = [], last = null;
  while (true) {
    var init = null;
    if (this.peekEq()) {
      this.spc(vpat, 'aft');
      this.next();
      init = this.parseNonSeq(PREC_NONE, ctx|CTX_TOP);
    }
    else if (isConst || vpat.type !== 'Identifier') {
      !(ctx & CTX_FOR) && this.err('const.has.no.init');
      list.length && this.err('missing.init');
      mi = true;
    }
    var ioh = init || vpat;

    var y0 = this.Y(vpat)+(init ? this.Y(init) : 0);
    y += y0;

    init && this.inferName(vpat, core(init), false);
    list.push(last = {
      type: 'VariableDeclarator',
      id: vpat,
      start: vpat.start,
      end: ioh.end,
      loc: {
        start: vpat.loc.start,
        end: ioh.loc.end 
      },
      init: init && core(init),
      '#y': y0, '#c': {}
    });

    if (mi || this.lttype !== CH_COMMA)
      break;

    this.spc(last, 'aft');
    this.next();

    vpat = this.parsePat();
    vpat || this.err('var.has.an.empty.decltor');
  }

  var lastItem = list[list.length-1];
  var ec = -1, eloc = null;

  if (!(ctx & CTX_FOR)) {
    this.semi(last['#c'], 'aft') || this.err('no.semi');
    ec = this.semiC || lastItem.end;
    eloc = this.semiLoc || lastItem.loc.end;
  } else {
    ec = lastItem.end;
    eloc = lastItem.loc.end;
  }

  this.missingInit = mi;

  this.foundStatement = true;
  return {
    type: 'VariableDeclaration',
    kind: kind,
    start: c0,
    declarations: list,
    end: ec,
    loc: { start: loc0, end: eloc },
    '#c': cb,
    '#y': y,
  };
};


