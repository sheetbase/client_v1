import config from './sheetbase';

export default {
    input: './dist/esm5/lib/api/index.js',
    output: [
        // {
        //     file: './dist/api/api.esm5.js',
        //     format: 'esm',
        //     sourcemap: true
        // },
        {
            file: './dist/sheetbase-api.js',
            format: 'umd',
            sourcemap: true,
            name: 'sheetbase'
        }
    ],
    plugins: config.plugins
};
