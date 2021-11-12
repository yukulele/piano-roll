default: build

BIN := ./node_modules/.bin

STYLUS_SRC_FILE := $(wildcard src/styles/*.styl)

STYLUS_DEST := $(STYLUS_SRC_FILE:src/%.styl=public/%.css)

public/%.css: src/%.styl
	@echo "stylus: $< ➜ $@"
	@$(BIN)/stylus < $< > $@

src/scripts/pianoRollTemplate.html: src/scripts/pianoRollTemplate.pug
	@node ./pug.js src/scripts/pianoRollTemplate.pug
src/scripts/pianoRollTemplate.js: src/scripts/pianoRollTemplate.pug
	@node ./pug.js src/scripts/pianoRollTemplate.pug --client --no-debug -E js -n '_(){};export default (_)=>__(_);function __'

public/scripts/script.js: rollup.config.js tsconfig.json src/scripts/pianoRollTemplate.js $(wildcard src/scripts/*.ts)
	@$(BIN)/rollup --config

install: node_modules/

node_modules/:
	npm install

clear:
	@rm -fv \
		src/scripts/pianoRollTemplate.js \
		public/scripts/script.js \
		public/scripts/script.js.map \
		$(STYLUS_DEST)

build: node_modules/ public/scripts/script.js $(STYLUS_DEST)

rebuild: clear build

watch:
	@echo 'watching for change'
	@echo 'press ctrl+C to stop'
	@while true; do ${MAKE} --silent ; sleep 0.5; done

serve:
	@$(BIN)/http-server -o -c-1

.PHONY: default install clear build watch serve