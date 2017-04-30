this.parseMem =
function(ctx, st) {
  var idmod_first = null,
      idmod_latest = null;

  var hasMul = false,
      hasNonmod = false;

  if this.lttype === TK_ID {
    idmod_first = idmod_latest = this.id();

    MM: // memberModifiers
    while (true) {
      if (this.lttype !== TK_ID) {
        hasMul = this.peekOp('*');
        if (!hasMul) break;
      }
      switch (idmod_latest.name) {
      case 'static':
        if (!(st & ST_CLSMEM)) break MM;
        if (st & ST_STATICMEM) break MM;
        if (st & ST_ASYNC) break MM;
        st |= ST_STATICMEM;
        break;

      case 'get':
        if (st & ST_ACCESSOR) break MM;
        if (st & ST_ASYNC) break MM;
        st |= ST_GETTER;
        hasNonmod = true;
        break;

      case 'set':
        if (st & ST_ACCESSOR) break MM;
        if (st & ST_ASYNC) break MM;
        st |= ST_SETTER;
        hasNonmod = true;
        break;

      case 'async':
        if (st & ST_ASYNC) break MM;
        if (st & ST_ACCESSOR) break MM;
        if (this.nl)
          this.err('async.newline');

        st |= ST_ASYNC;
        break;

      default:
        hasNonmod = true;
        break MM;
      }

      if (!hasMul) idmod_latest = this.id();
      else break;
    }
  }
  else if (this.peekOp('*')) 
    hasMul = true;

  if (hasMul) {
    if (this.v<=5)
      this.err('ver.mem.gen');
    if (st & ST_ASYNC)
      this.err('async.gen.not.supported.yet');
    if (hasNonmod)
      this.err('hasnonmod',{tn:idmod_latest});
    this.next();
    if (idmod_latest)
      idmod_latest = null;

    st |= ST_GEN;
  }

  var memName = null;
  if (idmod_first && idmod_first === idmod_latest) {
    if (this.v
