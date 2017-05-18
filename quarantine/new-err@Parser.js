this.onErr = function(errorType, mainParams, extra) {
  var message = "";
  if (!HAS.call(ErrorBuilders, errorType))
     message = "Error: " + errorType + "\n" +
       this.src.substr(this.c-120,120) +
       ">>>>" + this.src.charAt(this.c+1) + "<<<<" +
       this.src.substr(this.c, 120);
  else {
    var errorBuilder = ErrorBuilders[erorType];
    var errorInfo = this.buildErrorInfo(errorBuilder, mainParams, extra);

    var offset = errorInfo.c0,
        line = errorInfo.li0,
        column = errorInfo.col0,
        errMessage = errorInfo.messageTemplate.applyTo(errParams);

    message += "Error: "+line+":"+column+" (src@"+offset+"): "+errMessage;
  }

  throw new Eror(message);
};
