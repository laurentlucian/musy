/** @type {import("eslint").Linter.Config} */
module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:import/typescript',
    'plugin:typescript-sort-keys/recommended',
    'prettier',
    '@remix-run/eslint-config',
    '@remix-run/eslint-config/node',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 'latest',
    project: ['./tsconfig.json'],
    sourceType: 'module',
    tsconfigRootDir: __dirname,
  },
  plugins: [
    'import',
    'sort-keys',
    'sort-destructure-keys',
    'typescript-sort-keys',
    'eslint-plugin-import-helpers',
  ],
  root: true,
  rules: {
    '@typescript-eslint/ban-ts-comment': [
      'warn',
      {
        'ts-expect-error': 'allow-with-description',
      },
    ],
    '@typescript-eslint/consistent-type-imports': 'error',
    '@typescript-eslint/no-empty-function': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-floating-promises': 'error',
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/no-unused-vars': [
      'warn',
      {
        argsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
        destructuredArrayIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      },
    ],
    '@typescript-eslint/prefer-enum-initializers': 'error',
    'dot-notation': 'error',
    eqeqeq: ['error', 'always', { null: 'ignore' }],
    'import-helpers/order-imports': [
      'error',
      {
        alphabetize: { ignoreCase: true, order: 'asc' },
        groups: [
          '/^react|@remix-run/',
          '/chakra/',
          'module',
          '/^~/',
          ['sibling', 'parent'],
          'absolute',
          'index',
        ],
        newlinesBetween: 'always',
      },
    ],
    'import/no-unused-modules': ['error'],
    'no-array-constructor': 'error',
    'no-bitwise': 'error',
    'no-multi-assign': 'error',
    'no-multi-spaces': 'error',
    'no-var': 'error',

    // will be problematic with chakra
    'react/jsx-sort-props': 'off',

    'react/no-unescaped-entities': 'warn',
    'react/no-unknown-property': ['error'],
    'sort-destructure-keys/sort-destructure-keys': 'error',
    'sort-keys/sort-keys-fix': 'error',
  },

  settings: {
    'import/extensions': ['.js', '.jsx', '.ts', '.tsx'],
    'import/parsers': {
      '@typescript-eslint/parser': ['.js', '.jsx', '.ts', '.tsx'],
    },
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
      },
    },
  },
};
