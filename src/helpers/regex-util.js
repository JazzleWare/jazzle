function isSurroComp(n) {
  return n.type === '#Regex.SurrogateComponent';
}

function isLead(n) {
  return isSurroComp(n) && n.kind === 'lead' ;
}

function isTrail(n) {
  return isSurroComp(n) && n.kind === 'trail';
}

function uAkin(a,b) {
  ASSERT.call(this, isSurroComp(a), 'a');
  ASSERT.call(this, isSurroComp(b), 'b');
  return a.escape === b.escape;
}
