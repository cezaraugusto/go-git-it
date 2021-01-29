const shell = require('shelljs')
const {log} = require('log-md')

module.exports = function (outputDirectory, options) {
  const {owner, project} = options
  const execCloneNoSparse = shell
    .exec('git clone \
      --quiet \
      --depth 1 \
      --no-checkout \
      https://github.com/' + owner + '/' + project + ' ' + outputDirectory
    )

  if (execCloneNoSparse.code !== 0) {
    log('Error when trying to clone git data')
    process.exit(execCloneNoSparse.code)
  } else {
    log('')
    log(`_Success_! ${project} downloaded to \`${outputDirectory}\`.`)
  }
}
