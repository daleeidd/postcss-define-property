var postcss = require('postcss');
var expect  = require('chai').expect;

var plugin = require('../');

var test = function (input, output, opts, done) {
  postcss([ plugin(opts) ]).process(input).then(function (result) {
    expect(result.css).to.eql(output);
    expect(result.warnings()).to.be.empty;
    done();
  }).catch(function (error) {
    done(error);
  });
};

describe('postcss-define-property', function () {

  it('should allow the definition and usage of custom properties', function (done) {
    test(
      'size: $height $width { height: $height; width: $width; }\n' +
      'a { size: 50px 100px; }',
      'a { height: 50px; width: 100px; }',
      {}, done);
  });

  it('should handle malformed definitions', function (done) {
    test(
      'size : $height $width { height: $height; width: $width; }\n' +
      'a { size: 50px 100px; }',
      'a { height: 50px; width: 100px; }',
      {}, done);
  });

  it('should not conflict with psuedo-selectors', function (done) {
    test(
      'size: $height $width { height: $height; width: $width; }\n' +
      'a:hover { background: blue; }\n' +
      'a { size: 50px 100px; }',
      'a:hover { background: blue; }\n' +
      'a { height: 50px; width: 100px; }',
      {}, done);
  });

  it('should ignore sass-style variables', function (done) {
    test(
      '$zero: 0;\n' +
      'squashed: $width { height: $zero; width: $width; }\n' +
      '$anchor-width: 100px;\n' +
      'a { squashed: $anchor-width; }',
      '$zero: 0;\n' +
      '$anchor-width: 100px;\n' +
      'a { height: $zero; width: $anchor-width; }',
      {}, done);
  });

  it('should have unique property signatures by parameter length', function (done) {
    test(
      'size: $height $width { height: $height; width: $width; }\n' +
      'size: $size { height: $size; width: $size; }\n' +
      'a { size: 50px 100px; }\n' +
      'p { size: 50px; }',
      'a { height: 50px; width: 100px; }\n' +
      'p { height: 50px; width: 50px; }',
      {}, done);
  });

  it('should allow the redefinition of properties', function (done) {
    test(
      'size: $height $width { height: $height; width: $width; }\n' +
      'a { size: 50px 100px; }\n' +
      'size: $width $height { width: $width; height: $height; }\n' +
      'p { size: 50px 100px; }',
      'a { height: 50px; width: 100px; }\n' +
      'p { width: 50px; height: 100px; }',
      {}, done);
  });

  it('should handle declarations with multiple values', function (done) {
    test(
      'margin: $top $bottom $left $right { margin: $top $right $bottom $left; }\n' +
      'a { margin: 1px 2px 3px 4px; }',
      'a { margin: 1px 4px 2px 3px; }',
      {}, done);
  });

});
