var webpack = require("webpack");

module.exports = [
  {
    output: {
      filename: "./index.js",
    },
    name: "index",
    entry: "./index.js",
    mode: "development",
    resolve: {
      extensions: ["", ".js", ".jsx"],
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          use: {
            loader: "babel-loader",
            options: {
              presets: ["@babel/preset-react"],
            },
          },
          exclude: [/node_modules/, /public/],
        },
        {
          test: /\.jsx$/,
          use: "react-hot!babel",
          exclude: [/node_modules/, /public/],
        },
      ],
    },
  },
];
