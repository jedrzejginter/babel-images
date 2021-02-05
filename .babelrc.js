const { join } = require('path');

module.exports = {
  plugins: [
    [
      require.resolve('./babel-plugin.js'),
      {
        // output files here
        // default: process.cwd() + '/out'
        outDir: join(__dirname, 'out'),

        // resolve images against this directory
        // default: process.cwd()
        resolveDir: __dirname,
      },
    ],
  ],
};
