const path = require('path')
const shell = require('shelljs')
const {log} = require('log-md')

module.exports = function (outputDirectory, options) {
  const {owner, project, branch, assetPath} = options

  shell.mkdir('-p', path.join(outputDirectory, project))
  shell.cd(path.join(outputDirectory, project))
  shell.exec('git init --quiet')
  shell.exec(`git remote add origin https://github.com/${owner}/${project}`)
  shell.exec('git config core.sparsecheckout true')
  shell.exec(`echo "${assetPath}" >> .git/info/sparse-checkout`)
  const pullExit = shell.exec(`git pull origin --quiet ${branch} --depth 1`)
  shell.mv(assetPath, outputDirectory)
  shell.rm('-rf', path.join(outputDirectory, project))

  if (pullExit.code === 0) {
    log(`_Success_! ${project} downloaded to \`${outputDirectory}\`.`)
  }
}
