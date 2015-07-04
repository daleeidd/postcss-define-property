var postcss = require('postcss');

module.exports = postcss.plugin('postcss-define-property', function (options) {
  options = options || {};

  // Work with options here

  return function (css) {

    // Transform CSS AST here

  };
});
