const {log} = require('log-md')
const shell = require('shelljs')
const sparseCloneSlow = require('./sparseCloneSlow')
const sparseCloneFast = require('./sparseCloneFast')

module.exports = function (outputDirectory, options) {
  const git = shell.exec('git --version', { silent: true }).stdout

  const [, minor] = git.split('.')

  if (Number(minor) < 30) {
    log(
      '\n' +
      'You are running a git version below \`v2.30.0\`. Download will be slow.' +
      '\n' +
      'If performance is key, consider updating git to \`v2.30.0\` or newer.' +
      '\n'
    )
    sparseCloneSlow(outputDirectory, options)
    return
  }
  sparseCloneFast(outputDirectory, options)
}
