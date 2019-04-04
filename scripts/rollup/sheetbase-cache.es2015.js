import config from './sheetbase';

export default {
    input: './dist/esm2015/lib/cache/index.js',
    output: [
        {
            file: './dist/fesm2015/sheetbase-cache.js',
            format: 'esm',
            sourcemap: true
        }
    ],
    plugins: config.plugins
};
