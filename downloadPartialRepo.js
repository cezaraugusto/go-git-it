const path = require('path')
const fs = require('fs')
const shell = require('shelljs')

function downloadPartialRepo (outputDirectory, options) {
  const {owner, project, filePath, branch} = options

  // Use sparse checkout to grab contents of a specific folder
  const tempDownloadName = '.go-git-it-temp-folder'

  // Create a temp directory to add a git repo. This is needed
  // so we can have the right config when pulling data, as we only
  // want the specific folder path defined by user.
  shell.mkdir('-p', path.join(outputDirectory, tempDownloadName))
  shell.cd(path.join(outputDirectory, tempDownloadName))

  // Start git
  shell.exec('git init --quiet')

  // Add sparse checkout to git so we can download specific files only
  shell.exec(`git remote add origin https://github.com/${owner}/${project}`)
  shell.exec('git config core.sparsecheckout true')

  // Assume a dot in the filePath means a file and not a folder
  const sparsePath = filePath.includes('.') ? filePath : `${filePath}/*`;

  // Write to git the asset path user is trying to download
  shell.exec(`echo "${sparsePath}" >> .git/info/sparse-checkout`)

  // Pull data
  const pullExit = shell.exec(`git pull origin --quiet ${branch} --depth 1`)

  const isDirectory = fs.lstatSync(filePath).isDirectory()
  // If folder, move assets to the final output directory
  if (isDirectory) {
    shell.cd(filePath)
    shell.cd('..')
    shell.mv(path.basename(filePath), outputDirectory)
  // Otherwise just move the file as-is
  } else {
    shell.mv(filePath, outputDirectory)
  }

  // Go back to root directory so we can delete the temp folder
  shell.cd(outputDirectory)

  // Remove the temp folder
  shell.rm('-rf', path.join(outputDirectory, tempDownloadName))

  if (pullExit.code === 0) {
    const asset = path.basename(filePath)
    const assetType = isDirectory ? 'Folder' : 'File'
    console.log(`
Success! ${assetType} \`${asset}\` downloaded to \`${outputDirectory}\`.
    `)
  }
}

module.exports = downloadPartialRepo
