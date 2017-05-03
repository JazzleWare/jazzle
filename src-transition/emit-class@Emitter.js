Emitters['ClassExpression'] = 
Emitters['ClassDeclaration'] = function(n, prec, flags) {
  this.w('[:<'+n.type+'>:]');
};
