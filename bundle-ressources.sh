#!/bin/bash

# Bundle all ressources as text into the Typescript module src/ressources.ts

# Right now covers SVG icons and CSS styles

# reset ressources.ts
echo "module Ressources {" > src/ressources.ts

# Base64 flag differs depending on OS
# - Linux: --wrap=0
# - MacOS: --break=0
if [ $(uname) == Linux ]; then
  base64flag="--wrap=0";
else
  base64flag="--break=0";
fi

# SVG icons
cd src/ressources/icons
for i in *; do
  echo "export const $(basename $i .svg | sed s/-/_/g) = \`data:image/svg+xml;base64,$(base64 $base64flag $i)\`;" >> ../../ressources.ts;
done;

# css style
cd ..

echo "export const style = \`$(cat style.css)\`;" >> ../ressources.ts

echo "}" >> ../ressources.ts
