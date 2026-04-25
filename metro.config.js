const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Polyfill para módulos Node usados por react-native-svg
config.resolver.extraNodeModules = {
  buffer: require.resolve('buffer'),
};

module.exports = config;
