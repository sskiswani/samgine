const gulp = require('gulp');
const sourcemaps = require('gulp-sourcemaps');
const browserSync = require('browser-sync').create();
const del = require('del');
const series = require('run-sequence');
const tsify = require('tsify');

const taskUtils = require('./gulp/utils');
const bundler = require('./gulp/bundler');

const config = {
    baseUrl: './src',
    outDir: './bin',
    bundleName: 'bundle.js',

    //~ assets
    get html() { return `${this.baseUrl}/**/*.html`; },

    //~ third party
    get pixi() { return `./node_modules/pixi.js/bin/pixi.min.js` },

    //~ scripts
    get scripts() { return `${this.baseUrl}/**/*.ts`; },
    get entry() { return [`${this.baseUrl}/index.ts`]; },

    get bundleDest() { return `${this.outDir}`; },
    get bundleResult() { return `${this.outDir}/${this.bundleName}`; }
};

global.config = config;

// - - - - - - - - - - - - - - - - - - - - -

//~ Clean
gulp.task('clean', () => del.sync('./bin'));

//~ Copy
gulp.task('copy:pixi', () => taskUtils.copy(config.pixi, config.outDir));
gulp.task('copy:html', () => taskUtils.copy(config.html, config.outDir));
gulp.task('copy', ['copy:html', 'copy:pixi']);


//""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""
//~ Bundling && related
const bundleArgs = {
    outDir: config.bundleDest,
    bundleName: config.bundleName,
    debug: true
};

var scriptBundle = bundler.createWatcher(
    bundler.createBundler({
        entries: config.entry,
        paths: [config.baseUrl],
        extensions: ['.ts', '.js'],
        debug: true,
        insertGlobals: true,
        fullPaths: true
    }).plugin(tsify),
    bundleArgs,
    browserSync.reload
);

gulp.task('build:scripts', () => bundler.rebundle.call(scriptBundle, bundleArgs));

gulp.task('build', (cb) => series(['copy', 'build:scripts'], cb));

//~ Watch
gulp.task('watch', ['build'], () => {
    //~ assets
    gulp.watch(config.html, ['copy:html']).on('change', taskUtils.logChanges);

    //~ scripts
    gulp.watch(config.scripts).on('change', taskUtils.logChanges);
});

//~ Serve
gulp.task('serve', ['watch'], () => {
    browserSync.init({
        server: { baseDir: config.outDir },
        open: false
    });

    gulp.watch([`${config.outDir}/*.css`, `${config.outDir}/*.html`], browserSync.reload);
});

//~ Standards
gulp.task('dev', (cb) => series('clean', 'serve', cb));
gulp.task('default', ['build']);
