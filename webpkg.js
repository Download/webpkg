var fs = require('fs')
var path = require('path')
var extend = require('extend')
var appRoot = require('app-root-path')
var log; try {log=require('picolog');} catch(e){}

function webpkg(pkg, env) {
  if (!pkg) {
    pkg = path.resolve(appRoot.toString(), 'package.json')
    log && log.debug('webpkg: using configuration from ' + pkg)
  }
  if (typeof pkg == 'string') {
    log && log.log('webpkg: loading configuration from file ' + pkg)
    pkg = JSON.parse(fs.readFileSync(pkg))
  }
  env = env || (typeof process == 'object' && process.env) || {}
  var e, t;
  if (! (e = env.NODE_ENV)) {
    e = ''
    log && log.debug('webpkg: NODE_ENV not set. Defaulting to "" (empty string)')
  }
  if (! (t = env.WEBPKG)) {
    t = ''
    log && log.debug('webpkg: WEBPKG not set. Profiles are disabled.')
  }
  log && log.info('webpkg: using configuration: ' +
      'NODE_ENV:' + (e ? '"' + e + '"' : '"" (disabled)') + ', ' +
      'WEBPKG:'   + (t ? '"' + t + '"' : '"" (disabled)')
  )
  return webpkg.load(pkg, e, t);
}

module.exports = webpkg
webpkg.load = loadConfiguration

// === IMPLEMENTATION ===

function loadConfiguration(pkg, e, t) {
  var result = {entry: pkg && (pkg.main || (pkg.name && pkg.name + '.js')) || 'index.js', plugins:[]}
  var wpk = loadWebpkg(pkg, e, t);
  result = extend(true, result, loadBaseExt(wpk))
  result = extend(true, result, wpk)
  return sanitize(result);
}

function loadBaseExt(p) {
  log && log.debug('webpkg.loadBaseExt', p)
  var result = {}
  loadCfg(result, p, 'basecfg')
  loadCfg(result, p, 'extcfg')
  log && log.log('webpkg.loadBaseExt: base/ext configuration: ', result)
  return result
}

function loadCfg(result, p, name) {
  var cfgs = p && (name in p) && p[name] || []
  cfgs && log && log.debug('webpkg.loadCfg: loading configuration ' + name + ': ', cfgs)
  if (typeof cfgs == 'string') {cfgs = [cfgs]}
  return loadCfgs(result, cfgs)
}

function loadCfgs(result, cfgs) {
  for (var i=0,c; c=cfgs[i]; i++) {
    try {
      if (c.indexOf('./') === 0) {c = path.resolve(appRoot.toString(), c)}
      log && log.log('webpkg.loadCfgs: loading configuration from ' + c)
      var config = require(c);
      log && log.debug('webpkg.loadCfgs: loaded configuration: ', config)
      result = extend(true, result, config);
      log && log.debug('webpkg.loadCfgs: merged in configuration. result: ', result)
    } catch(e) {log.error('webpkg.loadCfgs: ERROR: Failed to load configuration from ' + c, e)}
  }
  return result
}

function loadWebpkg(pkg, e, t, p, path, result) {
  if (!p) {
    p = pkg && pkg.webpack
    path = 'webpack'
  }

  if (! result) {
    result = extend({}, p || {})
    log && log.debug('webpkg.loadWebpkg: merged in webpack root configuration from package.json...', result)
  }

  if (p && t && p[t]) {
    var pth = path + '.' + t;
    result = extend(result, p[t])
    log && log.debug('webpkg.loadWebpkg: merged in profile configuration from ' + pth, result)
    loadWebpkg(pkg, e, t, p[t], pth, result)
  }
  else if (p && e && p[e]) {
    var pth = path + '.' + e;
    result = extend(result, p[e])
    log && log.debug('webpkg.loadWebpkg: merged in environment configuration from ' + pth, result)
    loadWebpkg(pkg, e, t, p[e], pth, result)
  }
  return result
}

function sanitize(x) {
  for (var p in x) {if (! OPTIONS[p]) {delete x[p]}}
  return x;
}

var OPTIONS = {context:1, entry:1, output:1, module:1, resolve:1, resolveLoader:1, externals:1,
    target:1, bail:1, profile:1, cache:1, watch:1, watchOptions:1, debug:1, devtool:1, devServer:1,
    node:1, amd:1, loader:1, recordsPath:1, recordsInputPath:1, recordsOutputPath:1, plugins:1}
