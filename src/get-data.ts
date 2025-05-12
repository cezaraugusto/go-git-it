const NO_BRANCH_FOUND = -1;

export function getOwner(urlData: string[]) {
  return urlData[1];
}

export function getProject(urlData: string[]) {
  return urlData[2];
}

export function getFilePath(urlData: string[]) {
  const branchIndex = urlData.findIndex(
    (data) => data === 'blob' || data === 'tree',
  );

  if (branchIndex !== NO_BRANCH_FOUND) {
    return urlData.slice(branchIndex + 2).join('/');
  }

  return urlData.slice(3).join('/');
}

export function getBranch(urlData: string[]) {
  const branchIndex = urlData.findIndex(
    (data) => data === 'blob' || data === 'tree',
  );

  if (branchIndex !== NO_BRANCH_FOUND) {
    return urlData[branchIndex + 1];
  }

  // Assume 'main'
  return 'main';
}
