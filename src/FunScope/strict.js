  import {arorev} from '../other/util.js';
  import {cls} from './ctor.js';

cls.verifyForStrictness =
function() {
  this.verifyUniqueArgs();
  var list = this.argList, i = 0;
  while (i < list.length) {
    var elem = list[i++];
    if (arorev(elem.name))
      this.parser.err('binding.to.arguments.or.eval');
    if (this.parser.isResv(elem.name))
      this.parser.err('invalid.argument.in.strict.mode');
  }
};


