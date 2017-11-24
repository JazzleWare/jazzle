  import {TK_SIMP_BINARY, TK_ID, TK_SIMP_ASSIG} from '../other/lexer-constants.js';
  import {CH_SINGLE_QUOTE, CH_MULTI_QUOTE} from '../other/constants.js';
  import {cls} from './cls.js';

this.peekMul =
function() { 
  return this.lttype === TK_SIMP_BINARY && this.ltraw === '*';
};

this.peekID =
function(name) {
  return this.lttype === TK_ID && this.ltval === name;
};

this.peekEq =
function() {
  return this.lttype === TK_SIMP_ASSIG && this.ltraw === '=';
};

this.peekStr =
function() {

  switch (this.lttype) {
  case CH_SINGLE_QUOTE:
  case CH_MULTI_QUOTE:
    return true;
  }

  return false;
};

