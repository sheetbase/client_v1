import config from './sheetbase';

export default {
    input: './dist/esm2015/lib/api/index.js',
    output: [
        {
            file: './dist/fesm2015/sheetbase-api.js',
            format: 'esm',
            sourcemap: true
        }
    ],
    plugins: config.plugins
};
