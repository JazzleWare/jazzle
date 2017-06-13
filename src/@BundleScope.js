function BundleScope(globalScope) {
  if (globalScope === null)
    globalScope = new GlobalScope();
  else
    ASSERT.call(this, globalScope.isGlobal(), 'not global');
  ConcreteScope.call(this, globalScope, ST_BUNDLE);
};
