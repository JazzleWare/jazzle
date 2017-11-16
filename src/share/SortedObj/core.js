 import {cls} from './cls.js';
 import {ASSERT} from '../../helpers/util.js';
 import {HAS} from '../../helpers/util.js';

cls.set = function(name, val) {
  if (!HAS.call(this.obj, name))
    this.keys.push(name);
  return this.obj[name] = val;
};

cls.at = function(i) {
  return i < this.keys.length ? this.obj[this.keys[i]] : void 0;
};

cls.get = function(name) {
  return this.obj[name]; 
};

cls.remove = function(name) {
  if (!HAS.call(this.obj, name))
    return false;
  delete this.obj[name];

  var list = this.keys;
  var i = list.length - 1; // slighty optimize for pops

  while (name !== list[i])
    i--;

  while (i < list.length-1) {
    list[i] = list[i+1];
    i++;
  }

  list.pop();
  return true;
};

cls.has = function(name) {
  return HAS.call(this.obj, name);
};

cls.length = function() {
  return this.keys.length;
};

cls.pop = function(out) {
  var list = this.keys;
  ASSERT.call(this, list.length, 'len' );
  var name = list.pop();
  var elem = this.obj[name]; delete this.obj[name];
  if (out) { out.name = name; out.value = elem; }
  else out = elem;
  return out;
};
