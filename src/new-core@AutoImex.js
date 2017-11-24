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

var pathMan = new PathMan();

function logBinding(real, outer, uri) {
  console.log('  ['+uri+']:export {['+real+'] as ['+outer+']}');
}

this.insertSourceByURI =
function(uri) {
  var m = _m(uri);
  ASSERT.call(this, !this.sources.has(m), 'existing ['+uri+']');
  var src = this.loadSource(uri), n = new this.Parser(src).parseProgram();

  var scope = n['#scope'];

  n['#uri'] = uri;

  scope['#importList'] = {ns: null, names: []};
  scope['#exportList'] = {bindings: [], defaultExpr: ""};

  var subName = pathMan.tail(uri);
  var at = subName.indexOf('@');
  if (at === 0) {
    var name = subName.substring(1, subName.indexOf('.'));
    var binding = scope.findDeclAny_m(_m(name));
    ASSERT.call(this, binding, 'no ['+name+'] in ['+uri+']');
    scope['#exportList'].defaultExpr = name;
    logBinding(name, '*default*', uri);
    this.insertBundleBinding(uri, binding);
    ASSERT.call(this, scope.findDeclAny_m(_m('cls')) === null, 'cls exists in ' + uri );
    scope['#exportList'].bindings.push({real: 'cls', outer: 'cls'});
    logBinding(name, '<<cls>>', uri);
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
      logBinding(elem.name, elem.name, uri );
      this.insertBundleBinding(uri, elem);
    }
  }
//this.handleSourceLevelBindings(uri, n['#scope']);

  n['#src'] = src;

  return this.sources.set(m, n);
};

this.resolveAll =
function() {
  var list = this.sources, l = 0, len = list.length();
  console.error(' --------- ['+len+'] sources ----------; START');
  while (l < len) {
    var elem = list.at(l++ );
    this.tryResolveExternals(elem);
  }
  console.error(' --------- ['+l+'/'+len+'] complete ---------');
};

this.tryResolveExternals =
function(n) {
  var sourceScope = n['#scope'], globalScope = sourceScope.parent;
  var list = globalScope.defs, l = 0, len = list.length();
  while (l < len) {
    var name = list.at(l++);
    var b = this.findBundleBinding(name.name);
    if (b) {
      sourceScope['#importList'].names.push({name: name.name, target: b});
      console.log('  ['+n['#uri']+']:import ['+name.name+'] from ['+b.uri+'] '+
        (name.name === b.binding.ref.scope['#exportList'].defaultExpr ? 'default' : 'raw' ) );
    }
  }
};

this.insertBundleBinding =
function(uri, elem) {
  var name = elem.name;
  var b = this.findBundleBinding(name);
  if (b) ASSERT.call(this, false, 'name ['+name+'] exists @['+b.uri+']');

  return this.bundleBindings.set(_m(name), {uri: uri, binding: elem});
};

this.findBundleBinding =
function(name) {
  var mname = _m(name), bb = this.bundleBindings;
  return bb.has(mname) ? bb.get(mname) : null;
};

this.flush =
function() {
  var list = this.sources, l = 0, len = list.length();
  while (l < len) {
    var elem = list.at(l++);
    this.writeImports(elem);
    this.writeExports(elem);
  }
};

this.writeImports = 
function writeImports(n) {
  var scope = n['#scope'];
  var uri = n['#uri'];
  console.error('writing imports for ['+uri+']');
  var im = scope['#importList'].names, usedSources = new SortedObj();
  var len = im.length, l = 0;
  while (l < len) {
    var elem = im[l++];
    var name = elem.name;
    var target = elem.target;
    var targetUri = target.uri, binding = target.binding;
    var mname = _m(targetUri);
//  console.error('  name['+name+']', mname, usedSources.obj);
    var entry = usedSources.has(mname) ? usedSources.get(mname) : null;
    if (entry === null)
      entry = usedSources.set(mname, {bindings: [], defaultName: "", wholeNS: "" });
    if (name === binding.ref.scope['#exportList'].defaultExpr) {
      ASSERT.call(this, entry.defaultName === "", '['+targetUri+'] default');
      entry.defaultName = name;
    }
    else { entry.bindings.push(name); }
  }

  len = usedSources.length(), l = 0;
  while (l < len) {
    var sourceBindings = usedSources.at(l);
    var sourceUri = usedSources.keys[l];
    var str = "";
    if (sourceBindings.defaultName !== "")
      str += sourceBindings.defaultName;
    if (sourceBindings.bindings.length) {
      if (str.length) str += ', ';
      str += '{';
      var bindings = sourceBindings.bindings, b = 0;
      while (b < bindings.length) {
        if (b) str += ', ';
        str += bindings[b];
        b++;
      }
      str += '}';
    }
    console.log('  import ' + str + ' from ' + sourceUri );
    l++;
  }
};

this.writeExports = function(elem) {};

