import path from "path";
import fs from "fs";
import { exec as execCallback } from "child_process";
import util from "util";
import pullSource from "./pullSource";

const exec = util.promisify(execCallback);
const mkdir = util.promisify(fs.mkdir);
const writeFile = util.promisify(fs.writeFile);

export default async function downloadPartialRepo(
  outputDirectory: string,
  { owner, project, filePath, branch }: any
) {
  const tempDownloadName = ".go-git-it-temp-folder";
  const tempDownloadPath = path.join(outputDirectory, tempDownloadName);

  await mkdir(tempDownloadPath, { recursive: true });
  process.chdir(tempDownloadPath);

  await exec("git init --quiet");
  await exec(`git remote add origin https://github.com/${owner}/${project}`);

  await exec("git config core.sparseCheckout true");

  const isFile = filePath.includes(".");
  const sparsePath = isFile ? filePath : `${filePath}/*`;
  await writeFile(".git/info/sparse-checkout", sparsePath);

  try {
    await exec(pullSource(branch));
    await exec(`mv ${filePath} ${path.dirname(tempDownloadPath)}`);
  } catch (error) {
    console.error("\nError pulling git repository:", error);
    process.exit(1);
  } finally {
    process.chdir("..");
    await exec(`rm -rf ${tempDownloadName}`);
  }
}
