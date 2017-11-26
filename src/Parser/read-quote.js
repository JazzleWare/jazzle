  import {CH_MULTI_QUOTE, CH_SINGLE_QUOTE} from '../other/constants.js';
  import {cls} from './ctor.js';

cls.read_multiQ =
function() {
  this.lttype = CH_MULTI_QUOTE;
  this.ltraw = '"';
  this.setsimpoff(this.c+1);
};

cls.read_singleQ =
function() {
  this.lttype = CH_SINGLE_QUOTE;
  this.ltraw = "'";
  this.setsimpoff(this.c+1);
};


