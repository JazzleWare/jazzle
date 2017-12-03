  import {ASSERT, activeID_new, ANESS_UNKNOWN} from '../other/constants.js';

 export default function Actix(role) { // activity ctx
  ASSERT.call(this, arguments.length === 1, 'len' );
  this.ai = activeID_new();
  this.activeIf = null;
  this.activeness = ANESS_UNKNOWN;
  this.ns = 0;
  this.role = role;
  this.inactiveIf = null;
}

 export var cls = Actix.prototype;
