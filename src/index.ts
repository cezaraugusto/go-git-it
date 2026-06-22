
import path from 'path'

import addProgressBar from './add-progress-bar.js'
import {
  parseGitHubUrl,
  isValidGitHubUrl,
  getOutputDirectoryName
} from './utils/url-parser.js'
import {
  downloadFullRepository,
  downloadPartialRepository,
  downloadReleaseAsset,
  validateGitAvailability,
  testGitHubConnectivity
} from './utils/download-strategies.js'
import {
  generateTempDirName,
  createDirectory,
  cleanupTempDirectory
} from './utils/cross-platform.js'
import cli, {shouldRunAsCli} from './cli.js'

/**
 * GitHub content downloader with git clone compatible behavior
 */
async function cloneRemote (
  outputDirectory: string,
  gitUrl: string
): Promise<void> {
  await validateGitAvailability()

  const urlData = parseGitHubUrl(gitUrl)

  await testGitHubConnectivity(urlData.owner, urlData.project)

  const tempDirName = generateTempDirName()
  const tempDir = path.join(outputDirectory, tempDirName)

  try {
    await createDirectory(tempDir)

    if (urlData.isReleaseAsset) {
      await downloadReleaseAsset(outputDirectory, urlData, tempDir)
    } else if (urlData.isMainRepo) {
      await downloadFullRepository(outputDirectory, urlData)
    } else {
      await downloadPartialRepository(outputDirectory, urlData, tempDir)
    }
  } finally {
    await cleanupTempDirectory(tempDir)
  }
}

/**
 * Main function - matches git clone API: goGitIt(url, [directory])
 */
async function goGitIt (
  gitURL: string,
  outputDirectory?: string,
  progressText?: string
): Promise<void> {
  if (!isValidGitHubUrl(gitURL)) {
    throw new Error(
      'Invalid GitHub URL. Please provide a valid GitHub repository URL.'
    )
  }

  const urlData = parseGitHubUrl(gitURL)
  const outputName = getOutputDirectoryName(urlData)

  const outDir = outputDirectory || process.cwd()

  await createDirectory(outDir)

  const remoteSource = `${urlData.owner}/${urlData.project}`
  const defaultProgressText = urlData.isMainRepo
    ? `Cloning ${remoteSource}...`
    : `Downloading ${outputName} from ${remoteSource}...`

  await addProgressBar(progressText || defaultProgressText, async () => {
    await cloneRemote(outDir, gitURL)
  })

  const finalPath = path.join(outDir, outputName)

  if (!progressText) {
    console.log(`Success! Content downloaded to ${finalPath}`)
  }
}

// Execute CLI when invoked as a binary
if (shouldRunAsCli(import.meta.url, process.argv[1])) {
  cli(goGitIt)
}

// Export as a node module as well
export default goGitIt
