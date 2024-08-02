const NO_BRANCH_FOUND = -1;

function getOwner(urlData: string[]) {
  return urlData[1];
}

function getProject(urlData: string[]) {
  return urlData[2];
}

function getFilePath(urlData: string[]) {
  const branchIndex = urlData.findIndex(
    (data) => data === "blob" || data === "tree"
  );

  if (branchIndex !== NO_BRANCH_FOUND) {
    return urlData.slice(branchIndex + 2).join("/");
  }

  return urlData.slice(3).join("/");
}

function getBranch(urlData: string[]) {
  const branchIndex = urlData.findIndex(
    (data) => data === "blob" || data === "tree"
  );

  if (branchIndex !== NO_BRANCH_FOUND) {
    return urlData[branchIndex + 1];
  }

  // Assume 'main'
  return "main";
}

export { getOwner, getProject, getFilePath, getBranch };
