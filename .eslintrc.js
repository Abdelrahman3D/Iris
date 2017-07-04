module.exports = {
  root: true,
  parser: 'babel-eslint',
  env: {
    browser: true,
    node: true,
    es6: true
  },
  extends: 'airbnb-base',
  // required to lint *.vue files
  plugins: [
    'html'
  ],
  // add your custom rules here
  rules: {
    'no-shadow': 0,
    'no-param-reassign': 0,
    'indent': [
      'warn',
      2
    ],
    'semi': [
        'error',
        'always'
    ],
    'linebreak-style': 0,
    'comma-dangle': 0,
    'arrow-parens': 0,
    'no-new': 0,
    'no-plusplus': 0,
    'space-unary-ops': 0,
    'import/extensions': ['off', 'never'],
    'import/no-unresolved': 'off',
    'keyword-spacing': ['error', { 'overrides' : {
        if: { after: true },
        return: { after: true }
      }
    }]
  },
  globals: {}
}
