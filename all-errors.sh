#!/bin/bash
JAZZLE="$1"
if [ -z "$JAZZLE" ]; then
  if [ -e "./dist/jazzle.js" ]; then
     JAZZLE=./dist/jazzle.js;
  elif [ -e "./dist/jazzle_error.js" ]; then
     JAZZLE="./dist/jazzle_error.js";
  else
     echo "no source for jazzle. quitting." 1>&2
     exit 1
  fi
fi    
  
echo "jazzle <$JAZZLE>" 1>&2

perl -e "
while (<>) {
  if (/'([^' \.]+(\.[^' \.]*)+)'/ ) {
     print \"\$1\\n\"
  }
}" < "$JAZZLE" | sort | uniq

