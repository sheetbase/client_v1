import config from './sheetbase';

export default {
    input: './dist/esm2015/lib/storage/index.js',
    output: [
        {
            file: './dist/fesm2015/sheetbase-storage.js',
            format: 'esm',
            sourcemap: true
        }
    ],
    plugins: config.plugins
};
