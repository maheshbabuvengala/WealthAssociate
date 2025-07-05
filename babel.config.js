module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      // Add these if needed
      "@babel/plugin-transform-modules-commonjs",
      "react-native-web",
    ],
  };
};
