import config from './sheetbase';

export default {
    input: './dist/esm5/lib/mail/index.js',
    output: [
        {
            file: './dist/sheetbase-mail.js',
            format: 'umd',
            sourcemap: true,
            name: 'sheetbase'
        }
    ],
    plugins: config.plugins
};
