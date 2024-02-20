#!/usr/bin/env node

import {blue, underline} from '@colors/colors/safe'

import downloadMainRepo from './downloadMainRepo'
import downloadPartialRepo from './downloadPartialRepo'
import cli from './cli'

import * as getData from './getData'
import addProgressBar from './addProgressBar'

async function cloneRemote(
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
    await downloadMainRepo(outputDirectory, {owner, project})
  } else {
    await downloadPartialRepo(outputDirectory, options)
  }
}

async function goGitIt(
  gitURL: string,
  outputDirectory?: string,
  text?: string
) {
  const urlData = new URL(gitURL).pathname.split('/')
  const remoteInfo = {
    owner: getData.getOwner(urlData),
    project: getData.getProject(urlData),
    filePath: getData.getFilePath(urlData),
    branch: getData.getBranch(urlData)
  }

  const filePath = remoteInfo.filePath || remoteInfo.project
  const isMainRepo = filePath === remoteInfo.project

  // Output directory defaults to working directory
  const outDir = outputDirectory || process.cwd()
  const remoteSource = `@${remoteInfo.owner}/${remoteInfo.project}`
  await addProgressBar(
    text || `Downloading...${blue(filePath)} from ${remoteSource}`,
    async () => {
      await cloneRemote(outDir, {...remoteInfo, filePath, isMainRepo})
    }
  )

  if (!text) {
    console.log(
      `\nSuccess! ${blue(filePath)} downloaded to ${underline(outDir + '/' + filePath)}`
    )
  }
}

// Execute CLI if requested
if (require.main === module) cli(goGitIt)

// Export as a node module as well
export default goGitIt
