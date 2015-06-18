'use strict';

var fs = require('fs'),
    gulp = require('gulp'),
    gulpMocha = require('gulp-mocha'),
    gulpBabel = require('gulp-babel'),
    gulpRename = require('gulp-rename');

gulp.task('compile', function () {
    return gulp.src(['.{,/**}/*.es6', '!node_modules/{,/**}']).pipe(gulpBabel()).pipe(gulpRename({ extname: '.js' })).pipe(gulp.dest('.'));
});

gulp.task('run test', function () {
    return gulp.src(['./**/*.test.js', '!node_modules/{,/**}'], { read: false }).pipe(gulpMocha({
        'async-only': true,
        ui: 'bdd',
        reporter: 'spec',
        timeout: 10000,
        bail: false,
        ignoreLeaks: false,
        globals: []
    })).once('end', function () {
        return process.exit();
    });
});