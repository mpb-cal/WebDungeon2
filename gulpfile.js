
/* eslint-disable no-console */

const { src, pipe, dest, series } = require('gulp');
const eslint = require('gulp-eslint');
const exec = require('child_process').exec;
const JS_GLOB = ['**/*.js', '!gulpfile.js', '!out/**', '!static/**'];

/*
gulp.task('default', ['main']);
*/

function ctags(cb) {
  exec('ctags --exclude=out --exclude=node_modules', (error, stdout, stderr) => {
    //console.log(`stdout: ${stdout}`);
    //console.log(`stderr: ${stderr}`);
    return cb(error);
  });

  cb();
}

function lint(cb) {
  return src(JS_GLOB)
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError())
  ;

  cb();
}

function main(cb) {
  // node testDungeon.js
  // node .

  exec('node testDungeon.js', (error, stdout, stderr) => {
    console.log(`stdout: ${stdout}`);
    console.log(`stderr: ${stderr}`);
    return cb(error);
  });
}

/*
gulp.task('watch', () =>
  gulp.watch(JS_GLOB, ['main'])
);
*/

exports.ctags = ctags;
exports.lint = lint;
exports.default = series(ctags, main);

