/* global describe, afterEach, test, expect */
const path = require('path')

const fs = require('fs-extra')
const shell = require('shelljs')

const goGitIt = require('./module')

const repoURL = 'https://github.com/cezaraugusto/extension-create'
const folderURL = 'https://github.com/cezaraugusto/extension-create/tree/main/create'
const fileURL = 'https://github.com/cezaraugusto/extension-create/tree/main/create/cli.js'
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

      const pathName = path.resolve(process.cwd(), 'cli.js')

      expect(await fs.pathExists(pathName)).toBe(true)
    })

    test('using a custom path works with files', async () => {
      goGitIt(fileURL, customPath)

      const pathName = path.resolve(customPath, 'cli.js')

      expect(await fs.pathExists(pathName)).toBe(true)
    })
  })

  describe('folder', () => {
    afterEach(() => {
      shell.rm('-rf', path.resolve(__dirname, 'create'))
      shell.rm('-rf', path.resolve(__dirname, 'some'))
    })

    test('works with folders', async () => {
      goGitIt(folderURL)

      const pathName = path.resolve(process.cwd(), 'create')

      expect(await fs.pathExists(pathName)).toBe(true)
    })

    test('using a custom path works with folders', async () => {
      goGitIt(folderURL, customPath)

      const pathName = path.resolve(customPath, 'create')

      expect(await fs.pathExists(pathName)).toBe(true)
    })
  })
})
