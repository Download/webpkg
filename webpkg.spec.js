var log = require('picolog');
var expect = require('chai').expect;

var path = require('path')
var fs = require('fs')
var appRoot = require('app-root-path')
var webpkg = require('./webpkg')
var pkg = JSON.parse(fs.readFileSync(path.resolve(appRoot.toString(), 'package.json')))
var NODE_ENV = typeof process == 'object' && process.env.NODE_ENV || ''
var WEBPKG = typeof process == 'object' && process.env.WEBPKG || ''

describe('webpkg', function(){

	it('is a function', function(){
		expect(webpkg).to.be.a('function')
	});

	var cfg = webpkg()
  base = require('./test/base' + (NODE_ENV ? '-' + NODE_ENV : ''))
  ext = require('./test/extend' + (NODE_ENV == 'production' ? '-' + NODE_ENV : (NODE_ENV=='development' && WEBPKG=='client' ? '-' + NODE_ENV + '-' + WEBPKG : '')))

/*
"webpack": {
  "basecfg": "./test/base",
  "extcfg": "./test/extend",
  "plugins": [
    "test"
  ],

  "production": {
    "extcfg": "./test/extend-production",
    "entry": "./production",
    "client": {
      "basecfg": "./test/base-production"
    },
    "server": {
      "basecfg": "./test/base-production"
    }
  },
  "development": {
    "basecfg": "./test/base-development",
    "client": {
      "extcfg": "./test/extend-development-client"
    },
    "server": {}
  }
}
*/


	it('returns a valid webpack configuration object', function(){
    expect(typeof cfg).to.equal('object')
    // webpack defines a valid configuration object as one that has 'entry' and 'plugins' properties
		expect(cfg).to.have.a.property('entry')
    expect(cfg).to.have.a.property('plugins')
	});

	it('inherits properties from the base configuration', function(){
		expect(cfg).to.have.a.property('context')
    expect(cfg.context).to.equal(base.context);
	});

  it('inherits properties from the extended configuration', function(){
		expect(cfg).to.have.a.property('target')
    expect(cfg.target).to.equal(ext.target);
	});

  it('inherits properties from the `webpack` configuration', function(){
		expect(cfg).to.have.a.property('plugins')
    expect(cfg.plugins).to.have.a.property('length')
    expect(cfg.plugins.length).to.equal(1)
    expect(cfg.plugins[0]).to.equal('test')
	});

	it('correctly applies overrides within the `webpack` configuration', function(){
    var expected = 'standard';
    if (NODE_ENV) {
      expected = NODE_ENV + (WEBPKG ? '-' + WEBPKG : '')
    }
		expect(cfg).to.have.a.property('devtool')
    expect(cfg.devtool).to.equal(expected)
	});
});
