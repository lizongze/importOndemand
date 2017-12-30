module.exports = {
  extends: 'eslint-config-rnx',
  globals: {
    __DEV__: false,
    B: false,
    window: false,
    document: false,
    fetch: false,
  },
  rules: {
    'jsx-a11y/no-static-element-interactions': ['off']
  }
}
