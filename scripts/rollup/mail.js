import config from './sheetbase';

export default {
    input: './dist/esm5/lib/mail/mail.js',
    output: [
        {
            file: './dist/sheetbase-mail.js',
            format: 'umd',
            sourcemap: true,
            name: 'sheetbase.mail',
            exports: 'default',
        }
    ],
    plugins: config.plugins
};
