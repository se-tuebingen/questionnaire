#!/bin/bash
echo "copying latest version of JS plugin to source folder"
cp ../dist/questionnaire.js .

echo "generating HTML output"
scribble --htmls --dest html test.scrbl

echo "producing pdf output"
scribble --pdf --dest pdf test.scrbl
