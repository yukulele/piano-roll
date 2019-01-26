default: build

BIN := ./node_modules/.bin

STYLUS_SRC_FILE := $(wildcard src/styles/*.styl)

STYLUS_DEST := $(STYLUS_SRC_FILE:src/%.styl=www/%.css)

www/%.css: src/%.styl
	@echo "stylus: $< ➜ $@"
	$(BIN)/stylus < $< > $@

src/scripts/pianoRollTemplate.js: src/scripts/pianoRollTemplate.pug
	$(BIN)/pug src/scripts/pianoRollTemplate.pug --client --no-debug -E js -n '_(){};export default (_)=>__(_);function __'

www/scripts/script.js: src/scripts/pianoRollTemplate.js $(wildcard src/scripts/*.ts)
	$(BIN)/rollup --config

clear:
	rm -f \
		src/scripts/pianoRollTemplate.js \
		www/scripts/script.js \
		www/scripts/script.js.map \
		$(STYLUS_DEST)

build: www/scripts/script.js $(STYLUS_DEST)

watch:
	@echo 'watching for change'
	@echo 'press ctrl+C to stop'
	@while true; do ${MAKE} --silent ; sleep 0.5; done

serve:
	$(BIN)/browser-sync start -c bs-config.js

.PHONY: default clear watch build serve