var fs = require('fs')
var path = require('path')
var extend = require('extend');
var appRoot = require('app-root-path');
var WebpackOptionsDefaulter = require("webpack/lib/WebpackOptionsDefaulter");
var log; try {require.resolve('picolog'); log=require('picolog');} catch(e){}

function webpkg(pkg, env) {
  if (!pkg) {
    pkg = path.resolve(appRoot.toString(), 'package.json')
    log && log.log('webpkg: using configuration from ' + pkg)
  }
  if (typeof pkg == 'string') {
    log && log.log('webpkg: loading configuration from file ' + pkg)
    pkg = JSON.parse(fs.readFileSync(pkg))
  }
  env = env || (typeof process == 'object' && process.env) || {}
  var e, t;
  if (! (e = env.NODE_ENV)) {
    e = 'production'
    log && log.log('webpkg: NODE_ENV not set. Defaulting to "production"')
  }
  if (! (t = env.WEBPKG)) {
    t = ''
    log && log.log('webpkg: WEBPKG not set. Profiles are disabled.')
  }
  pkg && log && log.info('webpkg: using configuration: NODE_ENV:"' + e + '", WEBPKG: ' + (t ? '"' + t + '"' : '"" (disabled)'))
  return loadConfiguration(pkg, e, t);
}

module.exports = webpkg

// === IMPLEMENTATION ===

function loadConfiguration(pkg, e, t) {
  var result = {entry: pkg && (pkg.main || (pkg.name && pkg.name + '.js')) || 'index.js', plugins:[]}
//  result = extend(result, loadDefaults(pkg))
  result = extend(result, loadBase(pkg))
  result = extend(result, loadWebpkg(pkg))
  return result;
}

function loadDefaults(pkg) {
  var defaults = {entry:'index.js', plugins:[]}
  new WebpackOptionsDefaulter().process(defaults);
  return sanitize(defaults)
}

function loadBase(pkg) {
  var result = {}, base = pkg.basecfg || []
  if (typeof base == 'string') {base = [base]}
  for (var i=0,b; b=base[i]; i++) {result = extend(result, require(b))}
  return result
}

function loadWebpkg(pkg) {
  var webpkg = {};
  webpkg = sanitize(extend(webpkg, pkg && pkg.webpkg || {}))
  webpkg = sanitize(extend(webpkg, pkg && pkg.webpkg && pkg.webpkg[e] || {}))
  webpkg = sanitize(extend(webpkg, pkg && pkg.webpkg && pkg.webpkg[e] && pkg.webpkg[e][t] || {}))
  return webpkg
}

function sanitize(webpkg) {
  for (var prop in webpkg) {if (! OPTIONS[prop]) {delete webpkg[prop]}}
}

var WEBPACK_OPTIONS = {
  context:1, entry:1, output:1, module:1, resolve:1, resolveLoader:1,
  externals:1, target:1, bail:1, profile:1, cache:1, watch:1, watchOptions:1,
  debug:1, devtool:1, devServer:1, node:1, amd:1, loader:1,
  recordsPath:1, recordsInputPath:1, recordsOutputPath:1, plugins:1
}
var WEBPKG_OPTIONS = {
  basecfg:1, pluginsPre:1, pluginsPost:1
}
var OPTIONS = extend({}, WEBPACK_OPTIONS, WEBPKG_OPTIONS)
