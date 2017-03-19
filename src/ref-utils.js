function isArguments(mname) {
  return mname === RS_ARGUMENTS;
}

function isSupCall(mname) {
  return mname === RS_SCALL;
}

function isSupMem(mname) {
  return mname === RS_SMEM;
}

function isNewTarget(mname) {
  return mname === RS_NTARGET;
}

function isThis(mname) {
  return mname === RS_THIS;
}
