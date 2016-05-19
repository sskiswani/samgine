import * as gulp from 'gulp';

export function makeCopyTask(arg1, arg2, arg3) {
    if (arg3) return () => gulp.src(arg1, arg2).pipe(gulp.dest(arg3));
    return () => gulp.src(arg1).pipe(gulp.dest(arg2));
}

//~ Copy tasks
// gulp.task('copy-libs', () => gulp.src(paths.libs).pipe(gulp.dest(`${dirs.dest}/lib`)));
// gulp.task('copy-html', makeCopyTask(paths.index, dirs.dest));