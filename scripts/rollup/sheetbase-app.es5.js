import config from './sheetbase';

export default {
    input: './dist/esm5/lib/app/index.js',
    output: [
        {
            file: './dist/fesm5/sheetbase-app.js',
            format: 'esm',
            sourcemap: true
        }
    ],
    plugins: config.plugins
};
