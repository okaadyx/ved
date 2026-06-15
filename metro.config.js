const { getDefaultConfig } = require("expo/metro-config");

const defaultConfig = getDefaultConfig(__dirname);

// Add 'mjs' and 'cjs' to sourceExts
defaultConfig.resolver.sourceExts = [
  ...defaultConfig.resolver.sourceExts,
  "mjs",
  "cjs",
];

module.exports = defaultConfig;
