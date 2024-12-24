const { override, addWebpackModuleRule, addWebpackAlias, addBabelPlugin } = require('customize-cra');
const path = require('path');

module.exports = override(
  addWebpackModuleRule({
    test: /\.mjs$/,
    include: /node_modules/,
    type: 'javascript/auto',
  }),
  addWebpackAlias({
    '@unique-nft/utils/address': path.resolve(__dirname, 'node_modules/@unique-nft/utils/address.mjs'),
    '@unique-nft/schemas/pure': path.resolve(__dirname, 'node_modules/@unique-nft/schemas/pure.mjs'),
    '@unique-nft/utils/string': path.resolve(__dirname, 'node_modules/@unique-nft/utils/string.mjs')
  }),
  // Add the Babel plugin for importAttributes
  addBabelPlugin('@babel/plugin-syntax-import-attributes'),
  (config) => {
    config.resolve.extensions = [...config.resolve.extensions, '.mjs'];
    return config;
  }
);
