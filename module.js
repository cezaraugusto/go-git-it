#!/usr/bin/env node
const path = require('path')

const shell = require('shelljs')
const {log} = require('log-md')
const fetchFullRemote = require('./fetchFullRemote')

function pullSource (branch) {
  // Throw away stderr
  // const noStderr = '2> /dev/null'
  const noStderr = ''

  return `git pull origin ${branch} ${noStderr}`
}

function cloneRemote (outputDirectory, options) {
  const { owner, project, branch, assetPath } = options

  // An assetPath equal to the project name means
  // user is trying to download a GitHub project from root
  if (assetPath === project) {
    fetchFullRemote(outputDirectory, options)
  } else {
    log('\n⏬ Downloading files from GitHub. (This might take a while...)')
    const execSparse = shell
      .exec('git clone \
        --depth 1 \
        --filter=blob:none \
        --sparse \
        https://github.com/' + owner + '/' + project
      )

    if (execSparse.code === 0) {
      shell.cd(project)

      // Download
      shell.exec('git sparse-checkout init --cone')
      shell.exec(`git sparse-checkout set ${assetPath}`)

      // Remove original downloaded file.
      shell.mv(assetPath, outputDirectory)
      shell.cd(outputDirectory)
      shell.rm('-rf', project)

      const outputName = path.basename(assetPath)
      const outputDir = path.jooin(outputDirectory, assetPath)
      log('')
      log(`_Success_! ${outputName} downloaded to \`${outputDir}\`.`)
    }
  }
}

function goGitIt (gitURL, outputDirectory = process.cwd()) {
  const repoData = new URL(gitURL).pathname
  const [owner, project] = repoData.split('/').slice(1, 3)
  const [branch] = repoData.split('/').slice(4)
  const assetPath = repoData.split('/').slice(5).join('/') || project

  const projectMetadata = `${owner}/${project}`
  const downloadName = path.basename(assetPath)

  log(`\n⏬ Downloading \`${downloadName}\` from @${projectMetadata}...`)

  const options = { owner, project, branch, assetPath }

  cloneRemote(outputDirectory, options)
}

if (require.main === module) {
  const args = process.argv

  // We need at least one argument to run
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

module.exports = goGitIt
