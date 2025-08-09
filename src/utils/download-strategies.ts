import https from 'https';
import fs from 'fs/promises';
import path from 'path';
import {
  removeDirectory,
  createDirectory,
  executeGitCommand,
  cleanupGitDirectory,
  pathExists,
  moveFileOrDirectory,
} from './cross-platform.js';
import { GitHubUrlData } from './url-parser.js';

export async function downloadFullRepository(
  outputDirectory: string,
  data: GitHubUrlData,
): Promise<void> {
  const projectPath = path.join(outputDirectory, data.project);

  // Create project directory
  await createDirectory(projectPath);

  try {
    // Initialize git repository
    await executeGitCommand('git init --quiet', {
      cwd: projectPath,
    });

    // Add remote origin
    await executeGitCommand(
      `git remote add origin https://github.com/${data.owner}/${data.project}`,
      { cwd: projectPath },
    );

    // Try to pull from specified branch first, then fallback to common branches
    const branchesToTry = [data.branch, 'main', 'master', 'develop'];
    const uniqueBranches = [...new Set(branchesToTry)];

    let success = false;
    let lastError: Error | null = null;

    for (const branch of uniqueBranches) {
      try {
        await executeGitCommand(`git pull origin ${branch} --depth 1 --quiet`, {
          cwd: projectPath,
        });
        success = true;
        break;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        console.log(`Failed to pull from branch '${branch}', trying next...`);
      }
    }

    if (!success) {
      throw new Error(
        `Could not pull from any branch. Last error: ${lastError?.message || 'Unknown error'}`,
      );
    }

    // Clean up .git directory to match git clone behavior when not needed
    await cleanupGitDirectory(projectPath);
  } catch (error) {
    // Clean up on failure
    await removeDirectory(projectPath);
    throw error;
  }
}

export async function downloadPartialRepository(
  outputDirectory: string,
  data: GitHubUrlData,
  tempDir: string,
): Promise<void> {
  try {
    // Initialize git repository in temp directory
    await executeGitCommand('git init --quiet', {
      cwd: tempDir,
    });

    // Add remote origin
    await executeGitCommand(
      `git remote add origin https://github.com/${data.owner}/${data.project}`,
      { cwd: tempDir },
    );

    // Enable sparse checkout
    await executeGitCommand('git config core.sparseCheckout true', {
      cwd: tempDir,
    });

    // Set up sparse checkout pattern
    const sparseCheckoutPath = path.join(
      tempDir,
      '.git',
      'info',
      'sparse-checkout',
    );
    const sparsePath = data.isFile ? data.filePath : `${data.filePath}/*`;
    await fs.writeFile(sparseCheckoutPath, sparsePath);

    // Pull the specific branch with sparse checkout
    await executeGitCommand(
      `git pull origin ${data.branch} --depth 1 --quiet`,
      { cwd: tempDir },
    );

    // Move the downloaded content to final destination
    const sourcePath = path.join(tempDir, data.filePath);
    const outputName = path.basename(data.filePath);
    const destinationPath = path.join(outputDirectory, outputName);

    // Ensure source exists
    if (!(await pathExists(sourcePath))) {
      throw new Error(`Content not found at path: ${data.filePath}`);
    }

    await moveFileOrDirectory(sourcePath, destinationPath);
  } catch (error) {
    throw new Error(
      `Failed to download partial repository: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

export async function downloadReleaseAsset(
  outputDirectory: string,
  data: GitHubUrlData,
  tempDir: string,
): Promise<void> {
  if (!data.downloadUrl) {
    throw new Error('Release asset download URL not available');
  }

  const fileName = path.basename(data.filePath);
  const tempFilePath = path.join(tempDir, fileName);
  const finalPath = path.join(outputDirectory, fileName);

  return new Promise((resolve, reject) => {
    fs.open(tempFilePath, 'w')
      .then((fileHandle) => {
        const writeStream = fileHandle.createWriteStream();

        https
          .get(data.downloadUrl!, (response) => {
            if (response.statusCode === 302 || response.statusCode === 301) {
              // Handle redirects
              const redirectUrl = response.headers.location;
              if (redirectUrl) {
                writeStream.destroy();
                fileHandle.close();

                https
                  .get(redirectUrl, (redirectResponse) => {
                    if (redirectResponse.statusCode !== 200) {
                      reject(
                        new Error(
                          `Failed to download release asset: HTTP ${redirectResponse.statusCode}`,
                        ),
                      );
                      return;
                    }

                    handleDownloadStream(
                      redirectResponse,
                      tempFilePath,
                      finalPath,
                      resolve,
                      reject,
                    );
                  })
                  .on('error', reject);
                return;
              }
            }

            if (response.statusCode !== 200) {
              writeStream.destroy();
              fileHandle.close();
              reject(
                new Error(
                  `Failed to download release asset: HTTP ${response.statusCode}`,
                ),
              );
              return;
            }

            handleDownloadStream(
              response,
              tempFilePath,
              finalPath,
              resolve,
              reject,
            );
          })
          .on('error', (error) => {
            writeStream.destroy();
            fileHandle.close();
            reject(error);
          });
      })
      .catch(reject);
  });
}

function handleDownloadStream(
  response: NodeJS.ReadableStream,
  tempFilePath: string,
  finalPath: string,
  resolve: () => void,
  reject: (error: Error) => void,
): void {
  fs.open(tempFilePath, 'w')
    .then((fileHandle) => {
      const writeStream = fileHandle.createWriteStream();

      response.pipe(writeStream);

      writeStream.on('finish', async () => {
        await fileHandle.close();
        try {
          await moveFileOrDirectory(tempFilePath, finalPath);
          resolve();
        } catch (error) {
          reject(error instanceof Error ? error : new Error(String(error)));
        }
      });

      writeStream.on('error', async (error) => {
        await fileHandle.close();
        await removeDirectory(tempFilePath).catch(() => {});
        reject(error);
      });
    })
    .catch(reject);
}

export async function validateGitAvailability(): Promise<void> {
  try {
    const output = await executeGitCommand('git --version', {
      cwd: process.cwd(),
    });
    console.log(`Using ${output.trim()}`);
  } catch {
    throw new Error(
      "Git is required but not found in PATH. Please install Git and ensure it's available in your terminal.",
    );
  }
}

export async function testGitHubConnectivity(
  owner: string,
  project: string,
  skipCheck = false,
): Promise<void> {
  if (skipCheck || process.env.NODE_ENV === 'test') {
    return; // Skip connectivity check in test environment
  }

  return new Promise((resolve, reject) => {
    const testUrl = `https://api.github.com/repos/${owner}/${project}`;

    https
      .get(testUrl, (response) => {
        if (response.statusCode === 200) {
          resolve();
        } else if (response.statusCode === 404) {
          reject(
            new Error(`Repository ${owner}/${project} not found or is private`),
          );
        } else if (response.statusCode === 403) {
          // Rate limiting - warn but continue
          console.warn(
            'GitHub API rate limit reached, continuing without connectivity check...',
          );
          resolve();
        } else {
          reject(
            new Error(`GitHub API returned status ${response.statusCode}`),
          );
        }
      })
      .on('error', (error) => {
        reject(new Error(`Failed to connect to GitHub: ${error.message}`));
      });
  });
}
