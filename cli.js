const {log} = require('log-md')

module.exports = function (args, goGitIt) {
  if (args.length < 3) {
    log(`
      You need to provide a valid GitHub URL to start a download.
    `)
    process.exit()
  }

  if (args.length === 3) {
    goGitIt(args[args.length - 1])
    process.exit()
  }

  if (args.length === 4) {
    goGitIt(
      args[args.length - 2],
      args[args.length - 1]
    )
    process.exit()
  }
}
