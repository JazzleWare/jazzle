  import Parser from '../Parser/cls.js';
  import Transformer from '../Transformer/cls.js';
  import {cls} from './cls.js';
  import {EC_NONE} from '../other/constants.js';

  cls.writeJZHelpers =
  function() {
    var helperSrc = '(function(){var o={};' + this.jzHelpers.asCode() + 'return o;}())|0';
    var helperNode = new Parser(helperSrc).parseProgram();
    var ntr = new Transformer().tr(helperNode, false);
    this.emitAny(ntr.body[0].expression.left, EC_NONE, false);
  };
