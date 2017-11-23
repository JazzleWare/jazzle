/* @<name>.js: 
 *   export default <name>
 *   export var cls = <name>
 *
 * <sub>@<name>.js
 *   import <name>, {cls} from @<name>.js#relativeTo(<sub>@<name>.js)
 *
 * <name>.js
 *   <for binding in the source>
 *     export {<binding>};
 */

this.insertSourceByURI =
function(uri) {
  var m = _m(uri);
  ASSERT.call(this, !this.sources.has(m), 'existing ['+uri+']');
  var src = this.loadSource(uri), n = new this.Parser(src).parseProgram();

  var scope = n['#scope'];
  this.handleUnresolvedSourceLevelReferences(uri, scope);

  scope['#importList'] = {ns: null, sources: new SortedObj()};
  scope['#exportList'] = {bindings: [], defaultExpr: ""};

  var at = uri.indexOf('@');
  if (at === 0) {
    var name = uri.substring(1, uri.indexOf('.'));
    var binding = scope.findDeclAny_m(_m(name));
    ASSERT.call(this, binding, 'no ['+name+'] in ['+uri+']');
    scope['#exportList'].defaultExpr = name;
    this.insertBundleBinding(binding);
    ASSERT.call(this, scope.findDeclAny_m(_m('cls')) === null, 'cls exists in ' + uri );
    scope['#exportList'].bindings.push({real: 'cls', outer: 'cls'});
  }
  else if (at > 0) {
    scope['#clsThisList'] = [];
    var list = n.body, l = 0;
    while (l < list.length) {
      var elem = list[l++];
      if (elem.type !== 'ExpressionStatement')
        continue;

      elem = elem.expression;
      if (elem.type !== 'AssignmentsExpression')
        continue;

      elem = elem.left;
      if (elem.type !== 'MemberExpression')
        continue;

      elem = elem.object;
      if (elem.type !== 'ThisExpression')
        continue;

      scope['#clsThisList'].push(elem);
    }
  }
  else {
    var list = scope.defs, l = 0, len = list.length();
    while (l < len) {
      var elem = list.at(l++ );
      scope['#exportList'].bindings.push({real: elem.name, outer: elem.name});
      this.insertBundleBinding(elem);
    }
  }
//this.handleSourceLevelBindings(uri, n['#scope']);

  n['#src'] = src;

  return this.sources.set(m, n);
};

this.resolveAll =
function() {
  var list = this.sources, l = 0, len = list.length();
  while (l < len) {
    var elem = list.at(l++ );
    this.tryResolveBindings(elem);
  }
};
