#!/usr/bin/env node
const path = require('path')

const shell = require('shelljs')
const {log} = require('log-md')

module.exports = function (outputDirectory, options) {
  const {assetPath, owner, project} = options
  const projectPath = path.join(outputDirectory, assetPath)
  const execCloneNoSparse = shell
    .exec('git clone \
      --depth 1 \
      --filter=blob:none \
      https://github.com/' + owner + '/' + project + ' ' + projectPath
    )

  if (execCloneNoSparse.code !== 0) {
    log('Error when trying to clone git data')
    process.exit(copyExit.code)
  } else {
    log('')
    log(`_Success_! ${project} downloaded to \`${outputDirectory}\`.`)
  }
}
