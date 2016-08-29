var log = require('picolog');
var expect = require('chai').expect;

var webpkg = require('./webpkg');

describe('webpkg', function(){
	it('is a function', function(){
		expect(webpkg).to.be.a('function');
	});

	var pkg = webpkg();

	it('returns a webpack configuration object', function(){
    expect(typeof pkg).to.equal('object');
    // webpack defines a valid configuration object as one that has 'entry' and 'plugins' properties
		expect(pkg).to.have.a.property('entry');
    expect(pkg).to.have.a.property('plugins');
	});
});
