Transformers['ExportNamedDeclaration'] = 
Transformers['ExportDefaultDeclaration'] =
Transformers['ExportAllDeclaration'] = function(n, isVal) { return this.synth_Skip(); };
Transformers['ImportDeclaration'] =
function(n, isVal) { return this.synth_Skip(); };
