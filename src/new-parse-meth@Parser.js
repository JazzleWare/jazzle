this.parseMeth =
function(memName, ctx, st) {
  if (this.lttype !== CH_LPAREN)
    this.err('meth.paren');

  var val = null, computed = memName.type === PAREN ;

  if (st & ST_CLSMEM) {
    if (st & ST_STATICMEM) {
      if (ctx & CTX_HASPROTOTYPE)
        this.err('cls.prototype.is.static.mem',
          {tn:memName});
      if (st & ST_CTOR)
        st &= ~ST_CTOR;
    }
    if (st & ST_CTOR) {
      if (st !== (ST_CTOR|ST_CLSMEM))
        this.err('class.ctor.is.special.mem',
          {tn:memName});
      if (ctx & CTX_CTOR_NOT_ALLOWED)
        this.err('class.ctor.is.dup',{tn:memName});
    }

    val = this.parseFn(CTX_NONE, st);
    var idName = getIDName(memName);
    if (idName !== "")
      val['#scope'].setName(idName, null).t(DT_FNNAME);

    return {
      type: 'MethodDefinition',
      key: core(memName),
      start: memName.start,
      end: val.end,
      kind:
        (st & ST_CTOR) ?
          'constructor' :
          (st & ST_GETTER) ?
            'get' :
            (st & ST_SETTER) ?
              'set' :
              'method',
      computed: computed,
      loc: {
        start: memName.loc.start,
        end: val.loc.end
      },
      value: val,
      'static': !!(st & ST_STATICMEM),
      '#y': computed ? this.Y(memName) : 0
    };
  }

  val = this.parseFn(CTX_NONE, st);

  return {
    type: 'Property',
    key: core(memName),
    start: memName.start,
    end: val.end,
    kind:
      !(st & ST_ACCESSOR) ?
        'init' :
        (st & ST_SETTER) ?
          'set' :
          'get',
    computed: memName.type === PAREN,
    loc: {
      start: memName.loc.start,
      end : val.loc.end
    },
    method: !(st & ST_ACCESSOR),
    shorthand: false,
    value: val,
    '#y': computed ? this.Y(memName) : 0
  };
};
