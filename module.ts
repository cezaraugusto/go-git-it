#!/usr/bin/env node

import path from 'path'
import downloadMainRepo from './downloadMainRepo'
import downloadPartialRepo from './downloadPartialRepo'
import cli from './cli'
import * as getData from './getData'

function cloneRemote(
  outputDirectory: string,
  options: {
    filePath: string
    owner: string
    project: string
    isMainRepo: boolean
  }
) {
  const {owner, project, isMainRepo} = options

  if (isMainRepo) {
    downloadMainRepo(outputDirectory, {owner, project})
  } else {
    downloadPartialRepo(outputDirectory, options)
  }
}

function goGitIt(gitURL: string, outputDirectory?: string) {
  const urlData = new URL(gitURL).pathname.split('/')
  const remoteInfo = {
    owner: getData.getOwner(urlData),
    project: getData.getProject(urlData),
    filePath: getData.getFilePath(urlData),
    branch: getData.getBranch(urlData)
  }

  // A filePath equal to the project name means
  // user is trying to download a GitHub project from root
  const filePath = remoteInfo.filePath || remoteInfo.project
  const isMainRepo = filePath === remoteInfo.project

  const projectName = path.basename(filePath)
  const projectInfo = `${remoteInfo.owner}/${remoteInfo.project}`
  console.log(`Downloading \`${projectName}\` from \`@${projectInfo}\`...`)

  // Output directory defaults to working directory
  const outDir = outputDirectory || process.cwd()

  cloneRemote(outDir, {...remoteInfo, filePath, isMainRepo})
}

// Execute CLI if requested
if (require.main === module) cli(goGitIt)

// Export as a node module as well
export default goGitIt
