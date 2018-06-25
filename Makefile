default: build

STYLUS_SRC_FILE := $(wildcard src/styles/*.styl)

STYLUS_DEST := $(STYLUS_SRC_FILE:src/%.styl=www/%.css)

www/%.css: src/%.styl
	@echo "stylus: $< ➜ $@"
	npx stylus < $< > $@

src/scripts/piano-roll-template.js: src/scripts/piano-roll-template.pug
	npx pug src/scripts/piano-roll-template.pug --client --no-debug -E js -n '_(){};export default (_)=>__(_);function __'

www/scripts/script.js: src/scripts/piano-roll-template.js $(wildcard src/scripts/*.ts)
	npx rollup --config

clear:
	rm -f \
		src/scripts/piano-roll-template.js \
		www/scripts/script.js \
		www/scripts/script.js.map \
		$(STYLUS_DEST)

build: www/scripts/script.js $(STYLUS_DEST)

watch:
	@echo 'watching for change'
	@echo 'press ctrl+C to stop'
	@while true; do make --silent ; sleep 0.5; done

.PHONY: default clear watch build