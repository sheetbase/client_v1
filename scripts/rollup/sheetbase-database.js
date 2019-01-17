import config from './sheetbase';

export default {
    input: './dist/esm5/lib/database/database.js',
    output: [
        {
            file: './dist/sheetbase-database.js',
            format: 'umd',
            sourcemap: true,
            name: 'sheetbase.database',
            exports: 'default',
        }
    ],
    plugins: config.plugins
};
