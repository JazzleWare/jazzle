  import {SF_HERITAGE} from '../other/scope-constants.js';
  import {cls} from './cls.js';

this.hasHeritage =
function() { return this.flags & SF_HERITAGE; };

