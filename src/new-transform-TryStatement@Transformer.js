Transformers['TryStatement'] =
function(n, isVal) {
  var s = this.setScope(n['#tryScope']);
  this.cur.synth_defs_to(this.cur.scs);
  n.block = this.tr(n.block, false);
  this.setScope(s);

  if (n.handler)
    n.handler = this.transformCatch(n.handler);

  if (n.finalizer) {
    s = this.setScope(n['#finScope']);
    n.finalizer = this.tr(n.finalizer, false);
    this.setScope(s);
  }
 
  return n;
};

this.transformCatch =
function(n) {
  var a = null, s = this.setScope(n['#scope']);
  ASSERT.call(this, !this.inBody, 'inside catch' );

  if (this.cur.argIsSimple) {
    this.cur.argIsSignificant = true;
    this.cur.synth_start(this.renamer);
    this.synthRealCatchVar(this.cur.findDeclAny_m(_m(n.param.name)) );
  }
  else {
    this.synth_start(this.renamer);
    a = this.transformCatchArgs(n);
  }

  this.activateBody();
  n.body = this.tr(n.body, false);
  this.deactivateBody();
  this.cur.argIsSignificant || this.synthLiquidCatchVar(this.cur.catchVar);
  n['#argPrologue'] = a;
  return n;
};

this.transformCatchArgs =
function(n) {
  ASSERT.call(this, !this.cur.argIsSimple, 'catch' );
  ASSERT.call(this, this.cur.catchVar === null, 'catchname');

  var l = this.synth_Assig(n.param, this.synth_SynthName(this.cur.catchVar), true);

  return this.tr(l, false);
};

this.synthRealCatchVar =
function(c) {
  ASSERT.call(this, cv.isCatchArg(), 'catch' );
  var list = cv.ref.rsList, num = 0;
  var baseName = c.name, synthName = this.rename(baseName, num);

  RENAME:
  do {
    mname = _m(synthName);
    var synth = null;
    var l = 0;
    while (l < list.length) {
      var scope = list[l++];
      if (!scope.synth_ref_may_escape_m(mname, this.renamer))
        continue RENAME;
      synth = scope.synth_ref_find_homonym_m(mname, this.renamer);
      if (synth && synth !== c)
        continue RENAME;
    }
    break;
  } while (synthName = this.rename(baseName, ++num), true );

  c.synthName = synthName;
  this.cur.insertSynth_m(mname, c);
};

this.synthLiquidCatchVar =
function(liq) {
  var baseName = liq.name, mname = "";
  var num = 0, synthName = this.rename(baseName, num);
  do {
    mname = _m(synthName);
    if (this.cur.findSynth_m(mname) === null)
      break;
    synthName = this.rename(baseName, ++num);
  } while (true);

  liq.synthName = synthName;
  this.cur.insertSynth_m(mname, liq);
};
