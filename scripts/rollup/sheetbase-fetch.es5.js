import config from './sheetbase';

export default {
    input: './dist/esm5/lib/fetch/index.js',
    output: [
        {
            file: './dist/fesm5/sheetbase-fetch.js',
            format: 'esm',
            sourcemap: true
        }
    ],
    plugins: config.plugins
};
