import config from './sheetbase';

export default {
    input: './dist/esm5/lib/auth/index.js',
    output: [
        {
            file: './dist/auth/auth.js',
            format: 'esm',
            sourcemap: true
        },
        {
            file: './dist/auth.js',
            format: 'umd',
            sourcemap: true,
            name: 'sheetbase'
        }
    ],
    plugins: config.plugins
};
