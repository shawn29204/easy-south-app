// config-overrides.js
const webpack = require('webpack');

module.exports = function override(config, env) {
  config.resolve.fallback = {
    ...config.resolve.fallback,
    "stream": require.resolve("stream-browserify"),
    "crypto": require.resolve("crypto-browserify"),
    "http": require.resolve("stream-http"),
    "https": require.resolve("https-browserify"),
    "os": require.resolve("os-browserify/browser"),
    "url": require.resolve("url"),
    "buffer": require.resolve("buffer"),
    "assert": require.resolve("assert"),
    "querystring": require.resolve("querystring-es3"),
    "path": require.resolve("path-browserify"),
    "child_process": false,
    "fs": false,
    "tls": false, // <-- ADD THIS LINE
    "net": false, // <-- ADD THIS LINE
  };
  
  config.plugins = (config.plugins || []).concat([
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer'],
    }),
  ]);

  return config;
};