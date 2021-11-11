const fs = require('fs/promises');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const argv = yargs(hideBin(process.argv))
  .alias('c', 'client')
  .alias('n', 'name')
  .alias('E', 'extension').argv;

const filename = argv._[0];
const outFile = filename.replace(
  /.\w+$/,
  '.' + (argv.extension || (argv.client ? 'js' : 'html')),
);
(async () => {
  const source = await fs.readFile(filename, 'utf-8');

  const pug = require('pug');

  // Compile the source code
  const outSource = !argv.client
    ? pug.compile(source)()
    : pug.compileClient(source, {
        compileDebug: argv.debug,
        name: argv.name || 'template',
      });
  fs.writeFile(outFile, outSource);
  console.log(`\x1b[32m\x1b[1m${filename}\x1b[10m → \x1b[1m${outFile}\x1b[0m`);
})();
