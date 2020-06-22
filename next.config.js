const withPlugins = require('next-compose-plugins');
// const withTM = require('next-transpile-modules');

// Use the hidden-source-map option when you don't want the source maps to be
// publicly available on the servers, only to the error reporting
const withSourceMaps = require('@zeit/next-source-maps')();

// Use the SentryWebpack plugin to upload the source maps during build step
// const SentryWebpackPlugin = require('@sentry/webpack-plugin');

module.exports = withPlugins(
  [/*withTM(['dom7', 'swiper', 'body-scroll-lock']),*/ withSourceMaps],
  {
    webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
      /** Support import svg as React component */
      config.module.rules.push({
        test: /\.svg$/,
        use: ['@svgr/webpack?-svgo,+titleProp,+ref![path]', 'url-loader'],
      });

      /** Images loader */
      config.module.rules.push({
        test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/, /\.webp$/],
        use: [
          {
            loader: require.resolve('url-loader'),
            options: {
              limit: 8192,
              name: '[name]-[contenthash].[ext]',
              publicPath: `/_next/static/images/`,
              outputPath: `${isServer ? '../' : ''}static/images/`,
            },
          },
        ],
      });

      /**
       * How to add polyfills in Next.js
       * Source: https://github.com/zeit/next.js/tree/canary/examples/with-polyfills
       */
      if (process.env.NODE_ENV === 'production') {
        const originalEntry = config.entry;
        config.entry = async () => {
          const entries = await originalEntry();
          const polyfillsRelativePath = './src/polyfills/index.js';

          if (
            entries['main.js'] &&
            !entries['main.js'].includes(polyfillsRelativePath)
          ) {
            entries['main.js'].unshift(polyfillsRelativePath);
          }

          return entries;
        };
      }

      /**
       * In `pages/_app.js`, Sentry is imported from @sentry/node. While
       * @sentry/browser will run in a Node.js environment, @sentry/node will use
       * Node.js-only APIs to catch even more unhandled exceptions.
       * This works well when Next.js is SSRing your page on a server with
       * Node.js, but it is not what we want when your client-side bundle is being
       * executed by a browser.
       *
       * Luckily, Next.js will call this webpack function twice, once for the
       * server and once for the client. Read more:
       * https://nextjs.org/docs#customizing-webpack-config
       *
       * So ask Webpack to replace @sentry/node imports with @sentry/browser when
       * building the browser's bundle

       */
      if (!isServer) {
        config.resolve.alias['@sentry/node'] = '@sentry/browser';
      }

      /**
       * When all the Sentry configuration env variables are available/configured
       * The Sentry webpack plugin gets pushed to the webpack plugins to build
       * and upload the source maps to sentry.
       * This is an alternative to manually uploading the source maps
       */
      // if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
      //   config.plugins.push(
      //     new SentryWebpackPlugin({
      //       include: '.next',
      //       ignore: ['node_modules'],
      //       urlPrefix: '~/_next',
      //     }),
      //   );
      // }

      return config;
    },
  }
);
