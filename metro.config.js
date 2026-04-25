const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Polyfill módulos Node usados por react-native-svg
config.resolver.extraNodeModules = {
  buffer: require.resolve('buffer/'),
  stream: require.resolve('stream-browserify'),
};

module.exports = config;
