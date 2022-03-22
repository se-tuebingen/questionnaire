#!/bin/bash
echo "generating HTML output"
scribble --htmls --dest html test.scrbl
echo "copying JS file to output location"
cp ../dist/questionnaire.js html/test

echo "producing pdf output"
scribble --pdf --dest pdf test.scrbl
