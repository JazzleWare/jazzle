
// TODO: liquids leave no signs in any scope the don't belong to --
//       they record it in their list of referencing scopes if they
//       contain any significant names, but they are not recorded in the lsi
//       of the scope's unresolved references; nothing looks actually wrong with this approach,
//       except that it is in total contrast to the one taken in the previous version
this.track =
function(scope) {
  if (this.rsMap === null)
    this.rsMap = {};

  var cur = scope, root = this.ref.scope ;
  this.ref.d++;
  while (true) {
    if (cur.hasSignificantNames() || cur.isAnyFn() || cur.isCatch()) {
      if (HAS.call(this.rsMap, cur.scopeID))
        break;
      this.rsMap[cur.scopeID] = true;
      this.ref.rsList.push(cur);
    }
    if (cur === root)
      break;
    cur = cur.parent;
    ASSERT.call(this, cur,
      'reached topmost while pulling up a liquid');
  }
  return this;
};

