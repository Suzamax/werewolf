const { src, dest, parallel } = require('gulp');
const ts = require('gulp-typescript');
const sass = require('gulp-sass');

sass.compiler = require('node-sass');

const css = () => src('./src/assets/sass/*.sass')
    .pipe(sass().on('error', sass.logError))
    .pipe(dest('./dist/public/css'))
;

const js = () => src('./src/**/*.ts')
    .pipe(ts.createProject('tsconfig.json')())
    .pipe(dest('./dist'))
;

const views = () => src("./src/views/**/*.mustache")
    .pipe(dest("./dist/views"))
;

exports.views = views;
exports.css = css;
exports.js = js;
exports.default = parallel(css, js, views);