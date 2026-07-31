module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      // ... koi aur plugin ho to upar
      "react-native-worklets/plugin", // 👈 hamesha LAST hona chahiye
    ],
  };
};
