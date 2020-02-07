module.exports = {
  parser: 'babel-eslint',
  parserOptions: {},
  extends: [
    'airbnb-base',
    'prettier',
    'eslint:recommended',
  ],
  plugins: ['prettier', 'import'],
  env: {
    browser: false,
    es6: true,
    node: true,
  },
  rules: {
    'prettier/prettier': 'error',
    'import/prefer-default-export': 'off',
  },
  settings: {
    'import/core-modules': [],
  },
};
