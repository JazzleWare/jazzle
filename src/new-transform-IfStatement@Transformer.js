Transformers['IfStatement'] =
function(n, isVal) {
  ASSERT_EQ.call(this, isVal, false);
  var altax = n['#elseScope'], conax = n['#ifScope'];

//altax && ASSERT.call(this, this.recAN(altax), 'altax');
//ASSERT.call(this, this.recAN(conax), 'conax');

  var ns = this.setNS(0);
  var tesax = new Actix(ACT_BARE);
  ASSERT.call(this, this.recAN(tesax), 'tesax');
  n.test = this.tr(n.test, true);
  ASSERT.call(this, this.activeIfNames.pop() === tesax, 'tesax');
  tesax.ns = this.curNS;
  if (tesax.ns) this.active1if2(tesax, this.cur);
  else {
    altax && this.active1if2(tesax, altax);
    this.active1if2(tesax, conax);
  }
  this.setNS(tesax.ns+ns);
//ASSERT.call(this, this.activeIfNames.pop() === conax, 'conax');
//altax && ASSERT.call(this, this.activeIfNames.pop() === altax, 'altax');

  var s = this.setScope(conax);
  ns = this.setNS(0);
  n.consequent = this.tr(n.consequent, false);
  conax.ns = this.curNS;
  this.setNS(conax.ns+ns);

  if (n.alternate) {
    this.setScope(altax);
    ns = this.setNS(0);
    n.alternate = this.tr(n.alternate, false);
    altax.ns = this.curNS;
    this.setNS(altax.ns+ns);
  }

  this.setScope(s);
  return n;
};
