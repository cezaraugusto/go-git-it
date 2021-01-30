#!/usr/bin/env node
const path = require('path')

const {log} = require('log-md')
const fullClone = require('./fullClone')
const sparseClone = require('./sparseClone')
const cli = require('./cli')

function goGitIt (gitURL, outputDirectory = process.cwd()) {
  const repoData = new URL(gitURL).pathname
  const [owner, project] = repoData.split('/').slice(1, 3)
  const [branch] = repoData.split('/').slice(4)
  const assetPath = repoData.split('/').slice(5).join('/') || project

  const projectMetadata = `${owner}/${project}`
  const downloadName = path.basename(assetPath)

  log(`\nDownloading \`${downloadName}\` from @${projectMetadata}...`)

  const options = { owner, project, branch, assetPath }

  // An assetPath equal to the project name means
  // user is trying to download a GitHub project from root
  if (assetPath === project) {
    fullClone(outputDirectory, options)
  } else {
    sparseClone(outputDirectory, options)
  }
}

if (require.main === module) {
  cli(process.argv, goGitIt)
}

module.exports = goGitIt
