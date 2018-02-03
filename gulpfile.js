"use strict";

let src = {
    root: 'src/',
    sass: 'src/sass/',
    sassFiles: 'src/sass/**/*.sass',
    sassInit: 'src/sass/init.sass',
    css:  'src/css',
    images: 'src/images/**/*',
    imagesFolder: 'src/images',
    html: 'src/**/*.html',
    js: 'src/js/common.js',
    jsFolder: 'src/js/*.js'
};

let autoPrefixBrowserList = ['last 2 version',
'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'];

let gulp         = require('gulp'),
    sass         = require('gulp-sass'),
    cache        = require('gulp-cache'),
    notify       = require("gulp-notify"),
    concat       = require('gulp-concat'),
    uglify       = require('gulp-uglify'),
    imageMin     = require('gulp-imagemin'),
    cleanCss     = require('gulp-clean-css'),
    autoPrefixer = require('gulp-autoprefixer'),
    browserSync  = require('browser-sync');

gulp.task('browser-sync', function() {
    browserSync({
        server: src.root,
        notify: false
    });
});

gulp.task('sass', function() {
    return gulp.src(src.sassInit)
               .pipe(sass({
                      errLogToConsole: true,
                      outputStyle: 'compressed',
                      includePaths: [
                          src.sass
                      ]
               }))
               .pipe(autoPrefixer({
                   browsers: autoPrefixBrowserList,
                   grid: true
               }))
               .on("error", notify.onError())
               .pipe(concat('common.css'))
               .pipe(gulp.dest('src/styles'))
               .pipe(browserSync.reload({stream: true}));
});

gulp.task('scripts', function() {
    return gulp.src(src.js)
               .pipe(concat('common.js'))
               .pipe(uglify())
               .pipe(gulp.dest('src/scripts'))
               .pipe(browserSync.reload({stream: true}));
});

gulp.task('image', function() {
    return gulp.src(src.images)
               .pipe(cache(imageMin()))
               .pipe(gulp.dest(src.imagesFolder))
               .pipe(browserSync.reload({stream: true}));
});

gulp.task('watch', ['sass', 'image', 'scripts', 'browser-sync'], function() {
    gulp.watch(src.sassFiles, ['sass']);
    gulp.watch(src.images, ['image']);
    gulp.watch(src.jsFolder, ['scripts']);
    gulp.watch(src.html, browserSync.reload);
});

// gulp.task('build', ['removedist', 'imagemin', 'sass', 'js'], function() {

//     var buildFiles = gulp.src([
//         'app/*.html',
//         'app/.htaccess',
//         ]).pipe(gulp.dest('dist'));

//     var buildCss = gulp.src([
//         'app/css/main.min.css',
//         ]).pipe(gulp.dest('dist/css'));

//     var buildJs = gulp.src([
//         'app/js/scripts.min.js',
//         ]).pipe(gulp.dest('dist/js'));

//     var buildFonts = gulp.src([
//         'app/fonts/**/*',
//         ]).pipe(gulp.dest('dist/fonts'));

// });

gulp.task('default', ['watch']);