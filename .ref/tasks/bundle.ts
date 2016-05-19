import * as gulp from 'gulp';
import * as gulpLoadPlugins from 'gulp-load-plugins';
import * as merge from 'merge-stream';

const plugins = <any>gulpLoadPlugins();
/**
 * Returns the shim files to be injected.
 */
// function getShims() {
//   let libs = DEPENDENCIES
//     .filter(d => /\.js$/.test(d.src));

//   return libs.filter(l => l.inject === 'shims')
//     .concat(libs.filter(l => l.inject === 'libs'))
//     .concat(libs.filter(l => l.inject === true))
//     .map(l => l.src);
// }

// function bundleShims() {
//     return gulp.src(getShims())
// }