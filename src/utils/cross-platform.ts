import { exec as execCallback } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';

const exec = promisify(execCallback);

export function generateTempDirName(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `.go-git-it-temp-${timestamp}-${random}`;
}

export async function removeDirectory(dirPath: string): Promise<void> {
  try {
    await fs.rm(dirPath, { recursive: true, force: true });
  } catch (error) {
    // Fallback for older Node.js versions or permission issues
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      return; // Directory doesn't exist, nothing to remove
    }
    throw error;
  }
}

export async function cleanupGitDirectory(repoPath: string): Promise<void> {
  const gitPath = path.join(repoPath, '.git');
  try {
    await removeDirectory(gitPath);
  } catch (error) {
    console.warn(`Warning: Could not remove .git directory: ${error}`);
  }
}

export async function createDirectory(dirPath: string): Promise<void> {
  try {
    await fs.mkdir(dirPath, { recursive: true });
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'EEXIST') {
      return; // Directory already exists
    }
    throw error;
  }
}

export async function pathExists(targetPath: string): Promise<boolean> {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

export async function moveFileOrDirectory(
  source: string,
  destination: string,
): Promise<void> {
  try {
    await fs.rename(source, destination);
  } catch (error) {
    // If rename fails (cross-device), try copy + remove
    if (error instanceof Error && 'code' in error && error.code === 'EXDEV') {
      await fs.cp(source, destination, { recursive: true });
      await removeDirectory(source);
    } else {
      throw error;
    }
  }
}

export async function executeGitCommand(
  command: string,
  options: { cwd: string; timeout?: number } = { cwd: process.cwd() },
): Promise<string> {
  const { cwd, timeout = 30000 } = options;

  try {
    const { stdout, stderr } = await exec(command, {
      cwd,
      timeout,
      env: { ...process.env, GIT_TERMINAL_PROMPT: '0' }, // Disable interactive prompts
    });

    if (stderr && !stderr.includes('warning:')) {
      console.warn(`Git warning: ${stderr}`);
    }

    return stdout;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(
        `Git command failed: ${command}\nError: ${error.message}`,
      );
    }
    throw error;
  }
}

export async function cleanupTempDirectory(
  tempPath: string,
  maxRetries: number = 3,
): Promise<void> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      if (await pathExists(tempPath)) {
        await removeDirectory(tempPath);
      }
      return;
    } catch {
      if (attempt === maxRetries) {
        console.warn(
          `Warning: Could not remove temporary directory after ${maxRetries} attempts: ${tempPath}`,
        );
      } else {
        // Wait a bit before retrying (helps with Windows file locking)
        await new Promise((resolve) => setTimeout(resolve, 100 * attempt));
      }
    }
  }
}
