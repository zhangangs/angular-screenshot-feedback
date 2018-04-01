"use strict";

var gulp = require('gulp'),
    wiredep = require('wiredep').stream,
    inject = require('gulp-inject'),
    less = require('gulp-less'),
    browserSync = require('browser-sync').create();


/**
 * less 转换成css
*/
gulp.task('less', function () {
    return gulp.src('src/css/**.scss')
        .pipe(less())
        .pipe(gulp.dest('src/css'))
})

/**
 * 注入用户css和js到index文件中
*/
gulp.task('inject-css-js', ['less'], function () {
    var sources = gulp.src(['src/**.js', 'src/**/*.css'], { read: false });
    return gulp.src('src/index.html')
        .pipe(inject(sources))
        .pipe(gulp.dest('src'));
})

/*
* bower文件注入到index文件中
*/
gulp.task('bower', ['inject-css-js'], function () {
    return gulp.src('src/index.html')
        .pipe(wiredep({
            optional: 'configuration',
            goes: 'here'
        }))
        .pipe(gulp.dest('src'));
})

/**
 * 文件监听
*/
gulp.task('watch', ['bower', 'inject-css-js'], function () {
    browserSync.init({
        server: {
            files: ['**'],
            baseDir: './',
            index: 'src/index.html',
            browser: 'google chrome'
        }
    });

    /*监听文件的修改*/
    gulp.watch(['src/**.js', 'src/**/*.scss'], ['inject-css-js']);
    gulp.watch('src/**.html').on('change', browserSync.reload);
})


/**
 * 启动页面
*/
gulp.task('serve', ['bower', 'watch']);
