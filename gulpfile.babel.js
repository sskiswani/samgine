import gulp from 'gulp'
import gutil from 'gulp-util'
import sourcemaps from 'gulp-sourcemaps'
import webserver from 'gulp-webserver'
import browserify from 'browserify'
import watchify from 'watchify'
import source from 'vinyl-source-stream'
import buffer from 'vinyl-buffer'
import del from 'del'
import path from 'path'
import tsify from 'tsify'
import _ from 'lodash'

//""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""
//~ Config
const dirs = {
    src: `./src`,
    out: `./bin`,
    assets: `./assets`,
    pixi: `./node_modules/pixi.js`,
    lodash: `./node_modules/lodash`,
    typings: `./typings/main.d.ts`
};

const scripts = {
    pixi: {
        min: `${dirs.pixi}/bin/pixi.min.js`,
        src: `${dirs.pixi}/bin/pixi.js`
    },
    lodash: {
        src: `${dirs.lodash}/lodash.js`,
        min: `${dirs.lodash}/lodash.min.js`
    },
    scripts: `${dirs.src}/**/*.ts`,
    jsEntry: `${dirs.src}/index.ts`,
    jsResult: `bundle.js`
}

export const paths = _.extend(dirs, scripts, {
    index: `${dirs.src}/index.html`,
    static: `${dirs.assets}/**`,
    sprites: {
        in: `${dirs.assets}/**/*.png`,
        out: `${dirs.src}/assets.ts`
    }
});

global.paths = paths;

//""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""

function makeCopyTask(arg1, arg2, arg3) {
    if (arg3) return () => gulp.src(arg1, arg2).pipe(gulp.dest(arg3));
    return () => gulp.src(arg1).pipe(gulp.dest(arg2));
}

gulp.task('copy-libs', gulp.parallel(
    makeCopyTask(paths.pixi.src, `${dirs.out}/lib`),
    makeCopyTask(paths.lodash.src, `${dirs.out}/lib`)
));

gulp.task('copy-assets', makeCopyTask(paths.static, { base: dirs.assets }, `${dirs.out}/assets`));
gulp.task('copy-html', makeCopyTask(paths.index, dirs.out));
gulp.task('copy', gulp.parallel('copy-html', 'copy-assets', 'copy-libs'));

//""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""
//~ Typescript compile
import typescript from 'typescript'
import tsconfig from './tsconfig';

function logError(err) {
    gutil.log(`${gutil.colors.red("Browserify error:")}
    \n\t${err.message}
    \n\nCode Frame:\n${err.codeFrame}
    \n`);

    // end this stream
    // this.emit('end');
}

var b = watchify(
    browserify({
        entries: [scripts.jsEntry],
        extensions: ['.ts', '.js'],
        debug: true,
        insertGlobals: true,
        fullPaths: true
    })
    .add('typings/main.d.ts')
    .plugin(tsify, { typescript: typescript }));

gulp.task('browserify', bundle);
b.on('update', bundle);
b.on('log', gutil.log);

function bundle() {
    return b.bundle()
        .on('error', logError)
        .pipe(source(paths.jsResult))
        .pipe(buffer())
        .pipe(sourcemaps.init({ loadMaps: true }))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(paths.out));
}

//""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""

gulp.task('watch', () => {
    // gulp.watch('./assets/img', gulp.series('gen-asset-list'));
    // gulp.watch(paths.scripts, gulp.series('browserify'));
    gulp.watch(paths.static, gulp.series('copy-assets'));
    gulp.watch(paths.index, gulp.series('copy-html'));
});

//""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""

gulp.task('serve', () => gulp.src(paths.out).pipe(webserver()));
gulp.task('clean', () => del([paths.out]));

gulp.task('build', gulp.series('browserify', 'copy'));
gulp.task('dev', gulp.series('clean', 'build', 'serve', 'watch'));

gulp.task('default', gulp.series('dev'));