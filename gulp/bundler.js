const gulp = require('gulp')
const gutil = require('gulp-util');
const browserify = require('browserify');
const _ = require('lodash');
const source = require('vinyl-source-stream');
const watchify = require('watchify');
//~
const taskUtils = require('./utils');
const chalk = gutil.colors;

function rebundle(options) {
    let {bundleName, outDir, debug} = _.defaults(options, {
        outDir: './bin',
        bundleName: 'bundle.js',
        debug: true
    });

    if (debug) {
        gutil.log(`\t-> Starting rebundle... (${chalk.bold.cyan(`${outDir}/${bundleName}`)})`);
    }

    const stream = this.bundle()
        .on('error', taskUtils.logError)
        .pipe(taskUtils.errorHandler)
        .pipe(source(bundleName))
        .pipe(gulp.dest(outDir));

    if (!debug) return stream;

    return stream.once('end', () => {
        gutil.log(`\t-> Rebundle of ${chalk.bold.cyan(`${outDir}/${bundleName}`)} completed.`);
    });
}

function createBundler(args, xformers) {
    args = _.defaults(args, {
        debug: true,
        cache: {},
        packageCache: {}
    });

    const bundle = browserify(_.assign({}, watchify.args, args));
    return xformers ? xformers(bundle) : bundle;
}

function createWatcher(scriptBundle, options, onUpdate) {
    const watcher = watchify(scriptBundle);

    //~ Update task
    watcher.on('update', function () {
        var rebundled = rebundle.call(this, options);

        if (onUpdate) {
            rebundled.on('end', onUpdate);
        }
    });

    return watcher;
    // return rebundle.call(watcher, options);
}

module.exports = {
    createBundler: createBundler,
    createWatcher: createWatcher,
    rebundle: rebundle
};
