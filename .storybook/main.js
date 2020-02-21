const { getAliasesFromTsConfig } = require('../config/paths');

const customAliases = getAliasesFromTsConfig();

module.exports = {
  stories: ['../src/**/*.stories.tsx'],
  webpackFinal: async config => {
    /** Support TS path aliases */
    config.resolve.alias = {
      ...config.resolve.alias,
      ...customAliases,
    };

    config.module.rules.push({
      test: /\.(ts|tsx)$/,
      loader: require.resolve('babel-loader'),
      options: {
        presets: [['react-app', { flow: false, typescript: true }]],
      },
    });
    config.resolve.extensions.push('.ts', '.tsx');
    return config;
  },
};
