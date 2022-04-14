const rules = require('./webpack.rules');
const plugins = require('./webpack.plugins');

rules.push({
  test: /\.css$/,
  use: [{ loader: 'style-loader' }, { loader: 'css-loader' }],
},
{
  test: /\.mp3$/,
  loader: 'file-loader',
  options: {
    name: '[path][name].[ext]',
  },
},{
  test: /\.(png|svg|jpg|jpeg|gif)$/i,
  type: 'asset/resource',
}
);

module.exports = {
  module: {
    rules,
  },
  plugins: plugins,
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css']
  },
};
