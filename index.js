'use strict';

var postcss = require('postcss');
var extend  = require('extend');

var variablesPattern;
var parametersPattern;
var propertyKeyDelimiter;
var customPropertyPattern;
var signatureSeparator = ':';

// Adds a property definition to properties
var define = function (properties, rule, options) {
  var signature = rule.selector || rule.params;
  var name = signature.match(customPropertyPattern).shift().replace(propertyKeyDelimiter, '').trim();
  var parameters = signature.replace(customPropertyPattern, '').match(parametersPattern).map(function (parameter) {
    return parameter.replace(options.syntax.parameter, options.syntax.variable);
  });

  var property = {
    name: name,
    parameters: parameters,
    declarations: rule.nodes.map(function (node) {
      return {
        property: node.prop,
        value: node.value,
        // Parses variables that are also parameters. Ignores other variables for compatability with Sass variables.
        // We only need the index of each parameter
        variables: (node.value.match(variablesPattern) || [])
        .filter(function (variable) {
          return node.value.indexOf(variable) !== -1;
        }).map(function (variable) {
          return parameters.indexOf(variable);
        })
      };
    })
  };

  properties[options.syntax.property + property.name + signatureSeparator + parameters.length] = property;
  rule.remove();
};

// Applies the custom property to the given declaration
var apply = function (customProperty, declaration) {
  customProperty.declarations.forEach(function (customDeclaration) {
    // No need to copy value here as replace will copy value
    var value = customDeclaration.value;

    // Replace parameter variables with user given values
    customDeclaration.variables.forEach(function (variable) {
      value = value.replace(customProperty.parameters[variable],
        declaration.values[variable]);
    });

    // Using cloneBefore to insert declaration provides sourcemap support
    declaration.cloneBefore({
      prop: customDeclaration.property,
      value: value
    });
  });

  declaration.remove();
};

module.exports = postcss.plugin('postcss-properties-properties', function (options) {

  var defaults = {
    syntax: {
      atrule: '',
      parameter: '$',
      property: '',
      separator: ':',
      variable: '$'
    }
  };

  // Apply defaults and normalise options
  options = options == null ? defaults : extend(true, defaults, options);
  options.syntax.atrule = options.syntax.atrule === true  ? 'property' :
                          options.syntax.atrule === false ? '' :
                          options.syntax.atrule;

  // Check for invalid option combinations
  if (options.syntax.separator === '' && options.syntax.atrule === '') {
    throw new Error('Invalid Syntax Options: The separator cannot be removed for non atrules');
  }

  // Set patterns based on options
  parametersPattern     = new RegExp(
    (options.syntax.parameter ? '\\' : '') + options.syntax.parameter + '(\\w|\\d|[-_])+', 'g');
  variablesPattern      = new RegExp(
    (options.syntax.variable  ? '\\' : '') + options.syntax.variable  + '(\\w|\\d|[-_])+', 'g');
  propertyKeyDelimiter  = options.syntax.separator;
  customPropertyPattern = new RegExp('^.+?' + propertyKeyDelimiter + ' ');

  return function (css) {
    var properties = Object.create(null);

    css.walk(function (node) {
      if (options.syntax.atrule === '' && node.type === 'rule') {
        if (node.selector.match(customPropertyPattern)) {
          define(properties, node, options);
        }
      }
      else if (options.syntax.atrule !== '' && node.type === 'atrule') {
        if (node.name === options.syntax.atrule) {
          define(properties, node, options);
        }
      }
      else if (node.type === 'decl') {
        node.values = postcss.list.space(node.value);
        var property = node.prop + signatureSeparator + node.values.length;
        if (properties[property]) {
          apply(properties[property], node, options);
        }
      }
    });
  };
});
