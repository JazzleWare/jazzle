  import {PAREN, HAS, ASSERT} from '../other/constants.js';
  import {core} from '../other/util.js';
  import {cls} from './ctor.js';

function base_Y0(n) {
  if (!this.scope.canYield() || n === null)
    return 0;
  switch (n.type) {
  case 'Identifier':
  case 'TemplateElement':
  case 'Literal':
  case 'DebuggerStatement':
  case 'Super':
  case 'ThisExpression':
    return 0; 
  }

  if (n.type === PAREN)
    return base_Y0.call(this, core(n));

  if (!HAS.call(n, '#y')) {
    console.error(n);
    throw new Error(n.type+'[#y]');
  }

  return n['#y'];
};

function base_Y(n) {
  ASSERT.call(this, n !== null, 'n');
  return base_Y0.call(this, n);
}

cls.Y0 = function() {
  var yc = 0, e = 0;
  while (e < arguments.length)
    yc += base_Y0.call(this, arguments[e++]);
  return yc;
};

cls.Y = function() {
  var yc = 0, e = 0;
  while (e < arguments.length)
    yc += base_Y.call(this, arguments[e++]);
  return yc;
};


