default: build

BIN := ./node_modules/.bin

STYLUS_SRC_FILE := $(wildcard src/styles/*.styl)

STYLUS_DEST := $(STYLUS_SRC_FILE:src/%.styl=www/%.css)

www/%.css: src/%.styl
	@echo "stylus: $< ➜ $@"
	@$(BIN)/stylus < $< > $@

src/scripts/pianoRollTemplate.html: src/scripts/pianoRollTemplate.pug
	@node ./pug.js src/scripts/pianoRollTemplate.pug
src/scripts/pianoRollTemplate.js: src/scripts/pianoRollTemplate.pug
	@node ./pug.js src/scripts/pianoRollTemplate.pug --client --no-debug -E js -n '_(){};export default (_)=>__(_);function __'

www/scripts/script.js: src/scripts/pianoRollTemplate.js $(wildcard src/scripts/*.ts)
	@$(BIN)/rollup --config

install: node_modules/

node_modules/:
	npm install

clear:
	@rm -rfv public
	@rm -fv \
		src/scripts/pianoRollTemplate.js \
		www/scripts/script.js \
		www/scripts/script.js.map \
		$(STYLUS_DEST)

build: node_modules/ www/scripts/script.js $(STYLUS_DEST)

rebuild: clear build

public: rebuild
	cp -r www/ public/

watch:
	@echo 'watching for change'
	@echo 'press ctrl+C to stop'
	@while true; do ${MAKE} --silent ; sleep 0.5; done

serve:
	@$(BIN)/http-server -o www/

.PHONY: default install clear build watch serve