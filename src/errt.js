function errt_noLeak(ctx) {
  return !(ctx & CTX_PAT) || (ctx & CTX_NO_SIMPLE_ERR);
}

function errt_pin(err) {
  return err & ERR_PIN;
}
