const NO_BRANCH_FOUND = -1

function getOwner(urlData: string[]) {
  return urlData.slice(1, 3)[0]
}

function getProject(urlData: string[]) {
  return urlData.slice(1, 3)[1]
}

function getFilePath(urlData: string[]) {
  const branch = urlData.findIndex((data) => data === 'tree')

  if (branch !== NO_BRANCH_FOUND) {
    return urlData.slice(5).join('/')
  }

  return urlData.slice(3).join('/')
}

function getBranch(urlData: string[]) {
  const branch = urlData.findIndex((data) => data === 'tree')

  if (branch !== NO_BRANCH_FOUND) {
    return urlData[4]
  }

  // Assume 'main'
  return 'main'
}

export {getOwner, getProject, getFilePath, getBranch}
