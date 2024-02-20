/* global describe, afterEach, test, expect */
const path = require('path')
const fs = require('fs-extra')
const shell = require('shelljs')

const goGitIt = require('./dist/module').default

const repoURL = 'https://github.com/cezaraugusto/extension-create'
const folderURL =
  'https://github.com/cezaraugusto/extension-create/tree/main/packages'
const fileURL =
  'https://github.com/cezaraugusto/extension-create/tree/main/package.json'
const customPath = path.resolve(__dirname, 'some/extraordinary/folder')

describe('go-git-it', () => {
  describe('working with full URLs', () => {
    afterEach(() => {
      shell.rm('-rf', path.resolve(__dirname, path.basename(repoURL)))
      shell.rm('-rf', path.resolve(__dirname, 'some'))
    })
    test('works with default path', async () => {
      await goGitIt(repoURL)

      const pathName = path.resolve(__dirname, path.basename(repoURL))

      expect(await fs.pathExists(pathName)).toBe(true)
    })

    test('works with a custom path', async () => {
      await goGitIt(repoURL, customPath)

      const pathName = path.resolve(customPath, path.basename(repoURL))

      expect(await fs.pathExists(pathName)).toBe(true)
    })
  })

  describe('working with partial URLs (basename is file)', () => {
    afterEach(() => {
      shell.rm('-rf', path.basename(fileURL))
      shell.rm('-rf', path.resolve(__dirname, 'some'))
    })

    test('works with default path', async () => {
      await goGitIt(fileURL)

      const pathName = path.resolve(process.cwd(), 'package.json')

      expect(await fs.pathExists(pathName)).toBe(true)
    })

    test('works with a custom path', async () => {
      await goGitIt(fileURL, customPath)

      const pathName = path.resolve(customPath, 'package.json')

      expect(await fs.pathExists(pathName)).toBe(true)
    })
  })

  describe('working with partial URLs (basename is folder)', () => {
    afterEach(() => {
      shell.rm('-rf', path.resolve(__dirname, 'packages'))
      shell.rm('-rf', path.resolve(__dirname, 'some'))
    })

    test('works with default path', async () => {
      await goGitIt(folderURL)

      const pathName = path.resolve(process.cwd(), 'packages')

      expect(await fs.pathExists(pathName)).toBe(true)
    })

    test('works with a custom path', async () => {
      await goGitIt(folderURL, customPath)

      const pathName = path.resolve(customPath, 'packages')

      expect(await fs.pathExists(pathName)).toBe(true)
    })
  })
})
