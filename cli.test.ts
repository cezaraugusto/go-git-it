import { describe, afterEach, test, expect, vi } from 'vitest';
import path from 'path';
import { pathToFileURL } from 'url';
import cli, { shouldRunAsCli } from './src/cli.js';

const originalArgv = process.argv;

function setArgv(args: string[]) {
  process.argv = ['node', 'go-git-it', ...args];
}

describe('cli', () => {
  afterEach(() => {
    process.argv = originalArgv;
    vi.restoreAllMocks();
  });

  test('prints help and exits with code 0', () => {
    setArgv([]);

    const exitMock = vi
      .spyOn(process, 'exit')
      .mockImplementation(((code?: number) => {
        throw new Error(`process.exit:${code ?? 0}`);
      }) as never);
    const logMock = vi.spyOn(console, 'log').mockImplementation(() => {});

    expect(() => cli(async () => {})).toThrow('process.exit:0');
    expect(exitMock).toHaveBeenCalledWith(0);
    expect(logMock).toHaveBeenCalled();
  });

  test('rejects invalid argument counts', () => {
    setArgv(['one', 'two', 'three']);

    const exitMock = vi
      .spyOn(process, 'exit')
      .mockImplementation(((code?: number) => {
        throw new Error(`process.exit:${code ?? 0}`);
      }) as never);
    const errorMock = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => cli(async () => {})).toThrow('process.exit:1');
    expect(exitMock).toHaveBeenCalledWith(1);
    expect(errorMock).toHaveBeenCalled();
  });

  test('invokes goGitIt with provided arguments', async () => {
    setArgv(['https://github.com/owner/repo', './out']);

    const exitMock = vi.spyOn(process, 'exit');
    const goGitIt = vi.fn().mockResolvedValue(undefined);

    cli(goGitIt);
    await Promise.resolve();

    expect(goGitIt).toHaveBeenCalledWith(
      'https://github.com/owner/repo',
      './out',
    );
    expect(exitMock).not.toHaveBeenCalled();
  });

  test('prints error and exits on failure', async () => {
    setArgv(['https://github.com/owner/repo']);

    const exitMock = vi
      .spyOn(process, 'exit')
      .mockImplementation((() => undefined) as never);
    const errorMock = vi.spyOn(console, 'error').mockImplementation(() => {});

    const goGitIt = vi.fn().mockRejectedValue(new Error('boom'));

    cli(goGitIt);
    await new Promise<void>((resolve) => {
      setImmediate(resolve);
    });

    expect(exitMock).toHaveBeenCalledWith(1);
    expect(errorMock).toHaveBeenCalled();
  });
});

describe('shouldRunAsCli', () => {
  test('returns true for direct absolute entry path', () => {
    const entryPath = path.join(process.cwd(), 'dist', 'index.js');
    const importMetaUrl = pathToFileURL(entryPath).href;

    expect(shouldRunAsCli(importMetaUrl, entryPath)).toBe(true);
  });

  test('returns true for relative entry path', () => {
    const entryPath = path.join(process.cwd(), 'dist', 'index.js');
    const importMetaUrl = pathToFileURL(entryPath).href;
    const relativePath = path.relative(process.cwd(), entryPath);

    expect(shouldRunAsCli(importMetaUrl, relativePath)).toBe(true);
  });

  test('returns true for binary name', () => {
    const importMetaUrl = pathToFileURL('/tmp/fake/index.js').href;

    expect(shouldRunAsCli(importMetaUrl, 'go-git-it')).toBe(true);
  });

  test('returns false for unrelated argv1', () => {
    const importMetaUrl = pathToFileURL('/tmp/fake/index.js').href;

    expect(shouldRunAsCli(importMetaUrl, '/usr/bin/node')).toBe(false);
  });

  test('returns false when argv1 is missing', () => {
    const importMetaUrl = pathToFileURL('/tmp/fake/index.js').href;

    expect(shouldRunAsCli(importMetaUrl, undefined)).toBe(false);
  });
});
