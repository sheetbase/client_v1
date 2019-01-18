// tslint:disable:max-line-length
import { execSync } from 'child_process';
import { removeSync, outputJSONSync } from 'fs-extra';
const version = require('../../package.json').version;

(() => {

    const tsc = (configFile: string) => 'tsc -p scripts/tsc/' + configFile;
    const rollup = (configFile: string) => 'rollup --silent -c scripts/rollup/' + configFile;
    const minify = (file: string) => `uglifyjs ${file} --compress --mangle --comments --source-map -o ${file.replace('.js', '.min.js')}`;
    const packageJson = (name: string, override = {}) => {
        outputJSONSync(`./${name}/package.json`, {
            name: `@sheetbase/client-${name}`,
            version,
            main: `../dist/sheetbase-${name}.js`,
            module: `../dist/fesm5/sheetbase-${name}.js`,
            es2015: `../dist/fesm2015/sheetbase-${name}.js`,
            esm5: `../dist/esm5/lib/${name}/index.js`,
            esm2015: `../dist/esm2015/lib/${name}/index.js`,
            fesm5: `../dist/fesm5/sheetbase-${name}.js`,
            fesm2015: `../dist/fesm2015/sheetbase-${name}.js`,
            typings: `../dist/lib/${name}/index.d.ts`,
            ... override,
        }, { spaces: 2 });
    };

    console.log('+ Clean up.');
    removeSync('dist');
    removeSync('app');
    removeSync('auth');
    removeSync('database');
    removeSync('storage');
    removeSync('mail');

    console.log('+ Build: sheetbase');
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
    packageJson('app', {
        typings: '../dist/sheetbase.d.ts',
    });

    console.log('+ Build: auth');
    execSync(rollup('sheetbase-auth.js'));
    execSync(rollup('sheetbase-auth.es5.js'));
    execSync(rollup('sheetbase-auth.es2015.js'));
    execSync(minify('dist/sheetbase-auth.js'));
    packageJson('auth');

    console.log('+ Build: database');
    execSync(rollup('sheetbase-database.js'));
    execSync(rollup('sheetbase-database.es5.js'));
    execSync(rollup('sheetbase-database.es2015.js'));
    execSync(minify('dist/sheetbase-database.js'));
    packageJson('database');

    console.log('+ Build: storage');
    execSync(rollup('sheetbase-storage.js'));
    execSync(rollup('sheetbase-storage.es5.js'));
    execSync(rollup('sheetbase-storage.es2015.js'));
    execSync(minify('dist/sheetbase-storage.js'));
    packageJson('storage');

    console.log('+ Build: mail');
    execSync(rollup('sheetbase-mail.js'));
    execSync(rollup('sheetbase-mail.es5.js'));
    execSync(rollup('sheetbase-mail.es2015.js'));
    execSync(minify('dist/sheetbase-mail.js'));
    packageJson('mail');

})();