this.parseMem =
function(ctx, st) {
  var firstMod = null, latestMod = null, nonMod = null;
  var mpending = ST_NONE, nina = false; // name is newline async

  if (this.lttype === TK_ID) {
    firstMod = latestMod = this.id();

    MM:
    while (true) {
      switch (latestMod.name) {
      case 'static':
        st |= mpending;
        if (!(st & ST_CLSMEM)) { nonMod = latestMod; break MM; }
        if (st & ST_STATICMEM) { nonMod = latestMod; break MM; }
        if (st & ST_ASYNC) { nonMod = latestMod; break MM; }
        mpending = ST_STATIC;
        break;

      case 'get':
      case 'set':
        st |= mpending;
        nonMod = latestMod;
        if (st & ST_ACCESSOR) break MM;
        if (st & ST_ASYNC) break MM;
        mpending = latestMod.name === 'get' ? ST_GETTER : ST_SETTER;
        break;

      case 'async':
        st |= mpending;
        if (this.nl) { // an async with a newline coming after it is not a modifier
          nina = true;
          nonMod = latestMod;
          break MM;
        }
        if (st & ST_ACCESSOR) { nonMod = latestMod; break MM }
        if (st & ST_ASYNC) { nonMod = latestMod; break MM; }
        mpending = ST_ASYNC;
        break;

      default:
        st |= mpending;
        nonMod = latestMod;
        break MM;
      }

      if (this.lttype === TK_ID)
        latestMod = this.id();
      else break;
    }
  }

  var memName = null;
  if (nonMod)
    memName = nonMod;
  else {
    if (this.peekMul()) {
      if (this.v<=5)
        this.err('ver.mem.gen');
      if (st & ST_ASYNC)
        this.err('async.gen.not.supported.yet');
      latestMod = null;
      st |= mpending|ST_GEN;
      this.next();
    }
    var nameVal = "";
    switch (this.lttype) {
    case TK_ID:
      if (latestMod !== null) // must not actually happen unless (st & ST_GEN) holds to be true
        this.err('pending.id');

      st |= mpending;
      nameVal = this.ltval;
      memName = this.mem_id();
      break;

    case CH_LSQBRACKET:
      st |= mpending;
      memName = this.mem_expr();
      break;

    case TK_NUM:
      st |= mpending;
      memName = this.getLit_num();
      break;

    case CH_MULTI_QUOTE:
    case CH_SINGLE_QUOTE:
      st |= mpending;
      memName = this.parseString(this.lttype);
      nameVal = memName.value;
      break;

    default:
      if (latestMod) {
        memName = latestMod;
        nameVal = memName.name; // unnecessary
      }
    }

    if (memName === null) {
      if (st & ST_GEN)
        this.err('mem.gen.has.no.name');
      return null;
    }

    if (st & ST_CLSMEM)
      switch (nameVal) {
      case 'prototype':
        ctx |= CTX_HASPROTOTYPE;
        break;

      case 'constructor':
        st |= ST_CTOR;
        break;
      }
    else if (this.v>5 && nameVal === '__proto__')
      ctx |= CTX_HASPROTO;
  }

  if (this.lttype === CH_LPAREN) {
    if (this.v <= 5) this.err('ver.mem.meth');
    var mem = this.parseMeth(memName, ctx, st);
    // TODO: loc adjustment
    return mem;
  }

  if (st & (ST_STATICMEM|ST_GEN|ST_CLSMEM|ST_ASYNC|ST_ACCESSOR))
    this.err('meth.paren');

  return this.parseNonMethObjMem(memName, ctx);
};

this.parseNonMethObjMem =
function(memName, ctx) {
  var hasProto = ctx & CTX_HASPROTO, firstProto = this.first__proto__;
  var val = null;
  ctx &= ~CTX_HASPROTO; // unnecessary (?)

  switch (this.lttype) {
  case CH_COLON:
    if (hasProto && firstProto)
      this.err('obj.proto.has.dup',{tn:memName});

    this.next();
    val = this.parseNonSeqExpr(PREC_NONE, ctx);
    if (errt_track(ctx) && val.type === PAREN_NODE) {
      // if there is no error after the parseNonSeqExpr above
      if (errt_ptrack(ctx) && this.pt === ERR_NONE_YET) {
        this.pt = ERR_PAREN_UNBINDABLE;
        this.pe = val;
      }
      if (errt_atrack(ctx) && this.at === ERR_NONE_YET &&
        !this.ensureSAT(val.expr)) {
        this.at = ERR_PAREN_UNBINDABLE;
        this.ae = val;
      }
    }

    val = {
      type: 'Property',
      start: memName.start,
      key: core(memName),
      end: val.end,
      kind: 'init',
      loc: { start: memName.loc.start, end: val.loc.end },
      computed: memName.type === PAREN,
      method: false,
      shorthand: false,
      value: core(val),
      '#y': -1
    };

    if (hasProto)
      this.first__proto__ = val;

    return val;

  case TK_SIMPLE_BINARY:
    if (this.v <= 5)
      this.err('mem.short.assig');
    if (memName.type !== 'Identifier')
      this.err('obj.prop.assig.not.id',{tn:memName});
    if (this.ltraw !== '=')
      this.err('obj.prop.assig.not.assig');
    if (errt_noLeak(ctx)) // if the owner is not leaky
      this.err('obj.prop.assig.not.allowed');

    val = this.parseAssig(memName, ctx);
    if (errt_strack(ctx) && this.st === ERR_NONE_YET) {
      this.st = ERR_SHORTHAND_UNASSIGNED;
      this.se = val;
    }

    break;

  default:
    if (this.v <= 5)
      this.err('mem.short');
    if (name.type !== 'Identifier')
      this.err('obj.prop.assig.not.id',{tn:memName});
    this.validate(memName.name);
    val = memName;
    break;
  }

  return {
    type: 'Property',
    key: name,
    start: val.start,
    end: val.end,
    loc: val.loc,
    kind: 'init',
    shorthand: true,
    method: false,
    value: val,
    computed: false,
    '#y': -1
  };
};
