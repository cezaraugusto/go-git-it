const path = require('path')
const fs = require('fs')
const shell = require('shelljs')
const pullSource = require('./pullSource')

function downloadPartialRepo (outputDirectory, options) {
  const {owner, project, filePath, branch} = options

  // Use sparse checkout to grab contents of a specific folders
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
  shell.exec(`echo ${sparsePath} >> .git/info/sparse-checkout`)

  // User is in the project root directory, try pulling from `main`
  shell.exec(pullSource(branch))

  // Nothing added on `main`, try the old `master`
  const pullExit = shell.exec(pullSource(branch))

  const isDirectory = fs.lstatSync(filePath).isDirectory()

  // If folder, move assets to the final output directory
  if (isDirectory) {
    shell.mv(filePath, '..')
  // Otherwise just move the file as-is
  } else {
    shell.mv(filePath, outputDirectory)
  }

  // Go back to root directory so we can delete the temp folder
  shell.cd('..')

  // Remove the temp folder
  shell.rm('-rf', tempDownloadName)

  // Git data pull failed
  if (pullExit.code !== 0) {
  // Nothing added. We need a branch so we exit with error
  const errorMessage =
    'No branch found. Ensure the remote branch you are pulling exists.\n' +
    'If you think this is a bug, please report to' +
    'https://github.com/cezaraugusto/go-git-it/issues.\n' +
    'Error: ' + pullExit.stderr

    console.log(errorMessage)
    process.exit(pullExit.code)
  // All good, project downloaded
  } else {
    const asset = path.basename(filePath)
    const assetType = isDirectory ? 'Folder' : 'File'
    console.log(`
Success! ${assetType} \`${asset}\` downloaded to \`${outputDirectory}\`.
    `)
  }
}

module.exports = downloadPartialRepo
