var postcss = require('postcss');
var expect  = require('chai').expect;

var plugin = require('../');

var test = function (input, output, options, done) {
  postcss([plugin(options)]).process(input).then(function (result) {
    expect(result.css).to.equal(output);
    expect(result.warnings()).to.be.empty;
    done();
  }).catch(function (error) {
    done(error);
  });
};

describe('postcss-define-property', function () {

  /* Write tests here

  it('does something', function (done) {
    test('a{ }', 'a{ }', { }, done);
  });*/

});
