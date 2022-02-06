function pullSource (branch) {
  return `git pull origin --quiet ${branch} --depth 1`
}

module.exports = pullSource
