Emitters['ObjectExpression'] = function(n, prec, flags) {
  var list = n.properties;
  var mi = findComputed(list);
  if (mi !== -1)
    return this.emitObjectWithComputed(n, prec, flags, mi);

  var paren = flags & EC_START_STMT;

  if (paren) this.w('(');
  this.w('{').emitObjectChunk(list, 0, list.length-1); 
  this.w('}')
  if (paren) this.w(')');
};

this.emitObjectChunk = function(list, from, to) {
  var i = from;
  while (i <= to) {
    if (i > from) this.wm(',',' ');
    this.emitProp(list[i]);
    i++;
  }
};

// mi -> member idx
this.emitObjectWithComputed = function(n, prec, flags, mi) {
  var paren = flags & EC_NEW_HEAD;
  if (paren) this.w('(');
  this.wm('jz','.','obj','(','{');
  var list = n.properties;
  this.emitObjectChunk(n.properties, 0, mi-1);
  this.w('}');
  while (mi < list.length) {
    var prop = list[mi];

    this.wm(',',' ');
    if (prop.computed) this.eN(prop.key);
    else this.emitNonComputedAsString(prop.key);
    
    this.wm(',',' ').eN(prop.value);
    
    ++mi;
  }
  this.w(')');
  if (paren) this.w(')');
};  

this.emitProp = function(prop) {
  ASSERT.call(this, !prop.computed, 
    'computed prop is not emittable by this function');
  this.emitNonComputed(prop.key);
  this.wm(':',' ').eN(prop.value);
};

this.emitNonComputed = function(name) {
  switch (name.type) {
  case 'Identifier':
    if (this.isReserved(name.name))
      this.emitStringLiteralWithRawValue(name.name);
    else
      this.emitIdentifierWithValue(name.name);
    break;
  
  case 'Literal':
    this.emitLiteral(name);
    break;

  default:
    ASSERT.call(this, false,
      'Unknown type for prop key');
  }
};

this.emitNonComputedAsString = function(name) {
  switch (name.type) {
  case 'Identifier':
    return this.emitStringLiteralWithRawValue("'"+name.name+"'");
  case 'Literal':
    return this.emitLiteral(name);
  }
};

function findComputed(list) {
  var i = 0;
  while (i < list.length) {
    if (list[i].computed)
      return i;
    i++;
  }

  return -1;
}
