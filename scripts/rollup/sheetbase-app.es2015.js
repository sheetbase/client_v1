import config from './sheetbase';

export default {
    input: './dist/esm2015/lib/app/index.js',
    output: [
        {
            file: './dist/fesm2015/sheetbase-app.js',
            format: 'esm',
            sourcemap: true
        }
    ],
    plugins: config.plugins
};
