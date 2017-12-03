  import {INTERMEDIATE_ASYNC, CTX_PAT, CH_LPAREN} from '../other/constants.js';
  import {ERR_INTERMEDIATE_ASYNC, ERR_ASYNC_NEWLINE_BEFORE_PAREN} from '../other/error-constants.js';
  import {TK_ID} from '../other/lexer-constants.js';
  import {ST_ASYNC} from '../other/scope-constants.js';
  import {cls} from './cls.js';

cls.parseAsync_otherID =
function(asyncID, ctx) {
  this.cutEx();
  if (this.nl)
    return asyncID;

  this.validate(this.ltval);

  var id = this.id();
  var n = {
    type: INTERMEDIATE_ASYNC,
    id: id,
    start: asyncID.start,
    loc: asyncID.loc,
    asyncID: asyncID
  };

  this.st = ERR_INTERMEDIATE_ASYNC;
  this.se = n;

  return n;
};

cls.parseAsync_exprHead =
function(asyncID, ctx) {
  if (!(ctx & CTX_PAT))
    return asyncID;

  if (this.lttype === TK_ID)
    return this.parseAsync_otherID(asyncID, ctx);

  if (this.lttype !== CH_LPAREN)
    return asyncID;

  var stmt = this.canBeStatement; // save
  if (stmt)
    this.canBeStatement = false;

  var nl = this.nl;
  this.cutEx();

  this.spc(asyncID, 'aft');
  var list = this.parseParen(CTX_PAT), n = null;

  var cb = {};
  if (list['#c'].inner)
    cb.inner = list['#c'].inner;

  n = {
    type: 'CallExpression',
    callee: asyncID,
    start: asyncID.start,
    end: list.end,
    arguments: list.expr ?
      list.expr.type === 'SequenceExpression' ?
        list.expr.expressions :
        [list.expr] :
      [],
    loc: {
      start: asyncID.loc.start,
      end: list.loc.end
    },
    '#y': this.Y(list), '#c': cb
  };

  if (nl) {
    this.pt = ERR_ASYNC_NEWLINE_BEFORE_PAREN;
    this.pe = n;
  }

  if (stmt)
    this.canBeStatement = true; // restore

  return n;
};

cls.parseAsync_fn =
function(asyncID, ctx) {
  if (this.nl) 
    return asyncID;

  var asyncFn = this.parseFn(ctx, ST_ASYNC);
  asyncFn.start = asyncID.start;
  asyncFn.loc.start = asyncID.loc.start;

  asyncFn['#c']['async.bef'] = asyncID['#c'].bef;
  return asyncFn;
};

cls.parseAsync =
function(asyncID, ctx) {
  if (this.peekID('function'))
    return this.parseAsync_fn(asyncID, ctx);

  this.cutEx();
  return this.parseAsync_exprHead(asyncID, ctx);
};


