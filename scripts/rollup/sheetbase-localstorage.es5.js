import config from './sheetbase';

export default {
    input: './dist/esm5/lib/localstorage/index.js',
    output: [
        {
            file: './dist/fesm5/sheetbase-localstorage.js',
            format: 'esm',
            sourcemap: true
        }
    ],
    plugins: config.plugins
};
