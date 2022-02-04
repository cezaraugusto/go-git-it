const shell = require('shelljs')

function pullSource (branch) {
  // Throw away stderr
  const noStderr = '2> /dev/null'

  return `git pull origin --quiet ${branch} --depth 1 ${noStderr}`
}

function downloadMainRepo (projectDir, {owner, project}) {
  shell.mkdir('-p', projectDir)
  shell.cd(projectDir)
  shell.exec('git init --quiet')
  shell.exec(`git remote add origin https://github.com/${owner}/${project}`)

  // User is in the project root directory, try cloning from `main`
  shell.exec(pullSource('main'))

  // Nothing added on `main`, try the old `master`
  const pullExit = shell.exec(`[ "$(ls -A .)" ] || ${pullSource('master')}`)

  // Nothing added. We need a branch so we exit with error
  const errorMessage =
    'No default branch found. Add the branch name to the URL and try again.'

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
