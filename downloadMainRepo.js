const path = require('path')
const shell = require('shelljs')
const pullSource = require('./pullSource')

function downloadMainRepo (outputDirectory, options) {
  const {owner, project} = options
  shell.mkdir('-p', path.join(outputDirectory, project))
  shell.cd(path.join(outputDirectory, project))
  shell.exec('git init --quiet')
  shell.exec(`git remote add origin https://github.com/${owner}/${project}`)

  // User is in the project root directory, try pulling from `main`
  shell.exec(pullSource('main'))

  // Nothing added on `main`, try the old `master`
  const pullExit = shell.exec(`[ "$(ls -A .)" ] || ${pullSource('master')}`)

  // Nothing added. We need a branch so we exit with error
  const errorMessage =
    'No default branch found. Ensure you are pulling from `main` or `master` branch.'

  const copyExit = shell.exec(`[ "$(ls -A .)" ] || echo ${errorMessage}`)

  // Remove the git folder as we don't need it
  shell.rm('-rf', '.git')

  // Git data pull failed
  if (pullExit.code !== 0) {
    console.log('Error when trying to pull git data', pullExit.stderr)
    process.exit(pullExit.code)
  // The attempt to copy files failed
  } else if (copyExit.code !== 0) {
    console.log('Error when trying to copy git data', copyExit.stderr)
    process.exit(copyExit.code)
  // All good, project downloaded
  } else {
    console.log('')
    console.log(`Success! \`${project}\` downloaded to \`${outputDirectory}\`.`)
  }
}

module.exports = downloadMainRepo
