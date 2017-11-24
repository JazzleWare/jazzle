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
    this.logBinding(name, '*default*', uri);
    this.insertBundleBinding(uri, binding);
    ASSERT.call(this, scope.findDeclAny_m(_m('cls')) === null, 'cls exists in ' + uri );
    scope['#exportList'].bindings.push({real: 'cls', outer: 'cls'});
    var cul = this.clsUriList;
    var mname = _m(name);
    ASSERT.call(this, !HAS.call(cul, mname),
      'class has been registered: ['+name+']<==['+uri+']');
    cul[mname] = uri;
    this.logBinding(name, '<<cls>>', uri);
  }
  else if (at > 0) {
    scope['#clsThisList'] = [];
    var list = n.body, l = 0;
    this.logE('stmts', list.length);
    while (l < list.length) {
      var elem = list[l++];
      this.logE('[uri-'+uri+';'+elem.type+']');
      if (elem.type !== 'ExpressionStatement')
        continue;

      elem = elem.expression;
      this.logE('[uri-'+uri+';'+elem.type+']');
      if (elem.type !== 'AssignmentExpression')
        continue;

      elem = elem.left;
      this.logE('[uri-'+uri+';'+elem.type+']');
      if (elem.type !== 'MemberExpression')
        continue;

      elem = elem.object;
      this.logE('[uri-'+uri+';'+elem.type+']');
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
      this.logBinding(elem.name, elem.name, uri );
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
  this.logE(' --------- ['+len+'] sources ----------; START');
  while (l < len) {
    var elem = list.at(l++ );
    this.tryResolveExternals(elem);
  }
  this.logE(' --------- ['+l+'/'+len+'] complete ---------');
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
      this.logE('  ['+n['#uri']+']:import ['+name.name+'] from ['+b.uri+'] '+
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
    this.onStartImports(elem);
    this.writeImports(elem);
    this.onFinishImports(elem);

    this.onStartExports(elem);
    this.writeExports(elem);
    this.onFinishExports(elem);
  }
};

this.writeImports = 
function writeImports(n) {
  var scope = n['#scope'];
  var uri = n['#uri'];
  this.logE('writing imports for ['+uri+']');
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
    var sourceUri = _u(usedSources.keys[l]);
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
    this.onImport({str: str, to: uri, from: sourceUri, usedSources: usedSources});
    l++;
  }
};

this.writeExports = function(elem) {};

this.path1to2 =
function(from, to) {
  var fromNum = 0, toNum = 0;
  var fromStart = 0, toStart = 0;
  var fromElemLen = 0, toElemLen = 0;

  var manp = new PathMan();
  var str = "";

  var hasLeadingToElem = false;

  while (true) {
    fromElemLen = manp.len(from, fromStart);
    if (fromElemLen === 0) {
      ASSERT.call(this, fromNum > 0, '['+from+'] -- from has no elems');
      break;
    }

    toElemLen = manp.len(to, toStart);
    if (toElemLen === 0) {
      ASSERT.call(this, toNum > 0, '['+to+'] to has no elems');
      break;
    }

    var fromElem = manp.trimSlash(from.substr(fromStart, fromElemLen));
    fromNum++;
    fromStart += fromElemLen;

    var toElem = manp.trimSlash(to.substr(toStart, toElemLen));
    toNum++;
    toStart += toElemLen;

    if (fromElem !== toElem) {
      str = '..';
      hasLeadingToElem = true;
      break;
    }
  }

  while (true) {
    fromElemLen = manp.len(from, fromStart);
    if (fromElemLen === 0)
      break;
    if (str.length) str += '/';
    str += '..';
    fromStart += fromElemLen;
  }

  if (hasLeadingToElem) {
    ASSERT.call(this, str.length, 'str must not be empty if hasLeadingToElem is set to on' );
    str += '/' + toElem;
  }

  while (true) {
    toElemLen = manp.len(to, toStart);
    if (toElemLen === 0)
      break;
    var toElem = manp.trimSlash(to.substr(toStart, toElemLen));
    if (str.length) str += '/';
    else str = './';
    str += toElem;
    toStart += toElemLen;
  }

  return str;
};

this.logE =
function() {
  return console.log.apply(console, arguments);
};

this.logBinding = 
function(real, outer, uri) {
  this.logE('  ['+uri+']:export {['+real+'] as ['+outer+']}');
};
