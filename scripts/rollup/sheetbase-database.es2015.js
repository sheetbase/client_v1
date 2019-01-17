import config from './sheetbase';

export default {
    input: './dist/esm2015/lib/database/index.js',
    output: [
        {
            file: './dist/fesm2015/sheetbase-database.js',
            format: 'esm',
            sourcemap: true
        }
    ],
    plugins: config.plugins
};
