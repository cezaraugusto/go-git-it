function pullSource (branch) {
  // Throw away stderr
  const noStderr = '2> /dev/null'

  return `git pull origin --quiet ${branch} --depth 1 ${noStderr}`
}

module.exports = pullSource
