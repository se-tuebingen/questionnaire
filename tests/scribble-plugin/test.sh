#!/bin/bash

# script fails if one command fails
set -e

echo "copying latest version of JS and Scribble plugin to source folder"
cp ../../dist/* .

echo "generating HTML output"
raco scribble --htmls --dest output/html test.scrbl

echo "generating LaTEX output for diffing"
raco scribble --latex --dest output/latex test.scrbl

echo "producing pdf output"
raco scribble --pdf --dest output/pdf test.scrbl

echo "testing non-compilation of error test cases"
if raco scribble --htmls --dest output/html no-solution-error.scrbl; then
  echo "error: test case compiled without warning"
  exit 1
else
  echo "success: test case did not compile"
fi
