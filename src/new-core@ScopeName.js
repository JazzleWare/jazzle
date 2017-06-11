this.hasName_m =
function(mname) {
  return _m(this.name) === mname;
};

// attachment state:
// src null or not an fn decl -> unattached
// otherwise:
//   src lexical-like -> unattached
//   otherwise:
//     src has no synthName -> uncertain
//     otherwise:
//       src has non-matching synthName -> unattached
//       otherwise -> attached
this.getAS =
function() {
  var src = this.source;
  if (src === null || src.isLexicalLike())
    return ATS_DISTINCT;
  if (src.synthName === "")
    return ATS_UNSURE; // semi-attached
  if (src.synthName === src.name)
    return ATS_SAME;
  return ATS_DISTINCT;
};
