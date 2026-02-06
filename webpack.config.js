const path = require('path');

module.exports = {
    mode: 'development',
    target: 'electron-renderer',
    entry: './src/renderer/index.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'renderer.js'
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env', '@babel/preset-react']
                    }
                }
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            }
        ]
    },
    resolve: {
        extensions: ['.js', '.jsx']
    },
    devtool: 'source-map'
};
