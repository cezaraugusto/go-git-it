import { describe, afterEach, test, expect } from 'vitest';
import path from 'path';
import { promises as fs } from 'fs';
import goGitIt from './dist/index.js';

const repoURL = 'https://github.com/lodash/lodash';
const folderURL = 'https://github.com/lodash/lodash/tree/main/lib';
const fileURL = 'https://github.com/lodash/lodash/blob/main/lib/common/file.js';
const customPath = path.resolve(__dirname, 'some/extraordinary/folder');

describe('go-git-it', () => {
  describe('working with full URLs', () => {
    afterEach(async () => {
      const repoPath = path.resolve(__dirname, path.basename(repoURL));
      const somePath = path.resolve(__dirname, 'some');

      try {
        await fs.rm(repoPath, { recursive: true, force: true });
      } catch (error) {
        // Ignore if file doesn't exist
      }
      try {
        await fs.rm(somePath, { recursive: true, force: true });
      } catch (error) {
        // Ignore if file doesn't exist
      }
    });

    test('works with default path', async () => {
      await goGitIt(repoURL);
      const pathName = path.resolve(__dirname, path.basename(repoURL));
      await expect(fs.access(pathName)).resolves.not.toThrow();
    });

    test('works with a custom path', async () => {
      await goGitIt(repoURL, customPath);
      const pathName = path.resolve(customPath, path.basename(repoURL));
      await expect(fs.access(pathName)).resolves.not.toThrow();
    });
  });

  describe('working with partial URLs (basename is file)', () => {
    afterEach(async () => {
      const filePath = path.resolve(process.cwd(), path.basename(fileURL));
      const somePath = path.resolve(__dirname, 'some');

      try {
        await fs.rm(filePath, { recursive: true, force: true });
      } catch (error) {
        // Ignore if file doesn't exist
      }
      try {
        await fs.rm(somePath, { recursive: true, force: true });
      } catch (error) {
        // Ignore if file doesn't exist
      }
    });

    test('works with default path', async () => {
      await goGitIt(fileURL);
      const pathName = path.resolve(process.cwd(), 'file.js');
      await expect(fs.access(pathName)).resolves.not.toThrow();
    });

    test('works with a custom path', async () => {
      await goGitIt(fileURL, customPath);
      const pathName = path.resolve(customPath, 'file.js');
      await expect(fs.access(pathName)).resolves.not.toThrow();
    });
  });

  describe('working with partial URLs (basename is folder)', () => {
    afterEach(async () => {
      const libPath = path.resolve(process.cwd(), 'lib');
      const somePath = path.resolve(__dirname, 'some');

      try {
        await fs.rm(libPath, { recursive: true, force: true });
      } catch (error) {
        // Ignore if file doesn't exist
      }
      try {
        await fs.rm(somePath, { recursive: true, force: true });
      } catch (error) {
        // Ignore if file doesn't exist
      }
    });

    test('works with default path', async () => {
      await goGitIt(folderURL);
      const pathName = path.resolve(process.cwd(), 'lib');
      await expect(fs.access(pathName)).resolves.not.toThrow();
    });

    test('works with a custom path', async () => {
      await goGitIt(folderURL, customPath);
      const pathName = path.resolve(customPath, 'lib');
      await expect(fs.access(pathName)).resolves.not.toThrow();
    });
  });
});
