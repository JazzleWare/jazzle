this.parseStatement = function ( allowNull ) {
  var head = null,
      l,
      e ,
      directive = this.directive,
      esct = ERR_NONE_YET;

  if (directive !== DIR_NONE) {
    esct = this.esct; // does the current literal contain any octal escapes?
  }

  switch (this.lttype) {
    case '{': return this.parseBlockStatement();
    case ';': return this.parseEmptyStatement() ;
    case 'Identifier':
       this.canBeStatement = true;
       head = this.parseIdStatementOrId(CTX_NONE|CTX_PAT);
       if ( this.foundStatement ) {
          this.foundStatement = false ;
          return head;
       }

       break ;

    case 'eof':
      if (!allowNull && this.err('stmt.null') )
        return this.errorHandlerOutput ;

      return null;
  }

  if (head !== null)
    this.err('must.not.have.reached');

  head = this.parseExpr(CTX_NULLABLE|CTX_TOP) ;
  if ( !head ) {
    if ( !allowNull && this.err('stmt.null') )
      this.errorHandlerOutput;

    return null;
  }

  if ( head.type === 'Identifier' && this.lttype === ':')
    return this.parseLabeledStatement(head, allowNull);

  this.fixupLabels(false) ;

  if (DIR_MAYBE & directive) {
    if (head.type !== 'Literal')
      // TODO: technically it should instead get turned off: this.directive = DIR_NONE
      // Otherwise, if the next token to be recognized is a string literal, the octal sequence it may
      // contain is going to be unnecessarily recorded in to the error variables
      this.directive = directive|DIR_LAST;
    else {
      if (!(this.directive & DIR_HANDLED_BY_NEWLINE)) {
        ASSERT.call(this.directive === DIR_NONE,
          'an expression that is going to become a statement must have set a non-null directive to none if it has not handled it');
        this.gotDirective(this.dv, directive);
 
        // so that the escaped octals are recorded if the next token to be extracted is a string literal
        this.directive = directive; 
      }
    }
    if (esct !== ERR_NONE_YET && this.se === null)
      this.se = head;
  }

  e  = this.semiI() || head.end;
  l = this.semiLoc_soft ();
  if ( !l && !this.nl &&
       this.err('no.semi') )
    return this.errorHandlerOutput;
 
  return {
    type : 'ExpressionStatement',
    expression : core(head),
    start : head.start,
    end : e,
    loc : { start : head.loc.start, end : l || head.loc.end }
  };
};


