/* global describe, afterEach, test, expect */
const path = require("path");
const fs = require("fs-extra");
const shell = require("shelljs");

const goGitIt = require("./dist/module").default;

const repoURL = "https://github.com/lodash/lodash";
const folderURL = "https://github.com/lodash/lodash/blob/main/src";
const fileURL = "https://github.com/lodash/lodash/blob/main/src/add.ts";
const customPath = path.resolve(__dirname, "some/extraordinary/folder");

describe("go-git-it", () => {
  describe("working with full URLs", () => {
    afterEach(() => {
      shell.rm("-rf", path.resolve(__dirname, path.basename(repoURL)));
      shell.rm("-rf", path.resolve(__dirname, "some"));
    });

    test("works with default path", async () => {
      await goGitIt(repoURL);

      const pathName = path.resolve(__dirname, path.basename(repoURL));
      const addFilePath = path.resolve(pathName, "src/add.ts");

      expect(await fs.pathExists(pathName)).toBe(true);
      expect(await fs.pathExists(addFilePath)).toBe(true);
    });

    test("works with a custom path", async () => {
      await goGitIt(repoURL, customPath);

      const pathName = path.resolve(customPath, path.basename(repoURL));
      const addFilePath = path.resolve(pathName, "src/add.ts");

      expect(await fs.pathExists(pathName)).toBe(true);
      expect(await fs.pathExists(addFilePath)).toBe(true);
    });
  });

  describe("working with partial URLs (basename is file)", () => {
    afterEach(() => {
      shell.rm("-rf", path.basename(fileURL));
      shell.rm("-rf", path.resolve(__dirname, "some"));
    });

    test("works with default path", async () => {
      await goGitIt(fileURL);

      const pathName = path.resolve(process.cwd(), "add.ts");

      expect(await fs.pathExists(pathName)).toBe(true);
    });

    test("works with a custom path", async () => {
      await goGitIt(fileURL, customPath);

      const pathName = path.resolve(customPath, "add.ts");

      expect(await fs.pathExists(pathName)).toBe(true);
    });
  });

  describe("working with partial URLs (basename is folder)", () => {
    afterEach(() => {
      shell.rm("-rf", path.resolve(__dirname, "src"));
      shell.rm("-rf", path.resolve(__dirname, "some"));
    });

    test("works with default path", async () => {
      await goGitIt(folderURL);

      const pathName = path.resolve(process.cwd(), "src");
      const addFilePath = path.resolve(pathName, "add.ts");

      expect(await fs.pathExists(pathName)).toBe(true);
      expect(await fs.pathExists(addFilePath)).toBe(true);
    });

    test("works with a custom path", async () => {
      await goGitIt(folderURL, customPath);

      const pathName = path.resolve(customPath, "src");
      const addFilePath = path.resolve(pathName, "add.ts");

      expect(await fs.pathExists(pathName)).toBe(true);
      expect(await fs.pathExists(addFilePath)).toBe(true);
    });
  });
});
