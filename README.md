# webpkg <sup><sub>0.3.3</sub></sup>
## Load your webpack configuration from package.json

[![npm](https://img.shields.io/npm/v/webpkg.svg?maxAge=2592000)](https://npmjs.com/package/webpkg)
[![license](https://img.shields.io/npm/l/webpkg.svg)](https://creativecommons.org/licenses/by/4.0/)
[![travis](https://img.shields.io/travis/Download/webpkg.svg)](https://travis-ci.org/Download/webpkg)
[![greenkeeper](https://img.shields.io/david/Download/webpkg.svg?maxAge=2592000)](https://greenkeeper.io/)
![mind BLOWN](https://img.shields.io/badge/mind-BLOWN-ff69b4.svg)

<sup><sub><sup><sub>.</sub></sup></sub></sup>

### The shortest webpack configuration file you've ever seen!

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
offers some extra options to help you with this. These options are used in the
top level (or levels, see [option inheritance](#option-inheritance)) of your
webpack configuration:

### basecfg
Set this to the name of an (installed) module yielding a webpack configuration
when `require`d and it will be used as the base configuration; the other changes
you make in `package.json` will be applied on top of this base configuration.

#### examples
Given this configuration in `./test/base.js`:
```js
module.exports = {
  context: 'base',
  entry: 'base'
}
```
and this configuration in `package.json`:

```json
{
  "name": "webpkg-basecfg",
  "version": "1.0.0",
  "webpack": {
    "basecfg": "./test/base",
    "entry": "override",
  }
}
```
The resulting configuration would be:
```json
{
    "context": "base",
    "entry": "override"
  }
}
```
Instead of a string with a module name, we can set `basecfg` to an array of
strings with module names:

```json
{
  "name": "webpkg-basecfg",
  "version": "1.0.0",
  "webpack": {
    "basecfg": [
      "./test/base",
      "./test/extend"
    ],
  }
}
```
All configurations will be applied on top of one another, in the order in which
they are listed

### extcfg
Set this to the name of an (installed) module yielding a webpack configuration
when `require`d and it will be used as an extension to the base configuration;
it will first be applied to the base configuration after which the changes you
make in `package.json` will be applied on top of that.

`extcfg` works in exactly the same way as `basecfg`. Only when used together
does an extra behavior arrise: `basecfg` is applied first and then `extcfg`
is applied on top of that. This is convenient in combination with *option inheritance*.


## option inheritance

`webpkg` offers an inheritance strategy for options in `package.json` that
allows us to place shared options in the base config and differing options in
extended configs.

### environment variables
You can use environment variables to control which set of options will be used.
There are two environment variables that `webpkg` will respond to:
* `WEBPKG`: e.g. `'client'`, `'server'`, etc
* `NODE_ENV`: e.g. `'production'`, `'development'`, `'test'` etc.

### rules
You can use both environment variables at the same time. However, please observe
these rules:
* The names of top-level webpack configuration variables may not be used
* The names for `WEBPKG` may not overlap with the names for `NODE_ENV`
* When given the choice, *webpkg* will prioritize `WEBPKG` over `NODE_ENV`

### examples
Given this configuration in `package.json`:
```json
{
  "webpack": {
    "entry": "base",

    "production": {
      "entry": "prod",

      "client": {
        "entry": "prod-client"
      },

      "server": {
        "entry": "prod-server"
      }
    },

    "development": {
      "client": {
        "entry": "dev-client"
      },

      "server": {
        "entry": "dev-server"
      }
    },

    "client": {
      "entry": "client"
    }
  }
}
```
The option `entry` would yield different values depending on `WEBPKG` and `NODE_ENV`:
* `WEBPKG=server, NODE_ENV=development` ==> 'dev-server'
* `WEBPKG=server, NODE_ENV=production` ==> 'prod-server'
* `WEBPKG=client, NODE_ENV=development` ==> 'client'
* `WEBPKG=client, NODE_ENV=production` ==> 'client'

In the first two cases, `webpkg` has no choice but to follow the paths
* `webpack->development->server`
* `webpack->production->server`

However, for the last two cases, `webpkg` is given a choice, as `webpack` has both
the properties `production`/`development` as well as `client`.
Due to the third rule, `webpkg` will prioritize the `WEBPKG` environment variable,
so it takes the path
* `webpack->client` at which point it can't go deeper.

## Running webpack from your NPM scripts
We want to be able to say `npm run build-prod` or `npm run build-dev` and have it just work.
Here is how we can configure our scripts section to accomplish that:

```json
{
  "scripts": {
    "build-dev": "cross-env NODE_ENV=development webpack",
    "build-prod": "cross-env NODE_ENV=production webpack",
  },
  "webpack": {
    "entry": "common options",

    "development": {
      "entry": "development options"
    },
    "production": {
      "entry": "production options"
    }
  }
}
```

I recommend using [cross-env](https://npmjs.com/package/cross-env) to set environment
variables.

## Integration with `pkgcfg`
Need more dynamic behavior? `webpkg` works well with [pkgcfg](https://npmjs.com/package/pkgcfg).

```sh
npm install --save pkgcfg
```

Then, modify your `webpack.config.js` to read:

```js
module.exports = require('webpkg')(require('pkgcfg')())
```

This uses `pkgcfg` to read your `package.json` and process the tags you have used,
after which the resulting JSON object is passed on to `webpkg`.

Now, you should be able to do things like:

```json
{
  "name": "webpkgcfg-example",
  "version": "1.0.0",
  "webpack": {
    "entry": "./src/{pkg name}",
    "output": {
      "filename": "./bin/{pkg name}-{pkg version}.js"
    }
  }
}
```

## Issues

Add an issue in this project's [issue tracker](https://github.com/download/webpkg/issues)
to let me know of any problems you find, or questions you may have.


## Copyright

Copyright 2016 by [Stijn de Witt](http://StijnDeWitt.com). Some rights reserved.


## License

[Creative Commons Attribution 4.0 (CC-BY-4.0)](https://creativecommons.org/licenses/by/4.0/)
