import config from './sheetbase';

export default {
    input: './dist/esm5/lib/auth/index.js',
    output: [
        {
            file: './dist/fesm5/sheetbase-auth.js',
            format: 'esm',
            sourcemap: true
        }
    ],
    plugins: config.plugins
};
