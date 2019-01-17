import config from './sheetbase';

export default {
    input: './dist/esm5/lib/app/app.js',
    output: [
        {
            file: './dist/sheetbase-app.js',
            format: 'umd',
            sourcemap: true,
            name: 'sheetbase'
        }
    ],
    plugins: config.plugins
};
