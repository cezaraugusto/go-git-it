import path from "path";
import fs from "fs";
import { exec as execCallback } from "child_process";
import util from "util";
import pullSource from "./pullSource";

const exec = util.promisify(execCallback);
const mkdir = util.promisify(fs.mkdir);

interface DownloadMainRepo {
  owner: string;
  project: string;
}

export default async function downloadMainRepo(
  outputDirectory: string,
  { owner, project }: DownloadMainRepo,
) {
  const projectPath = path.join(outputDirectory, project);

  await mkdir(projectPath, { recursive: true });

  // Execute git commands in the project directory
  await exec("git init --quiet", { cwd: projectPath });
  await exec(`git remote add origin https://github.com/${owner}/${project}`, {
    cwd: projectPath,
  });

  // Try to pull from 'main' first, then fallback to 'master'
  const branches = ["main", "master"];
  let success = false;

  for (const branch of branches) {
    try {
      await exec(pullSource(branch), { cwd: projectPath });
      success = true;
      break; // Exit the loop on success
    } catch (error) {
      console.log(
        `Failed to pull using branch '${branch}'. Trying next option...`,
      );
    }
  }

  if (!success) {
    console.error(
      "Error: Could not determine the default branch or failed to pull from it.",
    );
    process.exit(1);
  }

  // Clean up .git directory
  await exec(`rm -rf .git`, { cwd: projectPath });
}
