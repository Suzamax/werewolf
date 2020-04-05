const { src, dest, parallel } = require('gulp');
const webpack = require('webpack-stream');
const ts = require('gulp-typescript');
const sass = require('gulp-sass');

sass.compiler = require('node-sass');

const wp = () => src('./src/components/index.tsx')
    .pipe(webpack(require('./webpack.config.js')))
    .pipe(dest('./dist/public/js'))
;

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
exports.wp = wp;
exports.css = css;
exports.js = js;
exports.default = parallel(css, js, wp, views);