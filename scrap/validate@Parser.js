this .validateID  = function (e) {
  var n = e === "" ? this.ltval : e;

  SWITCH:
  switch (n.length) {
     case  1:
         break SWITCH;
     case  2: switch (n) {
         case 'do':
         case 'if':
         case 'in':
            
            return this.errorReservedID(e);
         default: break SWITCH;
     }
     case 3: switch (n) {
         case 'int' :
            if ( this.v > 5 )
                break SWITCH;
          return  this. errorReservedID(e);

         case 'let' :
            if ( this.v <= 5 || !this.scope.insideStrict() )
              break SWITCH;
         case 'for' : case 'try' : case 'var' : case 'new' :
             return this.errorReservedID(e);

         default: break SWITCH;
     }
     case 4: switch (n) {
         case 'byte': case 'char': case 'goto': case 'long':
            if ( this. v > 5 ) break SWITCH;
         case 'case': case 'else': case 'this': case 'void': case 'true':
         case 'with': case 'enum':
         case 'null':
            return this.errorReservedID(e);

//       case 'eval':
//          if (this.scope.insideStrict()) return this.err('eval.arguments.in.strict');

         default:
            break SWITCH;
     }
     case 5: switch (n) {
         case 'await':
            if (this.isScript &&
               !this.scope.canAwait() && !this.scope.awaitIsKW())
              break SWITCH;
            else
              this.errorReservedID(e);
         case 'final':
         case 'float':
         case 'short':
            if ( this. v > 5 ) break SWITCH;
            return this.errorReservedID(e);
    
         case 'yield': 
            if (!this.scope.insideStrict() && !this.scope.canYield() && !this.scope.yieldIsKW()) {
              break SWITCH;
            }

         case 'break': case 'catch': case 'class': case 'const': case 'false':
         case 'super': case 'throw': case 'while': 
            return this.errorReservedID(e);

         default: break SWITCH;
     }
     case 6: switch (n) {
         case 'double': case 'native': case 'throws':
             if ( this. v > 5 )
                break SWITCH;
             return this.errorReservedID(e); 
         case 'public':
         case 'static':
             if ( this.v > 5 && !this.scope.insideStrict() )
               break SWITCH;
         case 'delete': case 'export': case 'import': case 'return':
         case 'switch': case 'typeof':
            return this.errorReservedID(e) ;

         default: break SWITCH;
     }
     case 7:  switch (n) {
         case 'package':
         case 'private':
            if ( this.scope.insideStrict() ) return this.errorReservedID(e);
         case 'boolean':
            if ( this.v > 5 ) break;
         case 'default': case 'extends': case 'finally':
             return this.errorReservedID(e);

         default: break SWITCH;
     }
     case 8: switch (n) {
         case 'abstract': case 'volatile':
            if ( this.v > 5 ) break;
         case 'continue': case 'debugger': case 'function':
            return this.errorReservedID (e) ;

         default: break SWITCH;
     }
     case 9: switch (n) {
         case 'protected':
         case 'interface':
            if ( this.scope.insideStrict() )
              return this.errorReservedID (e);
         case 'transient':
            if ( this.v <= 5 )
              return this.errorReservedID(e) ;
//       case 'arguments':
//          if (this.scope.insideStrict()) return this.err('eval.arguments.in.strict');

         default: break SWITCH;
     }
     case 10: switch (n) {
         case 'implements':
            if ( this.v > 5 && !this.scope.insideStrict() ) break ;
         case 'instanceof':
            return this.errorReservedID(e) ;

         default: break SWITCH;
    }
    case 12: switch (n) {
      case 'synchronized':
         if ( this. v <= 5 )
           return this.errorReservedID(e) ;

      default: break SWITCH;
    }
  }

  return e ? null : this.id();
};

this.errorReservedID = function(id) {
  this.resvchk();
  if ( !this.throwReserved ) {
     this.throwReserved = true;
     return null;
  }
  if ( this.err('reserved.id',{tn:id}) ) return this.errorHandlerOutput;
}


