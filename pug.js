const fs = require('fs/promises')
const pug = require('pug')
const { Command } = require('commander')
const program = new Command()
program
  .argument('<filename>', 'pug file to convert')
  .option('-c, --client', 'export as js template')
  .option('-E, --extension <ext>', 'force output extension')
  .option('-w, --watch', 'watch mode')

program.parse(process.argv)

program
  .action(async (filename, options) => {
    const ext = options.extension || (options.client ? 'js' : 'html')
    const outFile = filename.replace(/\.\w+$/, `.${ext}`)
    const watcher = fs.watch(filename)
    await build(filename, outFile, options)
    if(!options.watch) return
    let i =0;
    for await (const event of watcher){
      await build(filename, outFile, options)
    }
  })
  .parse()


async function build(filename, outFile, options) {
  const source = await fs.readFile(filename, 'utf-8')
  let outSource = pug.compile(source)()
  if (options.client) {
    outSource = `export default ${JSON.stringify(outSource)}`
  }
  fs.writeFile(outFile, outSource)
  console.info(`\x1b[32m\x1b[1m${filename}\x1b[10m → \x1b[1m${outFile}\x1b[0m`)
}