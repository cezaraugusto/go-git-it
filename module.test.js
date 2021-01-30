/* global describe, afterEach, test, expect */
const path = require('path')

const fs = require('fs-extra')
const shell = require('shelljs')

const goGitIt = require('./module')

const repoURL = 'https://github.com/cezaraugusto/node-module-quick-start'
const folderURL = 'https://github.com/cezaraugusto/node-module-quick-start/tree/.github/workflows'
const fileURL = 'https://github.com/cezaraugusto/node-module-quick-start/tree/.github/workflows/ci.yml'
const customPath = path.resolve(__dirname, 'some/extraordinary/folder')

describe('git-some', () => {
  describe('working with directories', () => {
    afterEach(() => {
      shell.rm('-rf', path.resolve(__dirname, path.basename(repoURL)))
      shell.rm('-rf', path.resolve(__dirname, 'some'))
    })
    test('works with repositories', async () => {
      goGitIt(repoURL)

      const pathName = path.resolve(__dirname, path.basename(repoURL))

      expect(await fs.pathExists(pathName)).toBe(true)
    })

    test('using a custom path works with repositories', async () => {
      goGitIt(repoURL, customPath)

      const pathName = path.resolve(customPath, path.basename(repoURL))

      expect(await fs.pathExists(pathName)).toBe(true)
    })
  })

  describe('files', () => {
    afterEach(() => {
      shell.rm('-rf', path.basename(fileURL))
      shell.rm('-rf', path.resolve(__dirname, 'some'))
    })

    test('works with files', async () => {
      goGitIt(fileURL)

      const pathName = path.resolve(process.cwd(), 'ci.yml')

      expect(await fs.pathExists(pathName)).toBe(true)
    })

    test('using a custom path works with files', async () => {
      goGitIt(fileURL, customPath)

      const pathName = path.resolve(customPath, 'ci.yml')

      expect(await fs.pathExists(pathName)).toBe(true)
    })
  })

  describe('folder', () => {
    afterEach(() => {
      shell.rm('-rf', path.resolve(__dirname, 'workflows'))
      shell.rm('-rf', path.resolve(__dirname, 'some'))
    })

    test('works with folders', async () => {
      goGitIt(folderURL)

      const pathName = path.resolve(process.cwd(), 'workflows')

      expect(await fs.pathExists(pathName)).toBe(true)
    })

    test('using a custom path works with folders', async () => {
      goGitIt(folderURL, customPath)

      const pathName = path.resolve(customPath, 'workflows')

      expect(await fs.pathExists(pathName)).toBe(true)
    })
  })
})
