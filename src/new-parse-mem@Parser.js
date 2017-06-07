this.parseMem =
function(ctx, st) {
  var firstMod = null, latestMod = null, nonMod = null;
  var mpending = ST_NONE, nina = false; // name is newline async

  var c0 = -1, loc0 = null;
  if (this.lttype === TK_ID) {
    firstMod = latestMod = this.id();
    c0 = firstMod.start, loc0 = firstMod.loc.start;

    MM:
    while (true) {
      switch (latestMod.name) {
      case 'static':
        st |= mpending;
        if (!(st & ST_CLSMEM)) { nonMod = latestMod; break MM; }
        if (st & ST_STATICMEM) { nonMod = latestMod; break MM; }
        if (st & ST_ASYNC) { nonMod = latestMod; break MM; }
        mpending = ST_STATICMEM;
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
        mpending = ST_NONE;
        break MM;
      }

      if (this.lttype === TK_ID)
        latestMod = this.id();
      else break;
    }
  }

  if (this.peekMul()) {
    this.v<=5 && this.err('ver.mem.gen');
    if (nonMod) this.err('gen.has.non.modifier');
    st |= mpending;
    if (st & ST_ASYNC)
      this.ga();
    st |= ST_GEN
    if (latestMod)
      latestMod = null;
    else { c0 = this.c0, loc0 = this.loc0(); }
    mpending = ST_NONE;
    this.next();
  }

  var memName = null, nameVal = "";
  if (mpending === ST_NONE && latestMod) { // if the most recent token is a "real" (i.e., non-get/set) non-modifier ID
    memName = latestMod;
    nameVal = memName.name;
  }
  else {
    switch (this.lttype) {
    case TK_ID:
      // if the current token is an id, either the most recent token is a '*' (in which case latestMod is null),
      // or the current token is the first one we have reached since entering parseMem (in which case latestMod is, once again, null).
      // if mpending is not ST_NONE, we will not have reached the else we are in now; the test below, then, is there for mere safety, as to err is human
      if (latestMod !== null)
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
        // unnecessary because it is either static, async, set, or get
        nameVal = memName.name;
      }
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

  if (this.lttype === CH_LPAREN) {
    if (this.v <= 5) this.err('ver.mem.meth');
    var mem = this.parseMeth(memName, ctx, st);
    if (c0 !== -1 && c0 !== mem.start) {
      mem.start = c0;
      mem.loc.start = loc0;
    }
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
    val = this.parseNonSeq(PREC_NONE, ctx);
    if (errt_track(ctx) && val.type === PAREN_NODE) {
      // if there is no error after the parseNonSeq above
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

    var computed = memName.type === PAREN ;
    if (!(computed && core(memName).type === 'Identifier'))
      this.inferName(core(memName), core(val));

    val = {
      type: 'Property',
      start: memName.start,
      key: core(memName),
      end: val.end,
      kind: 'init',
      loc: { start: memName.loc.start, end: val.loc.end },
      computed: computed,
      method: false,
      shorthand: false,
      value: core(val),
      '#y': computed ? this.Y(core(memName)) : 0
    };

    if (hasProto)
      this.first__proto__ = val;

    return val;

  case TK_SIMP_ASSIG:
    if (this.v <= 5)
      this.err('mem.short.assig');
    if (memName.type !== 'Identifier')
      this.err('obj.prop.assig.not.id',{tn:memName});
    if (this.ltraw !== '=')
      this.err('obj.prop.assig.not.assig');
    if (errt_noLeak(ctx)) // if the owner is not leaky
      this.err('obj.prop.assig.not.allowed');

    this.validate(memName.name);
    this.scope.refDirect_m(_m(memName.name), null);
    val = this.parseAssignment(memName, ctx);
    if (errt_strack(ctx) && this.st === ERR_NONE_YET) {
      this.st = ERR_SHORTHAND_UNASSIGNED;
      this.se = val;
    }

    break;

  default:
    if (this.v <= 5)
      this.err('mem.short');
    if (memName.type !== 'Identifier')
      this.err('obj.prop.assig.not.id',{tn:memName});
    this.validate(memName.name);
    this.scope.refDirect_m(_m(memName.name), null);
    val = memName;
    break;
  }

  return {
    type: 'Property',
    key: memName,
    start: val.start,
    end: val.end,
    loc: val.loc,
    kind: 'init',
    shorthand: true,
    method: false,
    value: val,
    computed: false,
    '#y': 0
  };
};
