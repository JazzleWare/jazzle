  import {SF_HERITAGE} from '../other/scope-constants.js';
  import {cls} from './cls.js';

cls.hasHeritage =
function() { return this.flags & SF_HERITAGE; };


