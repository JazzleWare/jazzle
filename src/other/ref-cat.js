
function ref_arguments_m(mname) {
  return mname === RS_ARGUMENTS;
}

function ref_scall_m(mname) {
  return mname === RS_SCALL;
}

function ref_this_m(mname) {
  return mname === RS_THIS;
}

 export {ref_arguments_m, ref_scall_m, ref_this_m};
