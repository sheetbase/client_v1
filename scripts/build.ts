// tslint:disable:max-line-length
import { execSync } from 'child_process';
import { removeSync, outputJSONSync } from 'fs-extra';
const version = require('../../package.json').version;

(() => {

    const tsc = configFile => 'tsc -p scripts/tsc/' + configFile;
    const rollup = configFile => 'rollup --silent -c scripts/rollup/' + configFile;
    const minify = file => `uglifyjs ${file} --compress --mangle --comments --source-map -o ${file.replace('.js', '.min.js')}`;

    console.log('+ Clean dist folder.');
    removeSync('dist');
    removeSync('app');
    removeSync('api');
    removeSync('auth');
    removeSync('database');
    removeSync('storage');
    removeSync('mail');

    console.log('+ Build: module');
    execSync(tsc('sheetbase.json'));
    execSync(tsc('sheetbase.es2015.json'));
    execSync(rollup('sheetbase.js'));
    execSync(rollup('sheetbase.es2015.js'));
    execSync(minify('dist/sheetbase.js'));

    console.log('+ Build: app');
    execSync(rollup('sheetbase-app.js'));
    execSync(rollup('sheetbase-app.es5.js'));
    execSync(rollup('sheetbase-app.es2015.js'));
    execSync(minify('dist/sheetbase-app.js'));
    outputJSONSync('./app/package.json', {
        name: '@sheetbase/client-app',
        version,
        main: '../dist/sheetbase-app.js',
        module: '../dist/fesm5/sheetbase-app.js',
        es2015: '../dist/fesm2015/sheetbase-app.js',
        esm5: '../dist/esm5/lib/app/index.js',
        esm2015: '../dist/esm2015/lib/app/index.js',
        fesm5: '../dist/fesm5/sheetbase-app.js',
        fesm2015: '../dist/fesm2015/sheetbase-app.js',
        typings: '../dist/sheetbase.d.ts',
    }, { spaces: 2 });

    console.log('+ Build: api');
    execSync(rollup('sheetbase-api.js'));
    execSync(rollup('sheetbase-api.es5.js'));
    execSync(rollup('sheetbase-api.es2015.js'));
    execSync(minify('dist/sheetbase-api.js'));
    outputJSONSync('./api/package.json', {
        name: '@sheetbase/client-api',
        version,
        main: '../dist/sheetbase-api.js',
        module: '../dist/fesm5/sheetbase-api.js',
        es2015: '../dist/fesm2015/sheetbase-api.js',
        esm5: '../dist/esm5/lib/api/index.js',
        esm2015: '../dist/esm2015/lib/api/index.js',
        fesm5: '../dist/fesm5/sheetbase-api.js',
        fesm2015: '../dist/fesm2015/sheetbase-api.js',
        typings: '../dist/lib/api/index.d.ts',
    }, { spaces: 2 });

    console.log('+ Build: auth');
    execSync(rollup('sheetbase-auth.js'));
    execSync(rollup('sheetbase-auth.es5.js'));
    execSync(rollup('sheetbase-auth.es2015.js'));
    execSync(minify('dist/sheetbase-auth.js'));
    outputJSONSync('./auth/package.json', {
        name: '@sheetbase/client-auth',
        version,
        main: '../dist/sheetbase-auth.js',
        module: '../dist/fesm5/sheetbase-auth.js',
        es2015: '../dist/fesm2015/sheetbase-auth.js',
        esm5: '../dist/esm5/lib/auth/index.js',
        esm2015: '../dist/esm2015/lib/auth/index.js',
        fesm5: '../dist/fesm5/sheetbase-auth.js',
        fesm2015: '../dist/fesm2015/sheetbase-auth.js',
        typings: '../dist/lib/auth/index.d.ts',
    }, { spaces: 2 });

    console.log('+ Build: database');
    execSync(rollup('sheetbase-database.js'));
    execSync(rollup('sheetbase-database.es5.js'));
    execSync(rollup('sheetbase-database.es2015.js'));
    execSync(minify('dist/sheetbase-database.js'));
    outputJSONSync('./database/package.json', {
        name: '@sheetbase/client-database',
        version,
        main: '../dist/sheetbase-database.js',
        module: '../dist/fesm5/sheetbase-database.js',
        es2015: '../dist/fesm2015/sheetbase-database.js',
        esm5: '../dist/esm5/lib/database/index.js',
        esm2015: '../dist/esm2015/lib/database/index.js',
        fesm5: '../dist/fesm5/sheetbase-database.js',
        fesm2015: '../dist/fesm2015/sheetbase-database.js',
        typings: '../dist/lib/database/index.d.ts',
    }, { spaces: 2 });

    console.log('+ Build: storage');
    execSync(rollup('sheetbase-storage.js'));
    execSync(rollup('sheetbase-storage.es5.js'));
    execSync(rollup('sheetbase-storage.es2015.js'));
    execSync(minify('dist/sheetbase-storage.js'));
    outputJSONSync('./storage/package.json', {
        name: '@sheetbase/client-storage',
        version,
        main: '../dist/sheetbase-storage.js',
        module: '../dist/fesm5/sheetbase-storage.js',
        es2015: '../dist/fesm2015/sheetbase-storage.js',
        esm5: '../dist/esm5/lib/storage/index.js',
        esm2015: '../dist/esm2015/lib/storage/index.js',
        fesm5: '../dist/fesm5/sheetbase-storage.js',
        fesm2015: '../dist/fesm2015/sheetbase-storage.js',
        typings: '../dist/lib/storage/index.d.ts',
    }, { spaces: 2 });

    console.log('+ Build: mail');
    execSync(rollup('sheetbase-mail.js'));
    execSync(rollup('sheetbase-mail.es5.js'));
    execSync(rollup('sheetbase-mail.es2015.js'));
    execSync(minify('dist/sheetbase-mail.js'));
    outputJSONSync('./mail/package.json', {
        name: '@sheetbase/client-mail',
        version,
        main: '../dist/sheetbase-mail.js',
        module: '../dist/fesm5/sheetbase-mail.js',
        es2015: '../dist/fesm2015/sheetbase-mail.js',
        esm5: '../dist/esm5/lib/mail/index.js',
        esm2015: '../dist/esm2015/lib/mail/index.js',
        fesm5: '../dist/fesm5/sheetbase-mail.js',
        fesm2015: '../dist/fesm2015/sheetbase-mail.js',
        typings: '../dist/lib/mail/index.d.ts',
    }, { spaces: 2 });

})();