#!/bin/bash
echo "copying latest version of JS plugin to source folder"
cp dist/questionnaire.js .

echo "generating HTML output"
raco scribble --htmls --dest output/html scribble-plugin/test.scrbl

echo "producing pdf output"
raco scribble --pdf --dest output/pdf scribble-plugin/test.scrbl
