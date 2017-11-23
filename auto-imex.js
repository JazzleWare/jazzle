function AutoImex() {
  this.Parser = null;
  this.Emitter = null;
  this.sources = new SortedObj();
  this.unresolvedNames = new SortedObj();
  this.bundleBindings = new SortedObj();
}

function ASSERT(condition, message) {
  if (!condition) throw new Error(message);
}

var has = function() {
  var h = {}.hasOwnProperty;
  return function has(obj, name) {
    return h.call(obj, name);
  }
}();

var _m = function(str) { return str + '%'; };

var acl = AutoImex.prototype ;

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

acl.insertSourceByURI =
function(uri) {
  var m = _m(uri);
  ASSERT.call(this, !this.sources.has(m), 'existing ['+uri+']');
  var src = this.loadSource(uri), n = new this.Parser(src).parseProgram();

  this.handleUnresolvedSourceLevelReferences(uri, n['#scope']);

  n['#importList'] = {ns: null, sources: []};
  n['#exportList'] = {bindings: [], defaultExpr: ""};

  var at = uri.indexOf('@'), scope = null;
  if (at === 0) {
    var name = uri.substring(1, uri.indexOf('.'));
    ASSERT.call(this, n['#scope'].findDeclAny_m(_m(name)), 'no ['+name+'] in ['+uri+']');
    n['#exportList'].defaultExpr = ;
    ASSERT.call(this, n['#scope'].findDeclAny_m(_m('cls')) === null, 'cls exists in ' + uri );
    n['#exportList'].bindings.push({real: 'cls', outer: 'cls'});
  }
  else if (at > 0) {
  this.handleSourceLevelBindings(uri, n['#scope']);

  n['#src'] = src;

  return this.sources.set(m, n);
};

acl.resolveAll =
function() {
  var list = this.sources, l = 0, len = list.length();
  while (l < len) {
    var elem = list.at(l++ );
    acl
