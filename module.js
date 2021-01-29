#!/usr/bin/env node
const path = require('path')

const {log} = require('log-md')
const fullClone = require('./fullClone')
const sparseClone = require('./sparseClone')

function cloneRemote (outputDirectory, options) {
  const {project, assetPath} = options

  // An assetPath equal to the project name means
  // user is trying to download a GitHub project from root
  if (assetPath === project) {
    fullClone(outputDirectory, options)
  } else {
    sparseClone(outputDirectory, options)
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
