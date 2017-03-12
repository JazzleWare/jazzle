function toBody(b) {
  if (b.length > 1)
    return { type: 'BlockStatement', body: b };

  if (b.length === 1)
    return b[0];

  return { type: 'EmptyStatement' };
}

function spreadIdx(array, start) {
  var list = array, i = start;
  while (i < list.length) {
    var elem = list[i];
    if (elem !== null && elem.type === 'SpreadElement')
      return i;
    ++i;
  }
  return -1;
}
