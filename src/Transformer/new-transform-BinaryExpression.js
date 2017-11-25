  import {Transformers} from '../other/globals.js';
  import {createObj} from '../other/util.js';

Transformers['LogicalExpression'] =
function(n, isVal) {
  n.left = this.tr(n.left, true);
  var cvtz = this.setCVTZ(createObj(this.cvtz));
  var th = this.thisState;
  n.right = this.tr(n.right, true);
  this.thisState = th;
  this.setCVTZ(cvtz );
  return n;
};

Transformers['BinaryExpression'] =
function(n, isVal) {
  n.left = this.tr(n.left, true);
  n.right = this.tr(n.right, true);
  return n;
};

