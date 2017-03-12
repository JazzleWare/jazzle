this.parseMeth = function(name, context, st) {
  if (this.lttype !== '(')
    this.err('meth.paren');
  var val = null;

  if (!(st & (ST_GEN|ST_ASYNC|ST_CTOR|ST_GETTER|ST_SETTER)))
    st |= ST_METH;

  if (st & ST_CLSMEM) {
    // all modifiers come at the beginning
    if (st & ST_STATICMEM) {
      if (context & CTX_HASPROTOTYPE)
        this.err('class.prototype.is.static.mem',{tn:name,extra:flags});

      st &= ~ST_CTOR;
    }

    if (st & ST_CTOR) {
      if (st & ST_SPECIAL)
        this.err('class.constructor.is.special.mem',{tn:name, extra:{flags:flags}});
      if (context & CTX_CTOR_NOT_ALLOWED)
        this.err('class.constructor.is.a.dup',{tn:name});
    }

    val = this.parseFunc(CTX_NONE, st);

    return {
      type: 'MethodDefinition', key: core(name),
      start: name.start, end: val.end,
      kind: (st & ST_CTOR) ? 'constructor' : (st & ST_GETTER) ? 'get' :
            (st & ST_SETTER) ? 'set' : 'method',
      computed: name.type === PAREN,
      loc: { start: name.loc.start, end: val.loc.end },
      value: val, 'static': !!(st & ST_STATICMEM)/* ,y:-1*/
    }
  }
   
  val = this.parseFunc(CTX_NONE, st);

  return {
    type: 'Property', key: core(name),
    start: name.start, end: val.end,
    kind:
     !(st & ST_ACCESSOR) ? 'init' :
      (st & ST_SETTER) ? 'set' : 'get',
    computed: name.type === PAREN,
    loc: { start: name.loc.start, end : val.loc.end },
    method: (st & ST_ACCESSOR) === 0, shorthand: false,
    value : val/* ,y:-1*/
  }
};

