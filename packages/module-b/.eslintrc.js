const config = {
  parserOptions: {
    // 设置es6
    ecmaVersion: 6,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  root: true,
  extends: [
    // including ECMAScript 6+ and React.
    'airbnb',
  ],
  // 定义了一组预定义的全局变量
  env: {
    // 浏览器环境中的全局变量。
    browser: true,
    // Node.js 全局变量和 Node.js 作用域。
    node: true,
    jest: true,
  },

  rules: {
    semi: ['error', 'always'],
    quotes: ['error', 'single'],
  },
  overrides: [
    {
      // 覆盖上面定义的规则，针对测试用例文件不做eslint校验
      files: [
        '*.test.js',
        '.eslintrc.js',
        'babel.config.js',
        'config/**/*',
        'scripts/**/*',
      ],
      rules: {
        'import/no-extraneous-dependencies': 'off',
        'no-unused-vars': 'off',
      },
    },
  ],
};

module.exports = config;
