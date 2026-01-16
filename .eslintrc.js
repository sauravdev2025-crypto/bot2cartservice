module.exports = {
  extends: 'nestjs',
  root: true,
  env: {
    node: true,
    jest: true,
  },
  rules: {
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/camelcase': 'off',
  },
  overrides: [
    {
      files: ['**/abc/**/*.ts'],
    },
  ],
};
