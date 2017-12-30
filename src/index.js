const assert = require('assert');
const Plugin = require('./Plugin');

const genPlugin = function ({ types }) { // eslint-disable-line
  let plugins = null;

  // Only for test
  global.__clearBabelAntdPlugin = () => { // eslint-disable-line
    plugins = null;
  };

  function applyInstance(method, args, context) {
    for (const plugin of plugins) {
      if (plugin[method]) {
        plugin[method].apply(plugin, [...args, context]);
      }
    }
  }

  function Program(path, { opts = {} }) {
    // Init plugin instances once.
    if (!plugins) {
      if (Array.isArray(opts)) {
        plugins = opts.map(({
          libraryName,
          libraryDirectory,
          camel2DashComponentName,
          camel2UnderlineComponentName,
          customName,
        }) => {
          assert(libraryName, 'libraryName should be provided');
          return new Plugin(
            libraryName,
            libraryDirectory,
            camel2DashComponentName,
            camel2UnderlineComponentName,
            customName,
            types
          );
        });
      } else {
        assert(opts.libraryName, 'libraryName should be provided');
        plugins = [
          new Plugin(
            opts.libraryName,
            opts.libraryDirectory,
            opts.camel2DashComponentName,
            opts.camel2UnderlineComponentName,
            opts.customName,
            types
          ),
        ];
      }
    }
    applyInstance('Program', arguments, this);  // eslint-disable-line
  }

  const methods = [
    'ImportDeclaration',
    'ExportNamedDeclaration',
  ];

  const ret = {
    visitor: { Program },
  };

  for (const method of methods) {
    ret.visitor[method] = function () { // eslint-disable-line
      applyInstance(method, arguments, ret.visitor);  // eslint-disable-line
    };
  }

  return ret;
};

exports.default = genPlugin;
module.exports = exports.default;