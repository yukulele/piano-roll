default: www/script.js

src/piano-roll-template.ts:
	npm run pug

www/script.js: src/piano-roll-template.ts src/*.ts
	npm run rollup

clear:
	rm -f \
		src/piano-roll-template.ts \
	  www/script.js \
	  www/script.js.map \

watch:
	@echo 'watching for change'
	@echo 'press ctrl+C to stop'
	@while true; do (make --silent || exit 1) ; sleep 0.5; done

.PHONY: default clear watch