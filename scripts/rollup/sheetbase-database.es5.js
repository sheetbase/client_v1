import config from './sheetbase';

export default {
    input: './dist/esm5/lib/database/index.js',
    output: [
        {
            file: './dist/fesm5/sheetbase-database.js',
            format: 'esm',
            sourcemap: true
        }
    ],
    plugins: config.plugins
};
