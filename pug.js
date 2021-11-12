const fs = require('fs/promises')
const pug = require('pug')
const { Command } = require('commander')
const program = new Command()
program
  .argument('<filename>', 'pug file to convert')
  .option('-c, --client', 'export as js template')
  .option('-E, --extension <ext>', 'force output extension')

program.parse(process.argv)

program
  .action(async (filename, options) => {
    const ext = options.extension || (options.client ? 'js' : 'html')
    const outFile = filename.replace(/\.\w+$/, `.${ext}`)
    const source = await fs.readFile(filename, 'utf-8')
    let outSource = pug.compile(source)()
    if (options.client) {
      outSource = `export default ${JSON.stringify(outSource)}`
    }
    fs.writeFile(outFile, outSource)
    console.log(`\x1b[32m\x1b[1m${filename}\x1b[10m → \x1b[1m${outFile}\x1b[0m`)
  })
  .parse()
