all: bundle typescript

bundle:
	./bundle-ressources.sh

typescript:
	tsc

test:
	cp dist/questionnaire.js tests/javascript-plugin
	cd tests/scribble-plugin && ./test.sh
