#!/bin/bash
BENCH="node bench/run.js";

$BENCH j | tee bench/j.bench & 
$BENCH e | tee bench/e.bench &
$BENCH a | tee bench/a.bench &
$BENCH p | tee bench/p.bench &

