var postcss = require('postcss');
var expect  = require('chai').expect;

var plugin = require('../');

var pass = function (input, output, options, done) {
  postcss([plugin(options)]).process(input).then(function (result) {
    expect(result.css).to.equal(output);
    expect(result.warnings()).to.be.empty;
    done();
  }).catch(function (error) {
    done(error);
  });
};

var fail = function (input, output, options, done) {
  try {
    postcss([plugin(options)]).process(input).then(function () {
      done(new Error('The error was not thrown.'));
    }).catch(function (error) {
      done(error);
    });
  } catch (error) {
    expect(error.message).to.equal(output);
    done();
  }
};

describe('postcss-define-property', function () {

  it('should allow the definition and usage of custom properties', function (done) {
    pass(
      'size: $height $width { height: $height; width: $width; }\n' +
      'center-left: $offset { left: auto; right: $offset; text-align: right; }\n' +
      'a { size: 50px 100px; center-left: 20px; }',
      'a { height: 50px; width: 100px; left: auto; right: 20px; text-align: right; }',
      {}, done);
  });

  it('should work for syntax on parameter boundary', function (done) {
    pass(
      'boundary: $x $p-y { width: calc(100% - $x); content: url("$p-y"); }\n' +
      'a { boundary: 1px file.txt; }',
      'a { width: calc(100% - 1px); content: url("file.txt"); }',
      {}, done);
  });

  it('should handle malformed definitions', function (done) {
    pass(
      'size : $height $width { height: $height; width: $width; }\n' +
      'a { size: 50px 100px; }',
      'a { height: 50px; width: 100px; }',
      {}, done);
  });

  it('should not conflict with psuedo-selectors', function (done) {
    pass(
      'size: $height $width { height: $height; width: $width; }\n' +
      'a:hover { background: blue; }\n' +
      'a { size: 50px 100px; }',
      'a:hover { background: blue; }\n' +
      'a { height: 50px; width: 100px; }',
      {}, done);
  });

  it('should ignore sass-style variables', function (done) {
    pass(
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
    pass(
      'size: $height $width { height: $height; width: $width; }\n' +
      'size: $size { height: $size; width: $size; }\n' +
      'a { size: 50px 100px; }\n' +
      'p { size: 50px; }',
      'a { height: 50px; width: 100px; }\n' +
      'p { height: 50px; width: 50px; }',
      {}, done);
  });

  it('should allow the redefinition of properties', function (done) {
    pass(
      'size: $height $width { height: $height; width: $width; }\n' +
      'a { size: 50px 100px; }\n' +
      'size: $width $height { width: $width; height: $height; }\n' +
      'p { size: 50px 100px; }',
      'a { height: 50px; width: 100px; }\n' +
      'p { width: 50px; height: 100px; }',
      {}, done);
  });

  it('should handle declarations with multiple values', function (done) {
    pass(
      'margin: $top $bottom $left $right { margin: $top $right $bottom $left; }\n' +
      'a { margin: 1px 2px 3px 4px; }',
      'a { margin: 1px 4px 2px 3px; }',
      {}, done);
  });

  it('should allow the user to override parameter prefixes', function (done) {
    pass(
      'size: #height #width { height: $height; width: $width; }\n' +
      'a { size: 10px 20px; }',
      'a { height: 10px; width: 20px; }',
      { syntax: { parameter: '#' } }, done);
  });

  it('should allow the user to remove parameter prefixes', function (done) {
    pass(
      'size: height width { height: $height; width: $width; }\n' +
      'a { size: 10px 20px; }',
      'a { height: 10px; width: 20px; }',
      { syntax: { parameter: '' } }, done);
  });

  it('should allow the user to override variable prefixes', function (done) {
    pass(
      'size: $height $width { height: #height; width: #width; }\n' +
      'a { size: 10px 20px; }',
      'a { height: 10px; width: 20px; }',
      { syntax: { variable: '#' } }, done);
  });

  it('should allow the user to remove variable prefixes', function (done) {
    pass(
      'size: $height $width { height: height; width: width; }\n' +
      'a { size: 10px 20px; }',
      'a { height: 10px; width: 20px; }',
      { syntax: { variable: '' } }, done);
  });

  it('should allow the user to use the atrule syntax', function (done) {
    pass(
      '@property size: $height $width { height: $height; width: $width; }\n' +
      'a { size: 10px 20px; }',
      'a { height: 10px; width: 20px; }',
      { syntax: { atrule: true } }, done);
  });

  it('should allow the user to choose the atrule name', function (done) {
    pass(
      '@shortcut size: $height $width { height: $height; width: $width; }\n' +
      'a { size: 10px 20px; }',
      'a { height: 10px; width: 20px; }',
      { syntax: { atrule: 'shortcut' } }, done);
  });

  it('should allow the user to change the separator', function (done) {
    pass(
      'size = $height $width { height: $height; width: $width; }\n' +
      'a { size: 10px 20px; }',
      'a { height: 10px; width: 20px; }',
      { syntax: { separator: '=' } }, done);
  });

  it('should allow the user to remove the separator', function (done) {
    pass(
      '@property size $height $width { height: $height; width: $width; }\n' +
      'a { size: 10px 20px; }',
      'a { height: 10px; width: 20px; }',
      { syntax: { atrule: true, separator: '' } }, done);
  });

  it('should disallow the removal of separator for non atrules', function (done) {
    fail(
      'size $height $width { height: $height; width: $width; }\n' +
      'a { size: 10px 20px; }',
      'Invalid Syntax Options: The separator cannot be removed for non atrules',
      { syntax: { separator: '' } }, done);
  });

  it('should allow the user to add a prefix to properties', function (done) {
    pass(
      'size: $height $width { height: $height; width: $width; }\n' +
      'a { +size: 10px 20px; size: 10px; }',
      'a { height: 10px; width: 20px; size: 10px; }',
      { syntax: { property: '+' } }, done);
  });
});
