import config from './sheetbase';

export default {
    input: './dist/esm5/lib/mail/index.js',
    output: [
        // {
        //     file: './dist/mail/mail.esm5.js',
        //     format: 'esm',
        //     sourcemap: true
        // },
        {
            file: './dist/sheetbase-mail.js',
            format: 'umd',
            sourcemap: true,
            name: 'sheetbase'
        }
    ],
    plugins: config.plugins
};
