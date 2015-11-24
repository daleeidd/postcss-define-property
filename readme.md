# postcss-define-property
[![Build Status][ci-img]][ci]

[PostCSS] plugin to define and use custom properties. Not to be confused with the CSS Custom Properties specification which are really variables.

Please see the [Compatibility wiki page][wiki-compatibility] for use with other plugins.

```css
/* Input */
size: $height $width {
  height: $height;
  width: $width;
}

size: $size {
  height: $size;
  width: $size;
}

.rectangle {
  size: 50px 100px;
}

.square {
  size: 50px;
}
```

```css
/* Output */
.rectangle {
  height: 50px;
  width: 100px;
}

.square {
  height: 50px;
  width: 50px;
}
```

There must be a minimum of one space after the semicolon for property definitions; otherwise, it will just appear as a
psuedo-selector.

Properties – including native ones – can be redefined. The placement of property definitions matter as they are not hoisted.

Properties can also be overloaded as the parameter quantity forms part of the property's signature.

## Options

### `syntax`

The syntax is customisable by providing an object. The following are the available syntax options:

| Syntax | Types | Default | Comment |
| ------ |:-----:|:-------:| ------- |
| atrule | `boolean` `string` | `false` | `true` for `@property` or a `string` to specify the `atrule` name |
| parameter | `string` | `'$'` | sets the parameter prefix within the signature |
| property | `string` | `''` | sets the prefix for property invocation |
| separator | `string` | `':'` | sets the name/parameter separator within the signature. Cannot be set to `''` if not an `atrule` |
| variable | `string` | `'$'` | sets the parameter prefix within the body |

As an example, the following syntax options:

```js
properties({
  syntax: {
    atrule: true,
    parameter: '',
    property: '+',
    separator: ''
  }
});
```

Will be able to parse:

```css
@property size height width {
  height: $height;
  width: $width;
}

.rectangle {
  +size: 50px 100px;
}
```

The above is useful if one is concerned about not being able to discern custom properties from native ones.

## Usage

```js
postcss([ require('postcss-define-property') ])
```

See [PostCSS] docs for examples for your environment.

## Related

- [Mixins][postcss-mixins]: Mixins for more complicated cases
- [Aliases][postcss-alias]: Property aliases for simpler cases

[wiki-compatibility]: https://github.com/daleeidd/postcss-define-property/wiki/Compatibility
[postcss-mixins]:     https://github.com/postcss/postcss-mixins
[postcss-alias]:      https://github.com/seaneking/postcss-alias
[PostCSS]:            https://github.com/postcss/postcss
[ci-img]:             https://travis-ci.org/daleeidd/postcss-define-property.svg
[ci]:                 https://travis-ci.org/daleeidd/postcss-define-property
