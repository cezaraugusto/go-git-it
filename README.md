[action-image]: https://github.com/cezaraugusto/go-git-it/workflows/CI/badge.svg
[action-url]: https://github.com/cezaraugusto/go-git-it/actions
[npm-image]: https://img.shields.io/npm/v/go-git-it.svg
[npm-url]: https://npmjs.org/package/go-git-it
[npm-bundle-image]: https://img.shields.io/bundlephobia/min/go-git-it
[npm-bundle-url]: https://npmjs.org/package/go-git-it
[npm-downloads-image]: https://img.shields.io/npm/dm/go-git-it
[npm-downloads-url]: https://npmjs.org/package/go-git-it

# go-git-it [![npm][npm-image]][npm-url] [![downloads][npm-downloads-image]][npm-downloads-url] [![size][npm-bundle-image]][npm-bundle-url] [![workflow][action-image]][action-url]

> Download any repository or subdirectory on GitHub with support for Node.js and the CLI

```
npx go-git-it <url> [outputDir]
```

<img alt="Command line instructions" src="https://user-images.githubusercontent.com/4672033/103392334-0faad500-4afc-11eb-9539-452acec62dce.gif" />

**Use cases**

```sh
# cwd is ~/mydevspace/

npx go-git-it https://github.com/username/repository
# copied remote content to ~/mydevspace/repository

npx go-git-it https://github.com/username/repository/tree/main/folder
# copied remote content to ~/mydevspace/folder

npx go-git-it https://github.com/username/repository/blob/main/folder/file.js
# copied remote content to ~/mydevspace/file.js
```

**The second command argument is the output directory:**

```sh
npx go-git-it https://github.com/username/repository path/to/outputDir
# copied remote content to path/to/outputDir/repository
```

## Node interface

`go-git-it` can also run on a Node.js program.

### Installation

```
npm install go-git-it
```

### Usage

```js
import goGitIt from 'go-git-it';

// Assume cwd is ~/mydevspace/

await goGitIt('https://github.com/username/repository');
// copied remote content to ~/mydevspace/repository

await goGitIt('https://github.com/username/repository/tree/main/folder');
// copied remote content to ~/mydevspace/folder

await goGitIt(
  'https://github.com/username/repository/blob/main/folder/file.js',
);
// copied remote content to ~/mydevspace/file.js
```

**The second parameter is the output path:**

```js
import goGitIt from 'go-git-it';

// Assume cwd is ~/mydevspace/

await goGitIt('https://github.com/username/repository', 'path/to/outputDir');
// copied remote content to path/to/outputDir/repository
```

### API

#### goGitIt(url, outputDir?, text?)

##### url

Type: `string`

The URL to the path you want to download. If a folder, will download its content as well.

##### outputDir

Type: `string`

Custom path to the outputDir (defaults to the working directory)

##### text

Type: `string`

Adds a custom text message instead of default config. This option overrides the success message as well.

### Features

- Progress bar showing download status
- Support for downloading entire repositories
- Support for downloading specific folders
- Support for downloading individual files
- Custom output directory support
- Custom progress messages

## License

MIT (c) Cezar Augusto.
