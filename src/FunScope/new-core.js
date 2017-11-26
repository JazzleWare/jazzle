  import {ASSERT} from '../other/constants.js';
  import {cls} from './ctor.js';

// the only names that are checked via hasClosureLLINOSA_m are the ones already known to be external refs
// this is because the routine below is only called during getLoopLexicals. while there, the LLINOSA names
// are then queried against the scope's closureLLINOSA. if not found, they will be added to the ll array, and will be recorded in the scope's closureLLINOSA
// else it means the parent fn has them in its closure, and they need not get into yet another closure:
//
// var a = []; while (a.length < 12) { let len = a.length; a.push(function() { return len-- * (function() { return len })() }) }
//
// withOUT:
// var a = [];
// while (a.length < 12) {
//   var len = {v: void 0};
//   len.v = a.length;
//   a.push(function(len) {
//     return function() {
//       return len.v-- * function(len) { return function() { return len.v } }(len)();
//     };
//   }(len));
// }
//
// WITH:
// var a = [];
// while (a.length < 12) {
//   var len = {v: void 0};
//   len.v = a.length;
//   a.push(function(len) {
//     return function() {
//       return len.v-- * function() { return len.v };
//     };
//   }(len));
// }

cls.getClosureLLINOSA_m =
function(mname) {
  return this.closureLLINOSA[mname]; 
};

// CLs are only inserted when an fn's outer-loop-lexicals are getting calculated;
cls.insertClosureLLINOSA_m =
function(mname, llinosa) {
  ASSERT.call(this, !this.getClosureLLINOSA_m(mname), 'closure-l');
  this.closureLLINOSA[mname] = llinosa;
};


