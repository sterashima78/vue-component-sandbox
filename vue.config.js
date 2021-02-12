module.exports = {
  chainWebpack: config => {
    config.externals({
      "@vue/composition-api": {
        commonjs2: "@vue/composition-api",
        commonjs: "@vue/composition-api",
        amd: "@vue/composition-api",
        root: "VueCompositionAPI"
      }
    });
  }
};
