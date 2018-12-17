import config from './sheetbase';

export default {
    input: './dist/esm5/lib/mail/index.js',
    output: [
        {
            file: './dist/mail/mail.js',
            format: 'esm',
            sourcemap: true
        },
        {
            file: './dist/mail.js',
            format: 'umd',
            sourcemap: true,
            name: 'sheetbase'
        }
    ],
    plugins: config.plugins
};
