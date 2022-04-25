all: bundle typescript

bundle:
	./bundle-ressources.sh

typescript:
	tsc

test:
	cd tests/javascript-plugin && cp ../../dist/questionnaire.js questionnaire.js
	cd tests/scribble-plugin && ./test.sh
