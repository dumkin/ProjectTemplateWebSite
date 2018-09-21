"use strict";

let source = {
    pageFiles: 'src/**/*.html',
    fontFiles: 'src/fonts/**/*',
    imageFiles: 'src/images/**/*',

    styleFile: 'src/styles/main.sass',
    styleFiles: 'src/styles/**/*.sass',

    scriptFile: 'src/scripts/common.js',
    scriptFiles: 'src/scripts/**/*.js'
};

let distribution = {
    root: 'dist/',
    styles: 'dist/styles/',
    scripts: 'dist/scripts/',
    images: 'dist/images/',
    fonts: 'dist/fonts/'
};

let autoPrefixBrowserList = [
    'last 2 version',
    'safari 5',
    'ie 8',
    'ie 9',
    'opera 12.1',
    'ios 6',
    'android 4',
    'last 2 years'
];

let del          = require('del'),
    gulp         = require('gulp'),
    sass         = require('gulp-sass'),
    cache        = require('gulp-cache'),
    rigger       = require('gulp-rigger'),
    notify       = require("gulp-notify"),
    concat       = require('gulp-concat'),
    terser       = require('gulp-terser'),
    imageMin     = require('gulp-imagemin'),
    autoPrefixer = require('gulp-autoprefixer'),
    browserSync  = require('browser-sync');

gulp.task('browser-sync', function() {
    browserSync({
        server: distribution.root,
        notify: false
    });
});

gulp.task('browser-reload', function() {
    browserSync.reload();
});

gulp.task('pages', function() {
    return gulp.src(source.pageFiles)
               .pipe(gulp.dest(distribution.root));
});

gulp.task('fonts', function() {
    return gulp.src(source.fontFiles)
               .pipe(gulp.dest(distribution.fonts));
});

gulp.task('styles', function() {
    return gulp.src(source.styleFile)
               .pipe(sass({
                      errLogToConsole: true,
                      outputStyle: 'compressed',
                      includePaths: [
                          source.styleFiles
                      ]
               }))
               .pipe(autoPrefixer({
                   browsers: autoPrefixBrowserList,
                   grid: true
               }))
               .on("error", notify.onError())
               .pipe(concat('common.css'))
               .pipe(gulp.dest(distribution.styles));
});

gulp.task('scripts', function() {
    return gulp.src(source.scriptFile)
               .pipe(rigger())
               .pipe(concat('common.js'))
               .pipe(terser())
               .pipe(gulp.dest(distribution.scripts))
});

gulp.task('image', function() {
    return gulp.src(source.imageFiles)
               .pipe(cache(imageMin()))
               .pipe(gulp.dest(distribution.images))
});

gulp.task('watch', [
    'clearDistribution',
    'clearCache',
    'pages',
    'fonts',
    'styles',
    'scripts',
    'image',
    'browser-sync'
], function() {
    gulp.watch(source.styleFiles, ['styles', 'browser-reload']);
    gulp.watch(source.imageFiles, ['image', 'browser-reload']);
    gulp.watch(source.scriptFiles, ['scripts', 'browser-reload']);
    gulp.watch(source.pageFiles, ['pages', 'browser-reload']);
});

gulp.task('clearDistribution', function() {
    return del.sync(distribution.root);
});

gulp.task('clearCache', function() {
    return cache.clearAll();
});

gulp.task('build', [
    'clearDistribution',
    'clearCache',
    'pages',
    'fonts',
    'styles',
    'scripts',
    'image'
]);

gulp.task('default', ['watch']);