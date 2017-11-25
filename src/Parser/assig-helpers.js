  import {cls} from './cls.js';

cls.ensureSpreadToRestArgument_soft = function(head) {
  return head.type !== 'AssignmentExpression';
};


