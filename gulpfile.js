const gulp = require('gulp');
const tslint = require('gulp-tslint');
const clean = require('gulp-clean');
const ts = require('gulp-typescript');
 
gulp.task('default', function () {
    return gulp.src('src/**/*.ts')
        .pipe(ts({
            noImplicitAny: true,
            outFile: 'output.js'
        }))
        .pipe(gulp.dest('built/local'));
});