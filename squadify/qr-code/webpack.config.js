var webpack = require("webpack");

module.exports = [
  {
    output: {
      filename: "./index.js",
    },
    name: "index",
    entry: "./ui/index.js",
    mode: "development",
    resolve: {
      extensions: ["", ".js", ".jsx"],
    },
    module: {
      rules: [
        {
          test: /\.jsx?$/,
          use: {
            loader: "babel-loader",
            options: {
              presets: ["@babel/preset-react"],
            },
          },
          exclude: [/node_modules/, /public/],
        },
        {
          test: /\.css$/i,
          use: ["style-loader", "css-loader"],
        },
      ],
    },
  },
];
