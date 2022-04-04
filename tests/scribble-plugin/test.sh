#!/bin/bash
echo "copying latest version of JS and Scribble plugin to source folder"
cp ../../dist/* .

echo "generating HTML output"
raco scribble --htmls --dest output/html test.scrbl

echo "generating LaTEX output for diffing"
raco scribble --latex --dest output/latex test.scrbl

echo "producing pdf output"
raco scribble --pdf --dest output/pdf test.scrbl
