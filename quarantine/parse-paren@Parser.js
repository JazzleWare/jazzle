this.parseParen = function(ctx) {
  var c0 = this.c0, loc0 = this.loc0(),
      list = null, prevys = this.suspys,
      elctx = CTX_NONE, hasRest = false,
      pc0 = -1, pli0 = -1, pcol0 = -1,
      sc0 = -1, sli0 = -1, scol0 = -1,
      st = ERR_NONE_YET, se = null, so = null,
      pt = ERR_NONE_YET, pe = null, po = null,
      insideParams = false,
      parenScope = null;

  if (ctx & CTX_PAT) {
    this.pt = this.st = ERR_NONE_YET;
    this.pe = this.po =
    this.se = this.so = null;
    this.suspys = null;
    elctx = CTX_PAT|CTX_PARAM|CTX_NULLABLE;
    this.enterScope(this.scope.parenScope());
    insideParen = true;
  }
  else
    elctx = CTX_TOP;

  var lastElem = null, hasTailElem = false;
  this.next();
  while (true) {
    lastElem = elem;
    elem = this.parseNonSeqExpr(PREC_NONE, elctx);
    if (elem === null) {
      if (this.lttype === TK_ELLIPSIS) {
        if (!errt_paramList(elctx)) {
          this.st_teot(ERR_UNEXPECTED_REST,null,null);
          this.flushSimpleErrors();
        }
        elem = this.parseSpread(elctx);
        hasRest = true;
      }
      else if (list) {
        if (this.v < 7)
          this.err('seq.non.tail.expr');
        else 
          hasTailElem = true;
      } 
      else break;
    }

    if (errt_paramList(elctx)) {
      if (errt_ptrack(elctx)) {
        if (this.pt === ERR_NONE_YET && !hasTailElem) {
          // TODO: function* l() { ({[yield]: (a)})=>12 }
          if (elem.type === PAREN_NODE) {
            this.pt = ERR_PAREN_UNBINDABLE;
            this.pe = elem;
          }
          else if(this.suspys) {
            this.pt = ERR_YIELD_OR_SUPER;
            this.pe = this.suspys;
          }
        }
        if (this.pt_override(pt)) {
          pt = this.pt, pe = this.pe, po = core(elem);
          if (errt_pin(pt))
            pc0 = this.ploc.c0, pli0 = this.ploc.li0, pcol0 = this.ploc.col0;
          if (errt_psyn(pt))
            elctx |= CTX_HAS_A_PARAM_ERR;
        }
      }

      if (errt_strack(elctx)) {
        if (this.st === ERR_NONE_YET) {
          if (hasRest) {
            this.st = ERR_UNEXPECTED_REST;
            this.se = elem;
          }
          else if (hasTailElem) {
            this.st = ERR_NON_TAIL_EXPR;
            this.se = lastElem;
          }
        }
        if (this.st_override(st)) {
          st = this.st, se = this.se, so = elem && core(elem);
          if (errt_pin(st))
            sc0 = this.eloc.c0, sli0 = this.eloc.li0, scol0 = this.eloc.col0;
          if (errt_ssyn(st))
            elctx |= CTX_HAS_A_SIMPLE_ERR;
        }
      }
    }

    if (hasTailElem)
      break;

    if (list) list.push(core(elem));
    if (this.lttype === CH_COMMA) {
      if (hasRest)
        this.err('rest.arg.has.trailing.comma');
      if (list === null)
        list = [core(elem)];
      this.next();
    }
    else break;
  }

  var n = {
      type: PAREN_NODE,
      expr: list ? {
        type: 'SequenceExpression',
        expressions: list,
        start: list[0].start,
        end: list[list.length-1].end,
        loc: {
          start: list[0].loc.start,
          end: list[list.length-1].loc.end
        } 
      } : elem && core(elem),
      start: c0,
      end: this.c,
      loc: { start: loc0, end: this.loc() }
  };

  if (!this.expectT(CH_RPAREN))
    this.err('unfinished.paren',{tn:n});

  if (elem === null && list === null) {
    if (ctx & CTX_PARPAT) {
      st = ERR_EMPTY_LIST_MISSING_ARROW;
      se = so = n;
    }
    else {
      this.st_teot(ERR_EMPTY_LIST_MISSING_ARROW,n,n);
      this.flushSimpleErrors();
    }
  }

  if (errt_pat(ctx)) {
    if (pt !== ERR_NONE_YET) {
      this.pt_teot(pt,pe,po);
      errt_pin(pt) && this.ppin(pc0,pli0,pcol0);
    }
    if (st !== ERR_NONE_YET) {
      this.st_teot(st,se,so);
      errt_pin(st) && this.spin(sc0,sli0,scol0);
    }
    if (list === null && elem !== null &&
       elem.type === 'Identifier' && elem.name === 'async')
      this.parenAsync = n;
  }

  if (prevys !== null)
    this.suspys = prevys;

  if (insideParams)
    parenScope = this.exitScope();

  this.parenScope = parenScope;

  return n;
};

this.dissolveParen = function() {
  if (this.parenScope) {
    this.parenScope.dissolve();
    this.parenScope = null;
  }
};
