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
  plugins: [require.resolve('prettier-plugin-tailwindcss')],
  tailwindConfig: 'tailwind.config.ts',
};
