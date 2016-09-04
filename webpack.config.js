module.exports = {
    entry: './src/home/main.js',
    output: {
        path: `./app/home/js`,
        filename: `bundle.home.js`
    },
    module: {
        loaders: [{
            test: /\.js$/,
            exclude: /node-modules/,
            loader: 'babel-loader',
            query: {
                presets: ['es2015']
            }
        }]
    }
};
