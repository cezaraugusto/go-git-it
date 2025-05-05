#!/usr/bin/env node

import { yellow, blue, underline } from "@colors/colors/safe";
import * as getData from "./get-data";
import addProgressBar from "./add-progress-bar";
import downloadMainRepo from "./download-main-repo";
import downloadPartialRepo from "./download-partial-repo";
import cli from "./cli";

async function cloneRemote(
  outputDirectory: string,
  options: {
    filePath: string;
    owner: string;
    project: string;
    isMainRepo: boolean;
    branch: string;
  },
) {
  const { owner, project, isMainRepo } = options;

  if (isMainRepo) {
    await downloadMainRepo(outputDirectory, { owner, project });
  } else {
    await downloadPartialRepo(outputDirectory, options);
  }
}

async function goGitIt(
  gitURL: string,
  outputDirectory?: string,
  text?: string,
) {
  const urlData = new URL(gitURL).pathname.split("/");
  const remoteInfo = {
    owner: getData.getOwner(urlData),
    project: getData.getProject(urlData),
    filePath: getData.getFilePath(urlData),
    branch: getData.getBranch(urlData),
  };

  const filePath = remoteInfo.filePath || remoteInfo.project;
  const isMainRepo = filePath === remoteInfo.project;

  // Output directory defaults to working directory
  const outDir = outputDirectory || process.cwd();
  const remoteSource = `@${remoteInfo.owner}/${remoteInfo.project} `;
  await addProgressBar(
    text || `Downloading ${yellow(filePath)} from ${blue(remoteSource)}`,
    async () => {
      await cloneRemote(outDir, { ...remoteInfo, filePath, isMainRepo });
    },
  );

  if (!text) {
    console.log(
      `Success! Data downloaded to ${underline(outDir + "/" + filePath)}`,
    );
  }
}

// Execute CLI if requested
if (import.meta.url === `file://${process.argv[1]}`) {
  cli(goGitIt);
}

// Export as a node module as well
export default goGitIt;
