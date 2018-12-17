import config from './sheetbase';

export default {
    input: './dist/esm5/lib/database/index.js',
    output: [
        {
            file: './dist/database/database.js',
            format: 'esm',
            sourcemap: true
        },
        {
            file: './dist/database.js',
            format: 'umd',
            sourcemap: true,
            name: 'sheetbase'
        }
    ],
    plugins: config.plugins
};
