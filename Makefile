tmp1 := $(shell mktemp /tmp/bundle.XXXX)
tmp2 := $(shell mktemp /tmp/bundle.XXXX)

build: lib vendor
	@echo building

	@browserify lib/main.js > $(tmp1)
	@mv $(tmp1) bundle.js

	@browserify lib/worker-parser.js > $(tmp2)
	@mv $(tmp2) worker-parser-bundle.js

clean:
	@echo cleaning
	rm *bundle.js

.PHONY: clean