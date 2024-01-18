/** @type {import("prettier").Config} */
module.exports = {
  arrowParens: 'always',
  endOfLine: 'auto',
  printWidth: 100,
  singleQuote: true,
  jsxSingleQuote: true,
  semi: true,
  trailingComma: 'all',
  tabWidth: 2,
  plugins: [
    require.resolve('prettier-plugin-tailwindcss'),
    'prettier-plugin-classnames',
    'prettier-plugin-merge',
  ],
  tailwindConfig: 'tailwind.config.ts',
  customAttributes: ['className'],
  customFunctions: ['classNames'],
};
