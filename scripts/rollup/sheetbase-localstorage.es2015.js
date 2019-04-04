import config from './sheetbase';

export default {
    input: './dist/esm2015/lib/localstorage/index.js',
    output: [
        {
            file: './dist/fesm2015/sheetbase-localstorage.js',
            format: 'esm',
            sourcemap: true
        }
    ],
    plugins: config.plugins
};
