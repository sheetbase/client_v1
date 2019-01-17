import config from './sheetbase';

export default {
    input: './dist/esm2015/lib/auth/index.js',
    output: [
        {
            file: './dist/fesm2015/sheetbase-auth.js',
            format: 'esm',
            sourcemap: true
        }
    ],
    plugins: config.plugins
};
