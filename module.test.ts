import { describe, afterEach, test, expect } from 'vitest';
import path from 'path';
import { promises as fs } from 'fs';
import goGitIt from './src/index.js';

const repoURL = 'https://github.com/extension-js/extension.js';
const folderURL =
  'https://github.com/extension-js/extension.js/tree/main/templates/react/images';
const fileURL =
  'https://github.com/extension-js/extension.js/blob/main/templates/react/manifest.json';
const customPath = path.resolve(__dirname, 'some/extraordinary/folder');

describe('go-git-it', () => {
  describe('working with full URLs', () => {
    afterEach(async () => {
      // Git clone behavior: creates 'extension.js' folder in current directory
      const repoPath = path.resolve(__dirname, 'extension.js');
      const customRepoPath = path.resolve(__dirname, 'my-browser-extension');
      const somePath = path.resolve(__dirname, 'some');

      try {
        await fs.rm(repoPath, { recursive: true, force: true });
      } catch {
        // Ignore if file doesn't exist
      }
      try {
        await fs.rm(customRepoPath, { recursive: true, force: true });
      } catch {
        // Ignore if file doesn't exist
      }
      try {
        await fs.rm(somePath, { recursive: true, force: true });
      } catch {
        // Ignore if file doesn't exist
      }
    });

    test('works with default path (git clone behavior)', async () => {
      await goGitIt(repoURL);
      // Should create 'extension.js' folder in current directory (like git clone)
      const pathName = path.resolve(__dirname, 'extension.js');
      await expect(fs.access(pathName)).resolves.not.toThrow();
    });

    test('works with custom directory name (git clone behavior)', async () => {
      await goGitIt(repoURL, './my-browser-extension');
      // Should create 'extension.js' folder inside 'my-browser-extension' directory (like git clone)
      const pathName = path.resolve(
        __dirname,
        'my-browser-extension',
        'extension.js',
      );
      await expect(fs.access(pathName)).resolves.not.toThrow();
    });
  });

  describe('working with partial URLs (basename is file)', () => {
    afterEach(async () => {
      const filePath = path.resolve(__dirname, 'manifest.json');
      const customFilePath = path.resolve(customPath, 'manifest.json');
      const somePath = path.resolve(__dirname, 'some');

      try {
        await fs.rm(filePath, { recursive: true, force: true });
      } catch {
        // Ignore if file doesn't exist
      }
      try {
        await fs.rm(customFilePath, { recursive: true, force: true });
      } catch {
        // Ignore if file doesn't exist
      }
      try {
        await fs.rm(somePath, { recursive: true, force: true });
      } catch {
        // Ignore if file doesn't exist
      }
    });

    test('works with default path', async () => {
      await goGitIt(fileURL);
      const pathName = path.resolve(__dirname, 'manifest.json');
      await expect(fs.access(pathName)).resolves.not.toThrow();
    });

    test('works with a custom path', async () => {
      await goGitIt(fileURL, customPath);
      const pathName = path.resolve(customPath, 'manifest.json');
      await expect(fs.access(pathName)).resolves.not.toThrow();
    });
  });

  describe('working with partial URLs (basename is folder)', () => {
    afterEach(async () => {
      const imagesPath = path.resolve(__dirname, 'images');
      const customImagesPath = path.resolve(customPath, 'images');
      const somePath = path.resolve(__dirname, 'some');

      try {
        await fs.rm(imagesPath, { recursive: true, force: true });
      } catch {
        // Ignore if file doesn't exist
      }
      try {
        await fs.rm(customImagesPath, { recursive: true, force: true });
      } catch {
        // Ignore if file doesn't exist
      }
      try {
        await fs.rm(somePath, { recursive: true, force: true });
      } catch {
        // Ignore if file doesn't exist
      }
    });

    test('works with default path', async () => {
      await goGitIt(folderURL);
      const pathName = path.resolve(__dirname, 'images');
      await expect(fs.access(pathName)).resolves.not.toThrow();
    });

    test('works with a custom path', async () => {
      await goGitIt(folderURL, customPath);
      const pathName = path.resolve(customPath, 'images');
      await expect(fs.access(pathName)).resolves.not.toThrow();
    });
  });
});
