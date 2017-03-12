this.str = function() {
  return this.i+':<decl type="'+
         this.typeString()+'">'+this.name+'</decl>';
};

this.typeString = function() {
  var str = "";

  if (this.mode & DM_CLS) str += ":class";
  if (this.mode & DM_FUNCTION) str += ":func";
  if (this.mode & DM_LET) str += ":let";
  if (this.mode & DM_TEMP) str += ":temp";
  if (this.mode & DM_VAR) str += ":var";
  if (this.mode & DM_CONST) str += ":const";
  if (this.mode & DM_SCOPENAME) str += ":scopename";
  if (this.mode & DM_CATCHARG) str += ":catcharg"; 
  if (this.mode & DM_FNARG) str += ":fnarg";  

  return str;
};

this.writeTo = function(emitter) {
  emitter.w(this.str());
};
