/* eslint-disable new-cap */
const pathModule = require('path');

function camel2Dash(_str) {
  const str = _str[0].toLowerCase() + _str.substr(1);
  return str.replace(/([A-Z])/g, $1 => `-${$1.toLowerCase()}`);
}

function camel2Underline(_str) {
  const str = _str[0].toLowerCase() + _str.substr(1);
  const ret = str.replace(/([A-Z])/g, $1 => `_${$1.toLowerCase()}`);
  return ret;
}

function replaceWinPath(path) {
  return path.replace(/\\/g, '/');
}

class Plugin {
  constructor(
    libraryName,
    libraryDirectory = 'lib',
    style = false,
    camel2DashComponentName = true,
    camel2UnderlineComponentName,
    fileName = '',
    customName,
    types
  ) {
    this.libraryName = libraryName;
    this.libraryDirectory = libraryDirectory;
    this.style = style;
    this.camel2DashComponentName = camel2DashComponentName;
    this.camel2UnderlineComponentName = camel2UnderlineComponentName;
    this.customName = customName;
    this.fileName = fileName;
    this.types = types;
  }

  transformedMethodName(methodName) {
    const ret = this.camel2UnderlineComponentName  // eslint-disable-line
      ? camel2Underline(methodName)
      : this.camel2DashComponentName
        ? camel2Dash(methodName)
        : methodName;
    return ret;
  }

  getPath(value, methodName) {
    const fileName = this.fileName;
    return !this.customName
      ? replaceWinPath(pathModule.join(value, this.libraryDirectory, methodName, fileName))
      : this.customName(methodName);
  }

  pushStyle(specs, pathname) {
    let styleStr = '/style';
    if (this.style) {
      if (this.style === 'css') {
        styleStr = '/style/css';
      }
      const types = this.types;
      specs.push(
        types.importDeclaration([], types.stringLiteral(`${pathname}${styleStr}`))
      );
    }
  }

  ImportDeclaration(path) {
    if (!path.node) return;
    const types = this.types;
    const { source, specifiers = [] } = path.node;

    const { value } = source;
    if (value !== this.libraryName) return;
    let isAllImport = false;
    if (
      specifiers.length === 0
    ) {
      isAllImport = true;
    }
    const newSpecs = [];
    specifiers.forEach((spec) => {
      const { imported = {}, local, type: typeName } = spec;
      const importedName = this.transformedMethodName(imported.name || local.name);

      if (
        typeName !== 'ImportSpecifier'
        // typeName === 'ImportNamespaceSpecifier' ||
        // typeName === 'ImportDefaultSpecifier'
      ) {
        isAllImport = true;
        return;
      }
      const pathname = this.getPath(value, importedName);
      newSpecs.push(types.importDeclaration(
        [types.ImportDefaultSpecifier(
          types.identifier(local.name)
        )],
        types.stringLiteral(pathname)
      ));
      this.pushStyle(newSpecs, pathname);
    });

    if (isAllImport) return;

    path.replaceWithMultiple(newSpecs);
  }

  ExportNamedDeclaration(path) {
    if (!path.node) return;
    const types = this.types;
    const { source = {}, specifiers = [] } = path.node;
    const { value } = (source || {});
    if (value !== this.libraryName) return;
    let isAllImport = false;
    if (
      specifiers.length === 0
    ) {
      isAllImport = true;
    }

    const newSpecs = [];
    specifiers.forEach((spec) => {
      const { exported, local, type: typeName } = spec;
      if (
        typeName !== 'ExportSpecifier' ||
        local.name === 'default'
      ) {
        isAllImport = true;
        return;
      }
      const localName = this.transformedMethodName(local.name);
      const pathname = this.getPath(value, localName);
      newSpecs.push(types.exportNamedDeclaration(
        null,
        [types.exportSpecifier(
          types.identifier('default'),
          types.identifier(exported.name),
        )],
        types.stringLiteral(pathname)
      ));
      this.pushStyle(newSpecs, pathname);
    });

    if (isAllImport) return;

    path.replaceWithMultiple(newSpecs);
  }

}

exports.default = Plugin;
module.exports = exports.default;

/*

import { Button1 } from 'antd';
import { Row, Col as Col1 } from 'antd';
import { Row1, Col as Col3 } from 'antd';

import * as antd from 'antd';
import antd1 from 'antd';
import antd2, { Row as Row2 } from 'antd';
import 'antd';

export { Button1 } from 'antd';
export { Button as Btn } from 'antd';
export { Picker, Time } from 'antd';

export { default as bacnAntd3 } from 'antd';
export { Col1 }
export { }

=> => => => => => => => => => => => => =>

import Button1 from 'antd/lib/Button1';
import Row from 'antd/lib/Row';
import Col1 from 'antd/lib/Col';
import Row1 from 'antd/lib/Row1';
import Col3 from 'antd/lib/Col';


import * as antd from 'antd';
import antd1 from 'antd';
import antd2, { Row as Row2 } from 'antd';
import 'antd';

export { default as Button1 } from 'antd/lib/Button1';
export { default as Btn } from 'antd/lib/Button';
export { default as Picker } from 'antd/lib/Picker';
export { default as Time } from 'antd/lib/Time';


export { default as bacnAntd3 } from 'antd';
export { Col1 };
export {};

Test v1.5.0
    ✓ should work with as arguments
    ✓ should work with as arguments identifier
    ✓ should work with binary expression
    ✓ should work with conditions
    ✓ should work with custom name
    ✓ should work with execute direct
    ✓ should work with execute member
    ✓ should work with export import
    ✓ should work with expression statement
    ✓ should work with file name
    ✓ should work with import alias
  ✓ 1) should work with import css
    ✓ should work with material ui
    2) should work with member expression
    3) should work with modules false
  ✓ 4) should work with multiple libraries
  ✓ 5) should work with multiple libraries hilojs
    ✓ should work with multiple words
    ✓ should work with new expression
    ✓ should work with object shorthand
    ✓ should work with property
    ✓ should work with react element
    ✓ should work with react toolbox
    ✓ should work with return
    ✓ should work with specifier alias
    ✓ should work with variable declarator
    ✓ should work with variable scope

 */
