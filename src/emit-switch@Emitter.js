Emitters['SwitchStatement'] = function(n, prec, flags) {
  this.wm('switch',' ','(')
      .eA(n.discriminant, PREC_NONE, EC_NONE)
      .wm(')',' ','{');
  var list = n.cases, i = 0;
  if (list.length > 0) {
    while (i < list.length)
      this.l().emitCase(list[i++]);
    this.l();
  }
  this.w('}');
};

this.emitCase = function(c) {
  if (c.test) {
    this.wm('case',' ')
        .eA(c.test, PREC_NONE, EC_NONE)
        .w(':');
  } else
    this.wm('default',':');

  var list = c.consequent, i = 0;
  if (list.length > 0) {
    this.i();
    while (i < list.length)
      this.l().eA(list[i++], PREC_NONE, EC_NONE);
    this.u();
  }
};
