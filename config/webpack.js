require('dotenv').config({ path: '.env.local' });

const path = require('path');
const glob = require('glob');

const PORT = process.env.PORT || 3002;

const BundleAnalyzerPlugin =
  require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

// Get paths from .elsie.js
const { api, containers } = require(path.resolve(process.cwd(), './.elsie.js'));

const elsiePaths = {
  api: api ? path.resolve(process.cwd(), api.root) : undefined,

  containers: containers
    ? path.resolve(process.cwd(), containers.root)
    : undefined,
};

module.exports = (env, argv) => {
  console.log(`webpack mode ${argv.mode}`);

  return {
    name: 'esm-bundle',

    context: path.resolve(process.cwd(), './src'),

    devtool:
      argv.mode === 'development' ? 'cheap-module-source-map' : undefined,

    experiments: {
      outputModule: true,
    },

    entry: {
      // Render
      render: {
        import: path.resolve(process.cwd(), './src/render/index.ts'),
      },

      // API
      api: {
        // get path to api root from .elsie.js
        import: elsiePaths.api
          ? path.resolve(elsiePaths.api, 'index.ts')
          : undefined,
      },

      // Containers
      ...(elsiePaths.containers
        ? glob
            .sync(path.resolve(elsiePaths.containers, '**/*/index.ts'))
            .reduce((entries, entry) => {
              const containerRegEx = new RegExp(
                `${elsiePaths.containers}/(.*)/index.ts`
              );
              const key = entry.match(containerRegEx)[1];

              return {
                ...entries,
                [`containers/${key}`]: {
                  import: entry,
                },
              };
            }, {})
        : {}),
    },

    output: {
      path: path.resolve(process.cwd(), 'dist'),
      filename: `[name].js`,
      library: {
        type: 'module',
      },
      module: true,
      chunkLoading: 'import',
      chunkFormat: 'module',
    },

    externals: {
      preact: '@dropins/elsie/preact.js',
      'preact/compat': '@dropins/elsie/preact-compat.js',
      'preact/hooks': '@dropins/elsie/preact-hooks.js',
      'preact/jsx-runtime': '@dropins/elsie/preact-jsx-runtime.js',
      '@adobe/event-bus': '@dropins/elsie/event-bus.js',
      '@adobe/fetch-graphql': '@dropins/elsie/fetch-graphql.js',
    },

    optimization: {
      runtimeChunk: 'single',
      splitChunks: {
        chunks: 'all',
      },
    },

    performance: {
      maxAssetSize: 500000,
      maxEntrypointSize: 500000,
      hints: 'error',
    },

    devServer: {
      compress: true,
      port: PORT,
      allowedHosts: 'all',
      hot: false,
      client: {
        progress: true,
      },
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods':
          'GET, POST, PUT, DELETE, PATCH, OPTIONS',
        'Access-Control-Allow-Headers':
          'X-Requested-With, content-type, Authorization',
      },
    },

    module: {
      rules: [
        {
          test: /\.tsx?$/,
          loader: 'babel-loader',
        },
        {
          test: /\.css$/i,
          use: ['style-loader', 'css-loader'],
          sideEffects: true,
        },
        {
          test: /\.svg$/,
          issuer: /\.tsx?$/,
          use: ['@svgr/webpack'],
        },
      ],
    },

    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.jsx', '.mjs'],

      alias: {
        react: 'preact/compat',
        'react-dom/test-utils': 'preact/test-utils',
        'react-dom': 'preact/compat', // Must be below test-utils
        'react/jsx-runtime': 'preact/jsx-runtime',
      },
    },

    plugins: [
      new BundleAnalyzerPlugin({
        analyzerMode: process.env.ANALYZE ? 'server' : 'disabled',
      }),
    ],
  };
};
