tmp1 := $(shell mktemp /tmp/bundle.XXXX)
tmp2 := $(shell mktemp /tmp/bundle.XXXX)
tmp3 := $(shell mktemp /tmp/bundle.XXXX)

build: lib vendor
	@echo building

	@browserify lib/main.js > $(tmp1)
	@mv $(tmp1) bundle.js

	@browserify lib/worker-parser.js > $(tmp2)
	@mv $(tmp2) worker-parser-bundle.js

	@cat css/font-awesome.css > $(tmp3)
	@cat css/normalize.css >> $(tmp3)
	@myth css/style.css >> $(tmp3)
	@cat vendor/prism.css >> $(tmp3)
	@mv $(tmp3) bundle.css

minify:
	@make build
	@echo minifying
	@uglifyjs bundle.js -o bundle.js
	@uglifyjs worker-parser-bundle.js -o worker-parser-bundle.js
	@cleancss -o bundle.css bundle.css

clean:
	@echo cleaning
	rm *bundle.js

.PHONY: clean