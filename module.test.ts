import { describe, afterEach, test, expect } from "vitest";
import path from "path";
import fs from "fs-extra";
import shell from "shelljs";
import goGitIt from "./dist/module";

const repoURL = "https://github.com/lodash/lodash";
const folderURL = "https://github.com/lodash/lodash/tree/main/lib";
const fileURL = "https://github.com/lodash/lodash/blob/main/lib/common/file.js";
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
      expect(await fs.pathExists(pathName)).toBe(true);
    });

    test("works with a custom path", async () => {
      await goGitIt(repoURL, customPath);
      const pathName = path.resolve(customPath, path.basename(repoURL));
      expect(await fs.pathExists(pathName)).toBe(true);
    });
  });

  describe("working with partial URLs (basename is file)", () => {
    afterEach(() => {
      shell.rm("-rf", path.basename(fileURL));
      shell.rm("-rf", path.resolve(__dirname, "some"));
    });

    test("works with default path", async () => {
      await goGitIt(fileURL);
      const pathName = path.resolve(process.cwd(), "file.js");
      expect(await fs.pathExists(pathName)).toBe(true);
    });

    test("works with a custom path", async () => {
      await goGitIt(fileURL, customPath);
      const pathName = path.resolve(customPath, "file.js");
      expect(await fs.pathExists(pathName)).toBe(true);
    });
  });

  describe("working with partial URLs (basename is folder)", () => {
    afterEach(() => {
      shell.rm("-rf", path.resolve(__dirname, "lib"));
      shell.rm("-rf", path.resolve(__dirname, "some"));
    });

    test("works with default path", async () => {
      await goGitIt(folderURL);
      const pathName = path.resolve(process.cwd(), "lib");
      expect(await fs.pathExists(pathName)).toBe(true);
    });

    test("works with a custom path", async () => {
      await goGitIt(folderURL, customPath);
      const pathName = path.resolve(customPath, "lib");
      expect(await fs.pathExists(pathName)).toBe(true);
    });
  });
});
