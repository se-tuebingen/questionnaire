all: bundle typescript

bundle:
	./bundle-ressources.sh

typescript:
	tsc

test:
	cd tests/scribble-plugin && ./test.sh
