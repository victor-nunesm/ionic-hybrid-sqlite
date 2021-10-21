let webpack = require("webpack");
let path = require("path");

module.exports = {
  mode: "development",
  plugins: [
    new webpack.NormalModuleReplacementPlugin(/typeorm$/, function (result) {
      result.request = result.request.replace(/typeorm/, "typeorm/browser");
    }),
    new webpack.ProvidePlugin({
      "window.SQL": path.join(
        __dirname,
        "../node_modules/sql.js/dist/sql-asm.js"
      ),
    }),
  ],
  node: {},
  resolve: {
    fallback: {
      fs: false,
      path: false,
    },
  },
};
