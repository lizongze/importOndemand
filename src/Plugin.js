/* eslint-disable new-cap */
function camel2Dash(_str) {
  const str = _str[0].toLowerCase() + _str.substr(1);
  return str.replace(/([A-Z])/g, $1 => `-${$1.toLowerCase()}`);
}

function camel2Underline(_str) {
  const str = _str[0].toLowerCase() + _str.substr(1);
  const ret = str.replace(/([A-Z])/g, $1 => `_${$1.toLowerCase()}`);
  return ret;
}

class Plugin {
  constructor(
    libraryName,
    libraryDirectory = 'lib',
    camel2DashComponentName,
    camel2UnderlineComponentName,
    customName = v => v,
    types
  ) {
    this.libraryName = libraryName;
    this.libraryDirectory = libraryDirectory;
    this.camel2DashComponentName = camel2DashComponentName;
    this.camel2UnderlineComponentName = camel2UnderlineComponentName;
    this.customName = customName;
    this.types = types;
  }

  transformedMethodName(methodName) {
    const ret = this.camel2UnderlineComponentName  // eslint-disable-line
      ? camel2Underline(methodName)
      : this.camel2DashComponentName
        ? camel2Dash(methodName)
        : methodName;
    return this.customName(ret);
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

    const newSpecs = specifiers.map((spec) => {
      const { imported = {}, local, type: typeName } = spec;
      const importedName = imported.name || local.name;
      if (
        typeName !== 'ImportSpecifier'
        // typeName === 'ImportNamespaceSpecifier' ||
        // typeName === 'ImportDefaultSpecifier'
      ) {
        isAllImport = true;
        return undefined;
      }

      return types.importDeclaration(
        [types.ImportDefaultSpecifier(
          types.identifier(local.name)
        )],
        types.stringLiteral(
          `${value}/${this.libraryDirectory}/${
            this.transformedMethodName(importedName)
          }`
        )
      );
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

    const newSpecs = specifiers.map((spec) => {
      const { exported, local, type: typeName } = spec;
      if (
        typeName !== 'ExportSpecifier' ||
        local.name === 'default'
      ) {
        isAllImport = true;
        return undefined;
      }

      return types.exportNamedDeclaration(
        null,
        [types.exportSpecifier(
          types.identifier('default'),
          types.identifier(exported.name),
        )],
        types.stringLiteral(
          `${value}/${this.libraryDirectory}/${
            this.transformedMethodName(local.name)
          }`
        )
      );
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

 */
