import path from 'path'
import fs from 'fs'
import util from 'util'
import shell from 'shelljs'
import pullSource from './pullSource'

const exec = util.promisify(shell.exec)

export default async function downloadPartialRepo(
  outputDirectory: string,
  {owner, project, filePath, branch}: any
) {
  // Create a temp directory to add a git repo. This is needed
  // so we can have the right config when pulling data, as we only
  // want the specific folder path defined by user.
  const tempDownloadName = '.go-git-it-temp-folder'

  const tempDownloadPath = path.join(outputDirectory, tempDownloadName)

  shell.mkdir('-p', tempDownloadPath)
  shell.cd(tempDownloadPath)

  await exec('git init --quiet')
  await exec(`git remote add origin https://github.com/${owner}/${project}`)

  await exec('git config core.sparseCheckout true')

  const isFile = filePath.includes('.')
  const sparsePath = isFile ? filePath : `${filePath}/*`
  fs.writeFileSync('.git/info/sparse-checkout', sparsePath)

  try {
    await exec(pullSource(branch))
    shell.mv(filePath, path.dirname(tempDownloadPath))
  } catch (error) {
    console.error('Error pulling git repository:', error)
    process.exit(1)
  } finally {
    shell.cd('..')
    shell.rm('-rf', tempDownloadName)
  }
}
