.PHONY: help test build-dict serve clean

help:
	@echo "Available targets:"
	@echo "  test        Run test suite"
	@echo "  build-dict  Build dictionary from scripts/build-dictionary.js"
	@echo "  serve       Serve web interface at http://localhost:8000"
	@echo "  clean       Remove generated docs directory"

test:
	node --test tests/*.js

build-dict:
	node scripts/build-dictionary.js

serve:
	python3 -m http.server -d . 8000

clean:
	rm -rf docs
