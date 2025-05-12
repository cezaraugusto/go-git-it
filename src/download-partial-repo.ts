import path from 'path';
import fs from 'fs';
import { exec as execCallback } from 'child_process';
import util from 'util';
import pullSource from '../pullSource';

const exec = util.promisify(execCallback);
const mkdir = util.promisify(fs.mkdir);
const writeFile = util.promisify(fs.writeFile);
const rm = util.promisify(fs.rm);
const rename = util.promisify(fs.rename);

export default async function downloadPartialRepo(
  outputDirectory: string,
  {
    owner,
    project,
    filePath,
    branch,
  }: { owner: string; project: string; filePath: string; branch: string },
) {
  const tempDownloadName = '.go-git-it-temp-folder';
  const tempDownloadPath = path.join(outputDirectory, tempDownloadName);

  // Check and remove any existing .go-git-it-temp-folder
  if (fs.existsSync(tempDownloadPath)) {
    console.log(`Removing existing ${tempDownloadName}...`);
    await rm(tempDownloadPath, { recursive: true, force: true });
  }

  await mkdir(tempDownloadPath, { recursive: true });

  await exec('git init --quiet', { cwd: tempDownloadPath });
  await exec(`git remote add origin https://github.com/${owner}/${project}`, {
    cwd: tempDownloadPath,
  });

  await exec('git config core.sparseCheckout true', { cwd: tempDownloadPath });

  const isFile = path.extname(filePath) !== '';
  const sparsePath = isFile ? filePath : `${filePath}/*`;
  await writeFile(
    path.join(tempDownloadPath, '.git/info/sparse-checkout'),
    sparsePath,
  );

  try {
    await exec(pullSource(branch), { cwd: tempDownloadPath });
    const destinationPath = path.join(outputDirectory, path.basename(filePath));
    await rename(path.join(tempDownloadPath, filePath), destinationPath);
  } catch (error) {
    console.error('Error pulling git repository:', error);
    process.exit(1);
  } finally {
    if (fs.existsSync(tempDownloadPath)) {
      await rm(tempDownloadPath, { recursive: true, force: true });
    }
  }
}
