// tslint:disable:max-line-length
import { execSync } from 'child_process';
import { removeSync } from 'fs-extra';

(() => {

    const tsPath = file => 'scripts/tsc/' + file;
    const rollupPath = file => 'scripts/rollup/' + file;

    const tsc = 'tsc -p';
    const rollup = 'rollup --silent -c';
    const minify = file => `uglifyjs ${file} --compress --mangle --comments --source-map -o ${file.replace('.js', '.min.js')}`;

    // clean
    console.log('+ Clean dist folder.');
    removeSync('dist');

    // transpile
    console.log('+ Transpile code.');
    execSync(tsc + ' tsconfig.json'); // ES5
    execSync(tsc + ' ' + tsPath('tsconfig.es2015.json')); // ES2015

    // bundle & minify
    console.log('+ Build: module');
    execSync(rollup + ' ' + rollupPath('sheetbase.js'));
    execSync(rollup + ' ' + rollupPath('sheetbase.es2015.js'));
    execSync(minify('dist/sheetbase.js'));

    console.log('+ Build: app');
    execSync(rollup + ' ' + rollupPath('app.js'));
    execSync(minify('dist/sheetbase-app.js'));

    console.log('+ Build: api');
    execSync(rollup + ' ' + rollupPath('api.js'));
    execSync(minify('dist/sheetbase-api.js'));

    console.log('+ Build: database');
    execSync(rollup + ' ' + rollupPath('database.js'));
    execSync(minify('dist/sheetbase-database.js'));

    console.log('+ Build: auth');
    execSync(rollup + ' ' + rollupPath('auth.js'));
    execSync(minify('dist/sheetbase-auth.js'));

    console.log('+ Build: storage');
    execSync(rollup + ' ' + rollupPath('storage.js'));
    execSync(minify('dist/sheetbase-storage.js'));

    console.log('+ Build: mail');
    execSync(rollup + ' ' + rollupPath('mail.js'));
    execSync(minify('dist/sheetbase-mail.js'));

})();