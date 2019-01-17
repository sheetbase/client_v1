import config from './sheetbase';

export default {
    input: './dist/esm5/lib/mail/index.js',
    output: [
        {
            file: './dist/fesm5/sheetbase-mail.js',
            format: 'esm',
            sourcemap: true
        }
    ],
    plugins: config.plugins
};
