this.parseMeta =
function(c0,loc0,c,li,col) {
  this.v<=5 && this.err('ver.ntarget');
  this.lttype !== TK_ID && this.err('ntarget.id');
  if (this.ltval !== 'target')
    this.err('meta.new.has.unknown.prop');
  
  if (!this.scope.canHaveNewTarget())
    this.err('meta.new.not.in.function',{c0:startc,loc:startLoc});

  var prop = this.id();

  return {
    type: 'MetaProperty',
    meta: {
      type: 'Identifier',
      name : 'new',
      start: c0,
      end: c,
      loc: {
        start : loc0,
        end: { line: li, column: col }
      } 
    },
    start : c0,
    property: prop,
    end: prop.end,
    loc : { start: loc0, end: prop.loc.end }
  };
};
