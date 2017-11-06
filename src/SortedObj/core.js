this.set = function(name, val) {
  if (!HAS.call(this.obj, name))
    this.keys.push(name);
  return this.obj[name] = val;
};

this.at = function(i) {
  return i < this.keys.length ? this.obj[this.keys[i]] : void 0;
};

this.get = function(name) {
  return this.obj[name]; 
};

this.remove = function(name) {
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

this.has = function(name) {
  return HAS.call(this.obj, name);
};

this.length = function() {
  return this.keys.length;
};

this.pop = function(out) {
  var list = this.keys;
  ASSERT.call(this, list.length, 'len' );
  var name = list.pop();
  var elem = this.obj[name]; delete this.obj[name];
  if (out) { out.name = name; out.value = elem; }
  else out = elem;
  return out;
};
