const path = require('path')
const gulp = require('gulp');
const gutil = require('gulp-util');
const plumber = require('gulp-plumber');
const ERROR = gutil.colors.bold.red('[ERROR]');

function logError(err) {
    var msg = err.toString();

    if (msg === '[object Object]') {
        msg = err;
    }

    gutil.log(ERROR, err);

    if (err.stack) {
        gutil.log(ERROR, err.stack);
    }

    // Keep gulp from hanging on this task
    this.emit('end');
}

function logChanges(event) {
    gutil.log(
        gutil.colors.green('File ' + event.type + ': ') +
        gutil.colors.magenta(path.basename(event.path))
    );
}

module.exports = {
    copy: function (glob, destination, globOpts) {
        return gulp.src(glob, globOpts).pipe(gulp.dest(destination))
    },

    logError: logError,
    logChanges: logChanges,
    get errorHandler() {
        return plumber(logError);
    }
}
