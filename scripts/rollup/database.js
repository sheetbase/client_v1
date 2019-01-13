import config from './sheetbase';

export default {
    input: './dist/esm5/lib/database/index.js',
    output: [
        {
            file: './dist/sheetbase-database.js',
            format: 'umd',
            sourcemap: true,
            name: 'sheetbase'
        }
    ],
    plugins: config.plugins
};
