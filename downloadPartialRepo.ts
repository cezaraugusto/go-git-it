import path from "path";
import fs from "fs";
import { exec as execCallback } from "child_process";
import util from "util";
import pullSource from "./pullSource";

const exec = util.promisify(execCallback);
const mkdir = util.promisify(fs.mkdir);
const writeFile = util.promisify(fs.writeFile);
const rm = util.promisify(fs.rm);

export default async function downloadPartialRepo(
  outputDirectory: string,
  {
    owner,
    project,
    filePath,
    branch,
  }: { owner: string; project: string; filePath: string; branch: string }
) {
  const tempDownloadName = ".go-git-it-temp-folder";
  const tempDownloadPath = path.join(outputDirectory, tempDownloadName);

  // Check and remove any existing .go-git-it-temp-folder
  if (fs.existsSync(tempDownloadPath)) {
    console.log(`Removing existing ${tempDownloadName}...`);
    await rm(tempDownloadPath, { recursive: true, force: true });
  }

  await mkdir(tempDownloadPath, { recursive: true });
  process.chdir(tempDownloadPath);

  await exec("git init --quiet");
  await exec(`git remote add origin https://github.com/${owner}/${project}`);

  await exec("git config core.sparseCheckout true");

  const isFile = path.extname(filePath) !== "";
  const sparsePath = isFile ? filePath : `${filePath}/*`;
  await writeFile(".git/info/sparse-checkout", sparsePath);

  try {
    await exec(pullSource(branch));
    const destinationPath = path.join(outputDirectory, path.basename(filePath));
    await exec(`mv ${filePath} ${destinationPath}`);
  } catch (error) {
    console.error("\nError pulling git repository:", error);
    process.exit(1);
  } finally {
    process.chdir(outputDirectory);
    await exec(`rm -rf ${tempDownloadName}`);
  }
}
