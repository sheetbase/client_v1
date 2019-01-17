import config from './sheetbase';

export default {
    input: './dist/esm5/lib/api/index.js',
    output: [
        {
            file: './dist/fesm5/sheetbase-api.js',
            format: 'esm',
            sourcemap: true
        }
    ],
    plugins: config.plugins
};
