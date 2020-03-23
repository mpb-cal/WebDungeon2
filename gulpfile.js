
/* eslint-disable no-console */

const gulp = require('gulp');
const eslint = require('gulp-eslint');
const exec = require('child_process').exec;
const JS_GLOB = ['**/*.js', '!gulpfile.js', '!out/**', '!static/**'];

gulp.task('default', ['main']);

gulp.task('ctags', (callback) => {
  exec('ctags --exclude=out --exclude=node_modules', (error, stdout, stderr) => {
    console.log(`stdout: ${stdout}`);
    console.log(`stderr: ${stderr}`);
    return callback(error);
  });
});

gulp.task('lint', (callback) => {
  return gulp.src(JS_GLOB)
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError())
  ;
});

gulp.task('main', ['lint', 'ctags'], (callback) => {
  // node testDungeon.js
  // node .

  exec('node testDungeon.js', (error, stdout, stderr) => {
    console.log(`stdout: ${stdout}`);
    console.log(`stderr: ${stderr}`);
    return callback(error);
  });
});

gulp.task('watch', () =>
  gulp.watch(JS_GLOB, ['main'])
);

