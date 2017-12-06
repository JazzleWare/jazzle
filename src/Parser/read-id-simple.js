import {ERR_NONE_YET} from '../other/error-constants.js';
import {cls} from './cls.js';


cls.readID_simple =
function() {
  this.ct = ERR_NONE_YET;
  return this.readID_withHead(
    this.src.charAt(this.c++)
  );
};
