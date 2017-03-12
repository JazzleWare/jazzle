this.str = function() {
  var emitter = new Emitter();
  this.writeTo(emitter);
  return emitter.code;
};

this.typeString = function() {
  var str = "";

  if (this.type & ST_GLOBAL) str += ":global"; 
  if (this.type & ST_MODULE) str += ":module"; 
  if (this.type & ST_SCRIPT) str += ":script";
  if (this.type & ST_DECL) str += ":decl";
  if (this.type & ST_CLS) str += ":class";
  if (this.type & ST_FN) str += ":fn";
  if (this.type & ST_CLSMEM) str += ":clsmem";
  if (this.type & ST_GETTER) str += ":getter";
  if (this.type & ST_SETTER) str += ":setter";
  if (this.type & ST_STATICMEM) str += ":static";
  if (this.type & ST_CTOR) str += ":ctor";
  if (this.type & ST_OBJMEM) str += ":objmem";
  if (this.type & ST_ARROW) str += ":arrow";
  if (this.type & ST_BLOCK) str += ":block";
  if (this.type & ST_CATCH) str += ":catch";
  if (this.type & ST_ASYNC) str += ":async";
  if (this.type & ST_BARE) str += ":bare";
  if (this.type & ST_BODY) str += ":body";
  if (this.type & ST_METH) str += ":meth";
  if (this.type & ST_EXPR) str += ':expr';
  if (this.type & ST_GEN) str += ":gen";
  if (this.type & ST_HEAD) str += ":head";
  if (this.type & ST_PAREN) str += ":paren";

  return str;
};

this.writeTo = function(emitter) {
  var defs = this.defs,
      scopes = this.ch,
      si = 0,
      di = 0;

  emitter.w(this.headI+':<scope type="'+this.typeString()+'">');
  if (defs.keys.length !== 0 || scopes.length !== 0) {
    emitter.i();
    while (true) {
      var def = null,
          scope = null;
      if (di < defs.keys.length)
        def = defs.at(di);
      if (si < scopes.length)
        scope = scopes[si];
      if (scope === null && def === null)
        break;

      if (def && (scope === null || def.i < scope.headI)) {
        emitter.l();
        def.writeTo(emitter); di++;
      }
      else if (scope && (def === null || scope.headI < def.i)) {
        emitter.l()
        scope.writeTo(emitter); si++;
      }
    }
    emitter.u().l()
  }

  emitter.w(this.tailI+':</scope>');
};
