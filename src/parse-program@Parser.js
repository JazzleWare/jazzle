this.parseProgram = function () {
  var c0 = this.c, li0 = this.li, col0 = this.col;
  var ec = -1, eloc = null;

  if (this.bundler === null && this.bundleScope === null)
    this.bundleScope = new GlobalScope();

  ASSERT.call(this, this.bundleScope, 'bundleScope');
  this.scope = new SourceScope(this.bundleScope, ST_SCRIPT);

  this.scope.parser = this;
  if (!this.isScript)
    this.scope.makeStrict();

  this.next();

  this.enterPrologue();
  var list = this.stmtList(); 

  this.scope.finish();

  var cb = {};
  list.length || this.suc(cb, 'inner');

  var n = {
    type: 'Program',
    body: list,
    start: 0,
    end: this.src.length,
    sourceType: !this.isScript ? "module" : "script" ,
    loc: {
      start: {line: li0, column: col0},
      end: {line: this.li, column: this.col}
    }, 
    '#scope': this.scope,
    '#c': cb,
    '#y': 0, 
    '#imports': null
  };

  if (!this.expectT(TK_EOF))
    this.err('program.unfinished');

  var bundler = this.bundler;
  if (bundler) {
    ASSERT.call(this, bundler.bundleScope === this.bundleScope, 'bundler\'s scope is not the same as parser\'s' );
    bundler.save(n);
    n['#imports'] = n['#scope'].satisfyWithBundler(bundler);
  }

  return n;
};
