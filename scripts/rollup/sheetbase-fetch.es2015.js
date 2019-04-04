import config from './sheetbase';

export default {
    input: './dist/esm2015/lib/fetch/index.js',
    output: [
        {
            file: './dist/fesm2015/sheetbase-fetch.js',
            format: 'esm',
            sourcemap: true
        }
    ],
    plugins: config.plugins
};
