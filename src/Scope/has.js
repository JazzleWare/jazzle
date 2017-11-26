  import {SA_NEW_TARGET} from '../other/scope-constants.js';
  import {cls} from './cls.js';

cls.hasNewTarget =
function() { return this.allowed & SA_NEW_TARGET; };

cls.hasHead =
function() {
  return this.isAnyFn() || this.isCatch();
};

cls.hasSignificantNames =
function() {
  if (this.isModule() ||
    this.isScript())
    return true;

  if (this.isAnyFn())
    return !this.inBody;
  if (this.isCatch())
    return !this.inBody && this.argIsSimple && this.argIsSimple;

  return false;
};


