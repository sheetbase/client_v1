import config from './sheetbase';

export default {
    input: './dist/esm5/lib/database/index.js',
    output: [
        // {
        //     file: './dist/database/database.esm5.js',
        //     format: 'esm',
        //     sourcemap: true
        // },
        {
            file: './dist/sheetbase-database.js',
            format: 'umd',
            sourcemap: true,
            name: 'sheetbase'
        }
    ],
    plugins: config.plugins
};
