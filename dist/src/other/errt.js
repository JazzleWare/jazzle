  import {CTX_TOP, CTX_PARAM, CTX_PAT, CTX_HAS_A_PARAM_ERR, CTX_HAS_AN_ASSIG_ERR, CTX_HAS_A_SIMPLE_ERR, CTX_NO_SIMPLE_ERR} from './constants.js';
  import {ERR_PIN, ERR_NONE_YET, ERR_P_SYN, ERR_A_SYN, ERR_S_SYN} from './error-constants.js';

function errt_top(ctx) {
  return (ctx & CTX_TOP) === CTX_TOP;
}

function errt_pin(err) {
  return err & ERR_PIN;
}

function errt_noLeak(ctx) {
  return errt_top(ctx);
}

function errt_perr(ctx, err) {
  return errt_param(ctx) && err !== ERR_NONE_YET;
}

function errt_param(ctx) {
  return ctx & CTX_PARAM;
}

function errt_aerr(ctx, err) {
  return errt_pat(ctx) && err !== ERR_NONE_YET;
}

function errt_pat(ctx) {
  return ctx & CTX_PAT;
}

function errt_serr(ctx, err) {
  return errt_pat(ctx) && err !== ERR_NONE_YET;
}

function errt_ptrack(ctx) {
  return errt_param(ctx) && !(ctx & CTX_HAS_A_PARAM_ERR);
}

function errt_atrack(ctx) {
  return errt_pat(ctx) && !(ctx & CTX_HAS_AN_ASSIG_ERR);
}

function errt_strack(ctx) {
  return errt_pat(ctx) && !(ctx & CTX_HAS_A_SIMPLE_ERR);
}

function errt_elem_ctx_of(ctx) {
  return errt_pat(ctx) ?
    ctx & (
      CTX_HAS_A_PARAM_ERR|
      CTX_HAS_AN_ASSIG_ERR|
      CTX_HAS_A_SIMPLE_ERR|
      CTX_PARAM|CTX_PAT
    ) : CTX_PAT|CTX_NO_SIMPLE_ERR;
}

function errt_track(ctx) {
  return errt_pat(ctx) || errt_param(ctx);
}

function errt_psyn(err) { return err & ERR_P_SYN; }
function errt_asyn(err) { return err & ERR_A_SYN; }
function errt_ssyn(err) { return err & ERR_S_SYN; }

 export {errt_top, errt_pin, errt_noLeak, errt_perr, errt_param, errt_aerr, errt_pat, errt_serr, errt_ptrack, errt_atrack, errt_strack, errt_elem_ctx_of, errt_track, errt_psyn, errt_asyn, errt_ssyn};
