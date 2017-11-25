  import Actix from '../Actix/cls.js';
  import {ACT_DECL} from '../other/constants.js';
  import {DT_NONE} from '../other/scope-constants.js';

function Decl() {
  Actix.call(this, ACT_DECL );
  this.ref = null;
  this.idx = -1;
  this.name = "";
  this.site = null;
  this.msynth = -1;
  this.hasTZCheck = false;
  this.reached = null;
  this.type = DT_NONE;
  this.synthName = "";
  this.rsMap = null;
  this.realTarget = null;
}

 export default Decl;

 import {createObj} from '../other/util.js';
 export var cls = Decl.prototype = createObj(Actix.prototype);
