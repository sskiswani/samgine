import * as gulp from 'gulp';
// import * as runSequence from 'run-sequence';
import * as del from 'del';

//~ Config
import config from './config';
(<any>global).config = config;

gulp.task('clean', () => del([config.dest]));
gulp.task('default', (done) => {
    console.log('no default task yet');
    done();
});
