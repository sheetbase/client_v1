import { execSync } from 'child_process';
import { removeSync } from 'fs-extra';

(() => {

    const tsPath = (file: string) => 'scripts/tsconfigs/' + file;
    const rollupPath = (file: string) => 'scripts/rollup/' + file;

    const tsc = 'tsc -p';
    const rollup = 'rollup --silent -c';
    const minify = (file: string) => {
        // tslint:disable-next-line:max-line-length
        return `uglifyjs ${file} --compress --mangle --comments --source-map -o ${file.replace('.js', '.min.js')}`;
    };

    // clean
    removeSync('dist');
    console.log('[OK] Clean dist folder.');

    // transpile
    execSync(tsc + ' tsconfig.json'); // ES5
    execSync(tsc + ' ' + tsPath('tsconfig.es2015.json')); // ES2015
    console.log('[OK] Transpile code.');

    // bundle & minify
    execSync(rollup + ' ' + rollupPath('sheetbase.js'));
    execSync(rollup + ' ' + rollupPath('sheetbase.es2015.js'));
    execSync(minify('dist/sheetbase.js'));
    console.log('[OK] Bundle & minify app.');

    execSync(rollup + ' ' + rollupPath('api.js'));
    execSync(minify('dist/api.js'));
    console.log('[OK] Bundle & minify api.');

    execSync(rollup + ' ' + rollupPath('auth.js'));
    execSync(minify('dist/auth.js'));
    console.log('[OK] Bundle & minify auth.');

    execSync(rollup + ' ' + rollupPath('database.js'));
    execSync(minify('dist/database.js'));
    console.log('[OK] Bundle & minify database.');

    execSync(rollup + ' ' + rollupPath('mail.js'));
    execSync(minify('dist/mail.js'));
    console.log('[OK] Bundle & minify mail.');

    execSync(rollup + ' ' + rollupPath('storage.js'));
    execSync(minify('dist/storage.js'));
    console.log('[OK] Bundle & minify storage.');

})();