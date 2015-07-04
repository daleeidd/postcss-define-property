'use strict';

var postcss = require('postcss');

var variablesPattern      = /\$\S+/g;
var parametersPattern     = variablesPattern;
var customPropertyPattern = /^[^${}: ]+ *: /;
var propertyKeyDelimiter  = ':';

// Adds a property definition to properties
var define = function (properties, rule) {
  var name = rule.selector.match(customPropertyPattern).shift().replace(':', '').trim();
  var parameters = rule.selector.match(parametersPattern);

  var property = {
    name: name,
    parameters: parameters,
    declarations: rule.nodes.map(function (node) {
      return {
        property: node.prop,
        value: node.value,
        // Parses variables that are also parameters. Ignores other variables for compatability with Sass variables.
        // We only need the index of each parameter
        variables: node.value.match(variablesPattern).filter(function (variable) {
          return node.value.includes(variable);
        }).map(function (variable) {
          return parameters.indexOf(variable);
        })
      };
    })
  };

  properties[property.name + propertyKeyDelimiter + parameters.length] = property;
  rule.removeSelf();
};

// Applies the custom property to the given declaration
var apply = function (customProperty, declaration) {
  customProperty.declarations.forEach(function (customDeclaration) {
    // No need to copy value here as replace will copy value
    var value = customDeclaration.value;

    // Replace parameter variables with user given values
    customDeclaration.variables.forEach(function (variable) {
      value = value.replace(customProperty.parameters[variable], declaration.values[variable]);
    });

    // Using cloneBefore to insert declaration provides sourcemap support
    declaration.cloneBefore({
      prop: customDeclaration.property,
      value: value
    });
  });

  declaration.removeSelf();
};

module.exports = postcss.plugin('postcss-properties-properties', function (options) {
  options = options || {};

  return function (css) {
    var properties = Object.create({});

    // Use eachInside instead of more specific API methods to maintain redefinition and usage ordering
    css.eachInside(function (node) {
      if (node.type === 'rule') {
        if (node.selector.match(customPropertyPattern)) {
          define(properties, node);
        }
      }
      else if (node.type === 'decl') {
        node.values = postcss.list.space(node.value);
        var property = node.prop + propertyKeyDelimiter + node.values.length;
        if (properties[property]) {
          apply(properties[property], node);
        }
      }
    });
  };
});
