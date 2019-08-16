// http://eslint.org/docs/user-guide/configuring

module.exports = {
  root: false,
  parser: 'babel-eslint',
  parserOptions: {
    ecmaVersion: 2017,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  },
  env: {
    browser: true,
    es6: true,
    node: true
  },
  // required to lint *.vue files
  plugins: [
    'html'
  ],
  extends: 'eslint:recommended',
  // add your custom rules here
  'rules': {
    // allow debugger during development
    'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0,
    'no-console': 0,
    'no-fallthrough': 0,
    'eqeqeq': 2,
    'indent': [2, 'tab', {
      'SwitchCase': 1
    }],
    'space-before-blocks': 2,
    'space-before-function-paren': [2, {
      named: 'never'
    }],
    'space-infix-ops': 2,
    'space-unary-ops': 2,
    'spaced-comment': 1,
    'func-call-spacing': 2,
    'semi-spacing': 2,
    'comma-spacing': 2,
    'key-spacing': 2,
    'keyword-spacing': 2,
    'arrow-spacing': 2,
    'no-unused-vars': 0,
    'no-empty': 1,
    'no-extra-semi': 0,
    'no-unreachable': 1
  }
}
