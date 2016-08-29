# webpkg <sup><sub>0.3.0</sub></sup>
## Load your webpack configuration from package.json

[![npm](https://img.shields.io/npm/v/webpkg.svg?maxAge=2592000)](https://npmjs.com/package/webpkg)
[![license](https://img.shields.io/npm/l/webpkg.svg)](https://creativecommons.org/licenses/by/4.0/)
[![travis](https://img.shields.io/travis/Download/webpkg.svg)](https://travis-ci.org/Download/webpkg)
[![greenkeeper](https://img.shields.io/david/Download/webpkg.svg?maxAge=2592000)](https://greenkeeper.io/)
![mind BLOWN](https://img.shields.io/badge/mind-BLOWN-ff69b4.svg)

<sup><sub><sup><sub>.</sub></sup></sub></sup>

## WORK IN PROGRESS

<sup><sub><sup><sub>.</sub></sup></sub></sup>

**The shortest webpack configuration file you've ever seen!**

**webpack.config.js**:
```js
module.exports = require('webpkg')();
```
<sup><sub><sup><sub>.</sub></sup></sub></sup>

## Installation
```sh
npm install --save webpkg
```

## Usage
Create a `webpack.config.js` in the root of your project and add this code:

```js
module.exports = require('webpkg')();
```

Now, you can configure webpack from your package.json:

```json
{
  "name": "webpkg-example",
  "version": "1.0.0",
  "webpack": {
    "entry": "./main.js"
  }
}
```

## Options
All standard [Webpack configuration options](https://webpack.github.io/docs/configuration.html) are supported.

Configuring a full Webpack project from scratch is a lot of work, so `webpkg`
offers some extra options to help you with this:

### basecfg
Set this to the name of an (installed) module yielding a webpack configuration
when `require`d and it will be used as the base configuration; the other changes
you make in `package.json` will be applied on top of this base configuration.

### pluginsPre
The Webpack `plugins` property is an array, which makes manipulating it in the
`package.json` difficult. `pluginsPre` lets `webpkg` *prepend* the entries to
the existing `plugins` in stead of replacing them.

### pluginsPost
The counterpart of `pluginsPre`, `pluginsPost` lets `webpkg` *append* the entries to
the existing `plugins` in stead of replacing them.

## Issues
Add an issue in this project's [issue tracker](https://github.com/download/webpkg/issues)
to let me know of any problems you find, or questions you may have.

## Copyright
Copyright 2016 by [Stijn de Witt](http://StijnDeWitt.com). Some rights reserved.

## License
[Creative Commons Attribution 4.0 (CC-BY-4.0)](https://creativecommons.org/licenses/by/4.0/)
