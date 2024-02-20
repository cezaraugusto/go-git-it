import path from 'path'
import util from 'util'
import shell from 'shelljs'
import pullSource from './pullSource'

const exec = util.promisify(shell.exec)

interface DownloadMainRepo {
  owner: string
  project: string
}

export default async function downloadMainRepo(
  outputDirectory: string,
  {owner, project}: DownloadMainRepo
) {
  const projectPath = path.join(outputDirectory, project)
  shell.mkdir('-p', projectPath)
  shell.cd(projectPath)
  await exec('git init --quiet')
  await exec(`git remote add origin https://github.com/${owner}/${project}`)

  // Try to pull from 'main' first, then fallback to 'master'
  const branches = ['main', 'master']
  let success = false

  for (const branch of branches) {
    try {
      await exec(pullSource(branch))
      success = true
      console.log(`Successfully pulled from branch '${branch}'.`)
      break // Exit the loop on success
    } catch (error) {
      console.log(
        `Failed to pull using branch '${branch}'. Trying next option...`
      )
    }
  }

  if (!success) {
    console.error(
      'Error: Could not determine the default branch or failed to pull from it.'
    )
    process.exit(1)
  }

  // Clean up .git directory
  shell.rm('-rf', '.git')
}
