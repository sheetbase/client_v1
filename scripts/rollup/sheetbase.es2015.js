import config from './sheetbase';

export default {
    input: './dist/esm2015/sheetbase.js',
    output: [
        {
            file: './dist/fesm2015/sheetbase.js',
            format: 'esm',
            sourcemap: true
        }
    ],
    plugins: config.plugins
};
