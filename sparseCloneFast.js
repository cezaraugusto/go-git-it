#!/usr/bin/env node
const path = require('path')

const shell = require('shelljs')
const {log} = require('log-md')

module.exports = function (outputDirectory, options) {
  const {assetPath, owner, project} = options
  const execSparse = shell
    .exec('git clone \
      --quiet \
      --depth 1 \
      --filter=blob:none \
      --sparse \
      https://github.com/' + owner + '/' + project
    )

  if (execSparse.code === 0) {
    shell.cd(project)
    shell.exec('git sparse-checkout init --cone')
    shell.exec(`git sparse-checkout set ${assetPath}`)

    // Remove original downloaded file
    shell.mv(assetPath, outputDirectory)
    shell.cd(outputDirectory)
    shell.rm('-rf', project)

    const outputName = path.basename(assetPath)
    log('')
    log(`_Success_! ${outputName} downloaded to \`${outputDirectory}\`.`)
  }
}
