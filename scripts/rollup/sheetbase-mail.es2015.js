import config from './sheetbase';

export default {
    input: './dist/esm2015/lib/mail/index.js',
    output: [
        {
            file: './dist/fesm2015/sheetbase-mail.js',
            format: 'esm',
            sourcemap: true
        }
    ],
    plugins: config.plugins
};
