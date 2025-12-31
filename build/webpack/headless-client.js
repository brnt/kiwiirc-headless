const path = require('path');
const webpack = require('webpack');

module.exports = {
    mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
    entry: path.resolve(__dirname, '../../src/libs/headless/index.js'),
    output: {
        path: path.resolve(__dirname, '../../dist/headless'),
        filename: 'kiwi-headless-client.js',
        library: 'KiwiHeadlessClient',
        libraryTarget: 'umd',
        globalObject: 'this',
    },
    resolve: {
        extensions: ['.js', '.json'],
        alias: {
            '@': path.resolve(__dirname, '../../src'),
        },
        fallback: {
            stream: require.resolve('stream-browserify'),
        },
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    // Use project's babel config
                },
            },
        ],
    },
    plugins: [
        new webpack.ProvidePlugin({
            Buffer: ['buffer', 'Buffer'],
        }),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
        }),
        // Replace PluginWrapper with stub for headless build
        new webpack.NormalModuleReplacementPlugin(
            /^@\/components\/utils\/PluginWrapper$/,
            path.resolve(__dirname, '../../src/libs/headless/stubs/PluginWrapper.js')
        ),
    ],
    // Vue is bundled with the headless client for self-contained distribution
    // No externals needed
    optimization: {
        minimize: process.env.NODE_ENV === 'production',
    },
    devtool: process.env.NODE_ENV === 'production' ? false : 'source-map',
    performance: {
        // Suppress warnings for library bundle - size is expected
        hints: false,
        maxEntrypointSize: Infinity,
        maxAssetSize: Infinity,
    },
};
