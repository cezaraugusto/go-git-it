#!/usr/bin/env node

import addProgressBar from './add-progress-bar.js';
import {
  parseGitHubUrl,
  isValidGitHubUrl,
  getOutputDirectoryName,
} from './utils/url-parser.js';
import {
  downloadFullRepository,
  downloadPartialRepository,
  downloadReleaseAsset,
  validateGitAvailability,
  testGitHubConnectivity,
} from './utils/download-strategies.js';
import {
  generateTempDirName,
  createDirectory,
  cleanupTempDirectory,
} from './utils/cross-platform.js';
import cli from './cli.js';
import path from 'path';

/**
 * Enhanced GitHub content downloader with git clone compatible behavior
 */
async function cloneRemote(
  outputDirectory: string,
  gitUrl: string,
): Promise<void> {
  // Validate git availability first
  await validateGitAvailability();

  // Parse the GitHub URL
  const urlData = parseGitHubUrl(gitUrl);

  // Test GitHub connectivity
  await testGitHubConnectivity(urlData.owner, urlData.project);

  // Create unique temporary directory
  const tempDirName = generateTempDirName();
  const tempDir = path.join(outputDirectory, tempDirName);

  try {
    // Create temporary directory
    await createDirectory(tempDir);

    // Choose appropriate download strategy
    if (urlData.isReleaseAsset) {
      await downloadReleaseAsset(outputDirectory, urlData, tempDir);
    } else if (urlData.isMainRepo) {
      await downloadFullRepository(outputDirectory, urlData);
    } else {
      await downloadPartialRepository(outputDirectory, urlData, tempDir);
    }
  } finally {
    // Always cleanup temporary directory
    await cleanupTempDirectory(tempDir);
  }
}

/**
 * Main function - matches git clone API: goGitIt(url, [directory])
 */
async function goGitIt(
  gitURL: string,
  outputDirectory?: string,
  progressText?: string,
): Promise<void> {
  // Validate GitHub URL
  if (!isValidGitHubUrl(gitURL)) {
    throw new Error(
      'Invalid GitHub URL. Please provide a valid GitHub repository URL.',
    );
  }

  // Parse URL to get expected output info
  const urlData = parseGitHubUrl(gitURL);
  const outputName = getOutputDirectoryName(urlData);

  // Output directory defaults to current working directory (like git clone)
  const outDir = outputDirectory || process.cwd();

  // Ensure output directory exists
  await createDirectory(outDir);

  const remoteSource = `${urlData.owner}/${urlData.project}`;
  const defaultProgressText = urlData.isMainRepo
    ? `Cloning ${remoteSource}...`
    : `Downloading ${outputName} from ${remoteSource}...`;

  await addProgressBar(progressText || defaultProgressText, async () => {
    await cloneRemote(outDir, gitURL);
  });

  // Success message with final path (matching git clone behavior)
  const finalPath = path.join(outDir, outputName);
  if (!progressText) {
    console.log(`Success! Content downloaded to ${finalPath}`);
  }
}

// Execute CLI if requested
if (import.meta.url === `file://${process.argv[1]}`) {
  cli(goGitIt);
}

// Export as a node module as well
export default goGitIt;
