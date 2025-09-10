module.exports = {
  env: {
    node: true,
    es2021: true
  },
  extends: [
    'eslint:recommended'
  ],
  plugins: ['jest'],
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module'
  },
  rules: {
    'no-console': 'off',
    'no-eval': 'warn',
    'indent': 'off',
    'no-unused-vars': 'warn',
    'no-undef': 'error'
  },
  overrides: [
    {
      files: ['test/**/*.js', '**/*.test.js'],
      env: {
        jest: true
      },
      extends: ['plugin:jest/recommended'],
      rules: {
        'jest/expect-expect': 'warn'
      }
    }
  ]
}
