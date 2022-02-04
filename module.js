#!/usr/bin/env node
const path = require('path')
const downloadMainRepo = require('./downloadMainRepo')
const downloadPartialRepo = require('./downloadPartialRepo')
const cli = require('./cli')

function cloneRemote (outputDirectory, options) {
  const { isMainRepo } = options

  if (isMainRepo) {
    downloadMainRepo(outputDirectory, options)
  } else {
    downloadPartialRepo(outputDirectory, options)
  }
}

function goGitIt (gitURL, outputDirectory) {
  const urlData = new URL(gitURL).pathname.split('/')
  const remoteInfo = {
    owner: urlData.slice(1, 3)[0],
    project: urlData.slice(1, 3)[1],
    branch: urlData.slice(4)[0],
    filePath: urlData.slice(5).join('/')
  }

  // A filePath equal to the project name means
  // user is trying to download a GitHub project from root
  const filePath = remoteInfo.filePath || remoteInfo.project
  const isMainRepo = filePath === remoteInfo.project

  const projectName = path.basename(filePath)
  const projectInfo = `${remoteInfo.owner}/${remoteInfo.project}`
  console.log(`\nDownloading \`${projectName}\` from \`@${projectInfo}\`...`)

  // Output directory defaults to working directory
  const outDir = outputDirectory || process.cwd()

  cloneRemote(outDir, {...remoteInfo, filePath, isMainRepo})
}

// Execute CLI if requested
if (require.main === module) cli(goGitIt)

// Export as a node module as well
module.exports = goGitIt
