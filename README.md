[npm-version-image]: https://img.shields.io/npm/v/go-git-it.svg?color=0971fe
[npm-version-url]: https://www.npmjs.com/package/go-git-it
[npm-downloads-image]: https://img.shields.io/npm/dm/go-git-it.svg?color=2ecc40
[npm-downloads-url]: https://www.npmjs.com/package/go-git-it
[action-image]: https://github.com/cezaraugusto/go-git-it/actions/workflows/ci.yml/badge.svg?branch=main
[action-url]: https://github.com/cezaraugusto/go-git-it/actions

> Download any repository or subdirectory on GitHub with support for Node.js and the CLI

# go-git-it [![Version][npm-version-image]][npm-version-url] [![Downloads][npm-downloads-image]][npm-downloads-url] [![workflow][action-image]][action-url]

```
npx go-git-it <url> [outputDir]
```

<img alt="Command line instructions" src="https://user-images.githubusercontent.com/4672033/103392334-0faad500-4afc-11eb-9539-452acec62dce.gif" />

**Use cases**

```sh
# cwd is ~/mydevspace/

npx go-git-it https://github.com/extension-js/extension.js
# Creates ~/mydevspace/extension.js/ folder (like git clone)

npx go-git-it https://github.com/extension-js/extension.js/tree/main/templates/react/images
# Creates ~/mydevspace/images/ folder

npx go-git-it https://github.com/extension-js/extension.js/blob/main/templates/react/manifest.json
# Downloads ~/mydevspace/manifest.json
```

**The second command argument is the output directory:**

```sh
npx go-git-it https://github.com/extension-js/extension.js ./my-browser-extension
# Creates ./my-browser-extension/extension.js/ folder (like git clone)
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

await goGitIt('https://github.com/extension-js/extension.js');
// Creates ~/mydevspace/extension.js/ folder (like git clone)

await goGitIt(
  'https://github.com/extension-js/extension.js/tree/main/templates/react/images',
);
// Creates ~/mydevspace/images/ folder

await goGitIt(
  'https://github.com/extension-js/extension.js/blob/main/templates/react/manifest.json',
);
// Downloads ~/mydevspace/manifest.json
```

**The second parameter is the output path:**

```js
import goGitIt from 'go-git-it';

// Assume cwd is ~/mydevspace/

await goGitIt(
  'https://github.com/extension-js/extension.js',
  './my-browser-extension',
);
// Creates ./my-browser-extension/extension.js/ folder (like git clone)
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

## Related projects

* [pintor](https://github.com/cezaraugusto/pintor)
* [log-md](https://github.com/cezaraugusto/log-md)
* [mklicense](https://github.com/cezaraugusto/mklicense)
* [prefers-yarn](https://github.com/cezaraugusto/prefers-yarn)
* [git-precision](https://github.com/cezaraugusto/git-precision)
* [isolated-deps](https://github.com/cezaraugusto/isolated-deps)

## License

MIT (c) Cezar Augusto.
