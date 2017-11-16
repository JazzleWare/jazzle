 import {Parser} from '../../parser/cls.js';
 import cls from './cls.js';
 import {HAS, ASSERT} from '../../helpers/util.js';

cls.asNode =
function(uri) {
  ASSERT.call(this, this.has(uri), 'resource not found ('+uri+')');
  var newParser = new Parser(this.fsMap[_m(uri)], {sourceType: 'module'});
  newParser.bundleScope = this.bundleScope;
  return newParser.parseProgram();
};

cls.has =
function(uri) { return HAS.call(this.fsMap, _m(uri)); };

cls.set =
function(uri, value) {
  ASSERT.call(this, !this.has(uri), 'has' );
  this.fsMap[_m(uri)] = value;
};


