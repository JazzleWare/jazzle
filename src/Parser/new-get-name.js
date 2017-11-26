  import {SF_STRICT, ST_DECL, ST_GEN, ST_ASYNC} from '../other/scope-constants.js';
  import {arorev} from '../other/util.js';
  import {cls} from './ctor.js';

cls.getName_cls =
function(st) {
  var fl = this.scope.flags, name = null;
  this.scope.flags |= SF_STRICT;
  if (st & ST_DECL)
    name = this.parsePat();
  else {
    this.validate(this.ltval);
    if (arorev(this.ltval))
      this.arorevErr();
    name = this.id();
  }
  this.scope.flags = fl;
  return name;
};

cls.getName_fn =
function(st) {
  switch (this.ltval) {
  case 'yield':
    if ((st & ST_GEN) || this.scope.insideStrict())
      this.err('fnexpr.yield');
    return this.id();

  case 'await':
    if ((st & ST_ASYNC) || this.scope.insideStrict())
      this.err('fnexpr.await');
    return this.id();
  }

  this.validate(this.ltval);
  if (this.scope.insideStrict() && arorev(this.ltval))
    this.arorevErr();

  return this.id();
};


