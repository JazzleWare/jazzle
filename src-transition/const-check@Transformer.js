this.constCheck = function(resolvedName) {
  ASSERT.call(this, resolvedName.type === '#ResolvedName',
    'only resolved names are allowed to get a const-check');
  this.accessJZ();
  if (resolvedName.decl.isCName())
    resolvedName.constCheck = true;
};
