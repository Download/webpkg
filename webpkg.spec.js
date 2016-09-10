var log = require('picolog');
var expect = require('chai').expect;

var path = require('path')
var fs = require('fs')
var webpkg = require('./webpkg')
var pkg = require('./package.json')
var NODE_ENV = typeof process == 'object' && process.env.NODE_ENV || ''
var WEBPKG = typeof process == 'object' && process.env.WEBPKG || ''

describe('webpkg', function(){

	it('is a function', function(){
		expect(webpkg).to.be.a('function')
	})

	var cfg = webpkg()
  base = require('./test/base' + (NODE_ENV ? '-' + NODE_ENV : ''))
  ext = require('./test/extend' + (NODE_ENV == 'production' ? '-' + NODE_ENV : (NODE_ENV=='development' && WEBPKG=='client' ? '-' + NODE_ENV + '-' + WEBPKG : '')))

	it('returns a valid webpack configuration object', function(){
    expect(typeof cfg).to.equal('object')
    // webpack defines a valid configuration object as one that has 'entry' and 'plugins' properties
		expect(cfg).to.have.a.property('entry')
    expect(cfg).to.have.a.property('plugins')
	})

	it('inherits properties from the base configuration', function(){
		expect(cfg).to.have.a.property('context')
    expect(cfg.context).to.equal(base.context)
	})

  it('inherits properties from the extended configuration', function(){
		expect(cfg).to.have.a.property('target')
    expect(cfg.target).to.equal(ext.target)
	})

  it('inherits properties from the `webpack` configuration', function(){
		expect(cfg).to.have.a.property('plugins')
    expect(cfg.plugins).to.have.a.property('length')
    expect(cfg.plugins.length).to.equal(1)
    expect(cfg.plugins[0]).to.equal('test')
	})

	it('correctly applies overrides within the `webpack` configuration', function(){
    var expected = 'standard';
    if (NODE_ENV) {
      expected = NODE_ENV + (WEBPKG ? '-' + WEBPKG : '')
    }
		expect(cfg).to.have.a.property('devtool')
    expect(cfg.devtool).to.equal(expected)
	})

	it('performs deep extension of base profiles.', function(){
		expect(cfg).to.have.a.property('resolve')
		expect(cfg.resolve).to.have.a.property('extensions')
		if (process.env.NODE_ENV || process.env.WEBPKG) {
			expect(cfg.resolve).to.have.a.property('alias')
		}
		if (process.env.NODE_ENV) {
			expect(cfg.resolve.alias).to.have.a.property('NODE_ENV')
			expect(cfg.resolve.alias.NODE_ENV).to.equal(process.env.NODE_ENV)
		}
		if (process.env.WEBPKG) {
			expect(cfg.resolve.alias).to.have.a.property('WEBPKG')
			expect(cfg.resolve.alias.WEBPKG).to.equal(process.env.WEBPKG)
		}
	})
})
