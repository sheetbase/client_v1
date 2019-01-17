import config from './sheetbase';

export default {
    input: './dist/esm5/lib/auth/auth.js',
    output: [
        {
            file: './dist/sheetbase-auth.js',
            format: 'umd',
            sourcemap: true,
            name: 'sheetbase.auth',
            exports: 'default',
        }
    ],
    plugins: config.plugins
};
