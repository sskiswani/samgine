const gulp = require('gulp');
const sourcemaps = require('gulp-sourcemaps');
const browserSync = require('browser-sync').create();
const del = require('del');
const series = require('run-sequence');
const tsify = require('tsify');
//~
const taskUtils = require('./gulp/utils');
const bundler = require('./gulp/bundler');
//~
const config = {
    rootDir: './src/app',
    outDir: './bin/app',
    bundleName: 'bundle.js',

    //~ assets
    get html() { return `${this.rootDir}/**/*.html`; },

    //~ third party

    //~ scripts
    get scripts() { return `${this.rootDir}/**/*.tsx`; },
    get entry() { return [`${this.rootDir}/index.tsx`]; },

    get bundleDest() { return `${this.outDir}`; },
    get bundleResult() { return `${this.outDir}/${this.bundleName}`; }
};

global.config = config;

// - - - - - - - - - - - - - - - - - - - - -

//~ Clean
gulp.task('clean:app', () => del.sync(config.outDir));
gulp.task('clean', () => del.sync('./bin'));

//~ Copy
gulp.task('copy:html', () => taskUtils.copy(config.html, config.outDir));
gulp.task('copy', ['copy:html']);


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
        paths: [config.rootDir],
        extensions: ['.tsx', '.ts', '.js'],
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
