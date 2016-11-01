var log; try {log = require('ulog')('webpkg')} catch(e){log = console; log.name = 'webpkg'; log.log=function(){}}

var fs = require('fs')
var path = require('path')
var extend = require('extend')
var globalCfg = require('pkgcfg')()
var objectPath = require("object-path")


module.exports = function webpkg(pkg, env) {
  if (!pkg) {
    pkg = globalCfg;
    log.log(log.name + ': using configuration from ' + pkg)
  }
  if (typeof pkg == 'string') {
    log.log(log.name + ': loading configuration from file ' + pkg)
    pkg = JSON.parse(fs.readFileSync(pkg))
  }
  env = env || (typeof process == 'object' && process.env) || {}
  var e, t;
  if (! (e = env.NODE_ENV)) {
    e = ''
    log.log(log.name + ': NODE_ENV not set. Defaulting to "" (empty string)')
  }
  if (! (t = env.WEBPKG)) {
    t = ''
    log.log(log.name + ': WEBPKG not set. Profiles are disabled.')
  }
  log.info(log.name + ': using configuration: ' +
      'NODE_ENV=' + (e ? e : '"" (disabled)') + ', ' +
      'WEBPKG='   + (t ? t : '"" (disabled)')
  )
  return loadConfiguration(pkg, e, t);
}


// === IMPLEMENTATION ===

function loadConfiguration(pkg, e, t) {
  var result = {entry: pkg && (pkg.main || (pkg.name && pkg.name + '.js')) || 'index.js', plugins:[]}
  var wpk = loadWebpkg(pkg, e, t);
  result = extend(true, result, loadBaseExt(wpk))
  result = extend(true, result, wpk)
  if (wpk.plugins) {result.plugins = loadPlugins(result, wpk.plugins)}
  if (wpk.pluginsPre) {result.plugins = loadPlugins(result, wpk.pluginsPre).concat(result.plugins)}
  if (wpk.pluginsPost) {result.plugins = result.plugins.concat(loadPlugins(result, wpk.pluginsPost))}
  return sanitize(result);
}

function loadBaseExt(p) {
  log.log(log.name + ': loading base/ext configuration', p)
  var result = {}
  loadCfg(result, p, 'basecfg')
  loadCfg(result, p, 'extcfg')
  log.log(log.name + ': loaded base/ext configuration: ', result)
  return result
}

function loadCfg(result, p, name) {
  var cfgs = p && (name in p) && p[name] || []
  cfgs.length && log.log(log.name + ': loading configuration ' + name + ': ', cfgs)
  if (typeof cfgs == 'string') {cfgs = [cfgs]}
  return loadCfgs(result, cfgs)
}

function loadCfgs(result, cfgs) {
  for (var i=0,c; c=cfgs[i]; i++) {
    try {
      if (c.indexOf('./') === 0) {c = path.resolve(process.cwd(), c)}
      log.log(log.name + ': loading configuration from ' + c)
      var config = require(c);
      log.log(log.name + ': loaded configuration: ', config)
      result = extend(true, result, config);
      log.log(log.name + ': merged in configuration. result: ', result)
    } catch(e) {log.error(log.name + ': ERROR: Failed to load configuration from ' + c, e)}
  }
  return result
}

function loadWebpkg(pkg, e, t, p, path, result) {
  if (!p) {
    p = pkg && pkg.webpack
    path = 'webpack'
  }

  if (! result) {
    result = extend(true, {}, p || {})
    log.log(log.name + ': merged in webpack root configuration from package.json...', result)
  }

  if (p && t && p[t]) {
    var pth = path + '.' + t;
    result = extend(true, result, p[t])
    log.log(log.name + ': merged in profile configuration from ' + pth, result)
    loadWebpkg(pkg, e, t, p[t], pth, result)
  }
  else if (p && e && p[e]) {
    var pth = path + '.' + e;
    result = extend(true, result, p[e])
    log.log(log.name + ': merged in environment configuration from ' + pth, result)
    loadWebpkg(pkg, e, t, p[e], pth, result)
  }
  return result
}

function loadPlugins(cfg, plugins) {
	return plugins.map(function(x){
    log.log(log.name + ': loading plugins', plugins)
		try {
			var args = [cfg], module, pluginName, plugin
      // if the plugin spec is an object, process it
			if (typeof x == 'object') {
        // Object should contain a single key which should be the name
        // of the module to require
				module = Object.keys(x)[0]
        x = x[module]
        // if value is an object, it should contain a key naming
        // the plugin constructor function to import from the module.
        // This may be an object path, e.g. 'optimize.DedupePlugin'
        if (typeof x == 'object') {
          pluginName = Object.keys(x)[0]
          x = x[pluginName]
        }
        if (Array.isArray(x)) {
          args = x
        }
      }
      else {
        // assume the plugin spec is the name of a module
        module = x
      }

      log.log(log.name + ': requiring module ' + module)
      try {
        plugin = require(module)
      } catch(e) {
        log.log(log.name + ': could not load module ' + module + ', returning as-is')
        return module
      }
      if (pluginName) {
        log.log(log.name + ': importing plugin ' + pluginName)
        plugin = objectPath.get(plugin, pluginName)
      }

      // if plugin is a function, call it
      if (typeof plugin == 'function') {
        // if pluginName is set, assume plugin is a constructor function
        // this is not watertight, but should work for most of the default 
        // plugins while still allowing you to easily instantiate whatever 
        // plugin in whatever complex way via a small intermediate script
        if (pluginName) {
          // quick and dirty dynamic constructor invocation
          log.log(log.name + ': instantiating plugin ' + pluginName + ' with ' + args.length + ' arguments', args)
          switch(args.length) {
            case 0: return new plugin()
            case 1: return new plugin(args[0])
            case 2: return new plugin(args[0], args[1]) 
            case 3: return new plugin(args[0], args[1], args[2]) 
            case 4: return new plugin(args[0], args[1], args[2], args[3]) 
            case 5: return new plugin(args[0], args[1], args[2], args[3], args[4])
          }
          // covers everything up to 9 params as long as the constructor 
          // does not use arguments.length ...
          return new plugin(args[0], args[1], args[2], args[3], args[4], args[5], args[6], args[7], args[8], args[9])
        }
        log.log(log.name + ': invoking module function', plugin)
        return plugin.apply(global, args)
      }
      return plugin
		} catch(e) {
			return x
		}
	})
}

function sanitize(x) {
  for (var p in x) {if (! OPTIONS[p]) {delete x[p]}}
  return x;
}

var OPTIONS = {context:1, entry:1, output:1, module:1, resolve:1, resolveLoader:1, externals:1,
    target:1, bail:1, profile:1, cache:1, watch:1, watchOptions:1, debug:1, devtool:1, devServer:1,
    node:1, amd:1, loader:1, recordsPath:1, recordsInputPath:1, recordsOutputPath:1, plugins:1}

log.log('Initialized ' + log.name)
