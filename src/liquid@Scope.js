this.accessLiquid = function(targetScope, targetName) {
  ASSERT.call(this, targetScope.isConcrete(),
    'only concrete scopes are allowed to be used as external scopes');
  var fullSynthName = _full(targetScope.id, targetName);
  var ref = this.findRef_m(fullSynthName);
  if (ref === null) {
    ref = this.findRef_m(fullSynthName, true);
    ref.synthTarget = targetScope;
    ref.idealSynthName = targetName;
  }
  ++ref.direct;
  return fullSynthName;
};

this.declareLiquid_m = function(fullSynthName, ref) {
  ASSERT.call(this, this.isConcrete(),
    'a tracked-synth is only available in a concrete scope');
  ASSERT.call(this, !this.synthLiquids.has(fullSynthName),
    fullSynthName + ' exists');
  return this.synthLiquids.set(
    fullSynthName,
    new Decl().r(ref)
              .m(DM_LIQUID)
              .n(ref.idealSynthName));
};
