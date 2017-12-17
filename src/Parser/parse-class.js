  import {ST_NONE, ST_DECL, DT_CLS, ST_EXPR, DT_CLSNAME, ST_CLSMEM, SF_HERITAGE, RS_SCALL, RS_THIS} from '../other/scope-constants.js';
  import {TK_ID} from '../other/lexer-constants.js';
  import {_m} from '../other/scope-util.js';
  import {CTX_DEFAULT, CTX_NONE, CH_LCURLY, CH_SEMI, CTX_CTOR_NOT_ALLOWED, CH_RCURLY, CH_LPAREN, CH_SINGLEDOT, CH_LSQBRACKET} from '../other/constants.js';
  import {cls} from './cls.js';
  import {core} from '../other/util.js';

cls.parseClass = 
function(ctx) {
  if (this.v <= 5)
    this.err('ver.class');
  if (this.unsatisfiedLabel)
    this.err('class.label.not.allowed');

  var c0 = this.c0, cb = {}, loc0 = this.loc0();

  this.suc(cb, 'bef');

  var isStmt = false, name = null;
  if (this.canBeStatement) {
    isStmt = true;
    this.canBeStatement = false;
  }

  this.next(); // 'class'

  var sourceDecl = null;
  var st = ST_NONE;
  if (isStmt) {
    st = ST_DECL;
    if (!this.scope.canDeclareLexical())
      this.err('class.decl.not.in.block',{c0:c0,loc0:loc0});
    if (this.lttype === TK_ID && this.ltval !== 'extends') {
      this.declMode = DT_CLS|this.cutEx();
      name = this.getName_cls(st);
      sourceDecl = this.scope.findDeclOwn_m(_m(name.name));
    }
    else if (!(ctx & CTX_DEFAULT))
      this.err('class.decl.has.no.name', {c0:startc,loc0:startLoc});
  }
  else {
    st = ST_EXPR;
    if (this.lttype === TK_ID && this.ltval !== 'extends')
      name = this.getName_cls(st);
  }

  this.enterScope(this.scope.spawnCls(st));
  var scope = this.scope;

  scope.makeStrict();

  if (name)
    scope.setName(name.name, sourceDecl).t(DT_CLSNAME);

  var superClass = null;
  if (this.lttype === TK_ID && this.ltval === 'extends') {
    name ? this.spc(name, 'aft') : this.suc(cb, 'class.aft');
    this.next();
    superClass = this.parseExprHead(CTX_NONE) || this.err('no.heritage');
    superClass = this.parseTail(superClass);
  }

  var mmflags = ST_CLSMEM, mmctx = CTX_NONE;

  if (superClass)
    this.scope.flags |= SF_HERITAGE;

  var list = [];
  var c0b = this.c0, loc0b  = this.loc0();

  var cbb = {}; this.suc(cbb, 'bef');
  cbb['semis'] = [];
  if (!this.expectT(CH_LCURLY))
    this.err('class.no.curly',{c0:startc,loc0:startLoc,extra:{n:name,s:superClass,c:ctx}});

  var mem = null;

  var y = 0, ct = null;
  while (true) {
    if (this.lttype === CH_SEMI) {
      this.commentBuf && cbb.semis.push([list.length, this.cc()]);
      this.next();
      continue;
    }
    mem = this.parseMem(mmctx, mmflags);
    if (mem !== null) {
      list.push(mem);
      y += this.Y(mem);
      if (mem.kind === 'constructor') {
        ct = mem;
        mmctx |= CTX_CTOR_NOT_ALLOWED;
      }
    }
    else break;
  }

  var eloc = this.loc();
  var n = {
    type: isStmt ? 'ClassDeclaration' : 'ClassExpression',
    id: name,
    start: c0,
    end: this.c,
    superClass: superClass && core(superClass),
    loc: { start: loc0, end: eloc },
    body: {
      type: 'ClassBody',
      loc: { start: loc0b, end: eloc },
      start: c0b,
      end: this.c,
      body: list,
      '#y': y, '#c': cbb
    },
    '#y': (superClass ? this.Y(superClass) : 0)+y,
    '#scope': scope, '#c': cb, '#ct': ct
  };

  this.suc(cbb, 'inner');
  if (!this.expectT(CH_RCURLY))
    this.err('class.unfinished',{tn:n, extra:{delim:'}'}});

  if (name) {
    if (ct) this.inferName(name, ct.value, false);
  }
  this.exitScope();

  if (isStmt)
    this.foundStatement = true;

  return n;
};

cls.parseSuper = function() {
  if (this.v <=5 ) this.err('ver.super');

  var cb = {}; this.suc(cb, 'bef');
  var n = {
    type: 'Super',
    loc: { start: this.loc0(), end: this.loc() },
    start: this.c0,
    end: this.c ,
   '#c': cb,
   '#liq': null,
   '#this': null, '#ti': void 0
  };
 
  this.next();
  switch (this.lttype) {
  case CH_LPAREN:
    if (!this.scope.canScall())
      this.err('class.super.call',{tn:n});
    this.scope.refDirect_m(RS_SCALL, null);
    this.scope.refDirect_m(RS_THIS, null);
    break;
 
  case CH_SINGLEDOT:
  case CH_LSQBRACKET:
    if (!this.scope.canSmem())
      this.err('class.super.mem',{tn:n});
    break ;
  
  default: this.err('class.super.lone',{tn:n}); 
  }
 
  return n;
};


