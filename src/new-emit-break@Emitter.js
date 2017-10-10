// Emitters['ForOfStatement'] =
Emitters['ForInStatement'] =
Emitters['ForStatement'] =
// Emitters['TryStatement'] =
// Emitters['LabeledStatement'] =
// Emitters['ContinueStatement'] =
// Emitters['BreakStatement'] =
function(n, flags, isStmt) {
  console.log('SKIPPING', n.type, 'LEN', n.end - n.start);
};
