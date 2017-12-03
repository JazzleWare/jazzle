  import {iskw} from './util.js';

function renamer_incremental(base, i) {
  if (i === 0) return base;
  return base + "" + i;
}

var HEAD = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_$', TAIL = HEAD + '1234567890',
    HEADLEN = HEAD.length, TAILLEN = TAIL.length;

// naive minified names -- true minified names are shortest for the most used name, and longerst for the least used name
function renamer_minify(base, i) {
  if (base.length === 1 && i === 0)
    return base;
  var tail = false, name = "";

  while (true) {
    do {
      var m = -1;
      if (tail) { m = i % TAILLEN; name += TAIL.charAt(m); i =  (i-m)/TAILLEN; }
      else { m = i % HEADLEN; name += HEAD.charAt(m); i = (i-m)/HEADLEN; }
    } while (i > 0);
    if (iskw(name)) { name = ""; i++; continue; }
    break;
  }

  return name;
}

 export {renamer_incremental, HEAD, TAIL, HEADLEN, TAILLEN, renamer_minify};
