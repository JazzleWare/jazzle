  import {ST_NONE, ST_CLSMEM, ST_STATICMEM, ST_ASYNC, ST_ACCESSOR, ST_GETTER, ST_SETTER, ST_GEN, ST_CTOR} from '../other/scope-constants.js';
  import {TK_ID, TK_NUM, PREC_NONE, TK_SIMP_ASSIG} from '../other/lexer-constants.js';
  import {CH_LSQBRACKET, CH_MULTI_QUOTE, CH_SINGLE_QUOTE, CTX_HASPROTOTYPE, CTX_HASPROTO, CH_LPAREN, CH_COLON, PAREN_NODE, PAREN, HAS} from '../other/constants.js';
  import {core, CB} from '../other/util.js';
  import {errt_track, errt_ptrack, errt_atrack, errt_noLeak, errt_strack} from '../other/errt.js';
  import {ERR_NONE_YET, ERR_PAREN_UNBINDABLE, ERR_SHORTHAND_UNASSIGNED} from '../other/error-constants.js';
  import {_m} from '../other/scope-util.js';
  import Comments from '../Comments/cls.js';
  import {cls} from './cls.js';

cls.parseMem =
function(ctx, st) {
  var firstMod = null, latestMod = null, nonMod = null;
  var mpending = ST_NONE, nina = false; // name is newline async

  var c0 = -1, loc0 = null;

  var lpm = ""; // latest pending modifier, that is.

  var cb = {};

  MM:
  while (this.lttype === TK_ID) {
    if (latestMod) {
      cb[latestMod.name+'.bef'] = latestMod['#c'].bef;
      latestMod = this.id();
    }
    else {
      latestMod = this.id();
      c0 = latestMod.start, loc0 = latestMod.loc.start;
    }
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
  }

  if (this.peekMul()) {
    this.v<=5 && this.err('ver.mem.gen');
    if (nonMod) this.err('gen.has.non.modifier');
    st |= mpending;
    if (st & ST_ASYNC)
      this.ga();
    st |= ST_GEN
    if (latestMod) {
      cb[latestMod.name+'.bef'] = latestMod['#c'].bef;
      latestMod = null;
    }
    else { c0 = this.c0, loc0 = this.loc0(); }
    mpending = ST_NONE;
    cb['*.bef'] = this.cc();
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
      if (latestMod)
        cb[latestMod.name+'.bef'] = latestMod['#c'].bef;
      st |= mpending;
      memName = this.mem_expr();
      break;

    case TK_NUM:
      if (latestMod)
        cb[latestMod.name+'.bef'] = latestMod['#c'].bef;
      st |= mpending;
      memName = this.getLit_num();
      break;

    case CH_MULTI_QUOTE:
    case CH_SINGLE_QUOTE:
      if (latestMod)
        cb[latestMod.name+'.bef'] = latestMod['#c'].bef;
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

  
  this.cb = cb;
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

cls.parseNonMethObjMem =
function(memName, ctx) {
  var hasProto = ctx & CTX_HASPROTO, firstProto = this.first__proto__;
  var cb = this.cb, val = null;
  ctx &= ~CTX_HASPROTO; // unnecessary (?)

  switch (this.lttype) {
  case CH_COLON:
    if (hasProto && firstProto)
      this.err('obj.proto.has.dup',{tn:memName});

    this.spc(core(memName), 'aft');
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
    this.inferName(core(memName), core(val), computed );

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
      '#y': computed ? this.Y(core(memName)) : 0, '#c': cb
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
    memName['#ref'] = this.scope.refDirect_m(_m(memName.name), null);
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
    memName['#ref'] = this.scope.refDirect_m(_m(memName.name), null);
    val = memName;
    if (!HAS.call(cb, 'bef') || cb.bef === null)
      cb.bef = new Comments();
    var cbn = CB(memName);
    if (HAS.call(cbn, 'bef') && cbn.bef) {
      cb.bef.mergeWith(cbn.bef);
      cbn.bef = null;
    }
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
    '#y': 0, '#c': cb
  };
};


