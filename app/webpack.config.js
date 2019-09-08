const path = require('path');
var nodeExternals = require('webpack-node-externals');
const JavaScriptObfuscator = require('webpack-obfuscator');


module.exports = {
    entry: './index.js',
    output: {
        path: path.resolve(__dirname),
        filename: 'index.bundle.js'
    },
    node: {
        __dirname: false,
        __filename: false,
        console: 'mock'
    },
    mode: 'production',
    target: 'node',   // THIS IS THE IMPORTANT PART
    externals: [nodeExternals()],
    plugins: [
        new JavaScriptObfuscator({
            rotateUnicodeArray: true
        }, [])
    ]
};