"use strict";

let source = {
    pageFiles: 'src/**/*.html',
    fontFiles: 'src/fonts/**/*',
    imageFiles: 'src/images/**/*',

    styleFile: 'src/styles/common.sass',
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

function browserWatch(done) {
    browserSync({
        server: distribution.root,
        notify: false
    });
    done();
}
function browserReload(done) {
    browserSync.reload();
    done();
}
function pages() {
    return gulp.src(source.pageFiles)
               .pipe(gulp.dest(distribution.root));
}
function fonts() {
    return gulp.src(source.fontFiles)
               .pipe(gulp.dest(distribution.fonts));
}
function styles() {
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
}
function scripts() {
    return gulp.src(source.scriptFile)
               .pipe(rigger())
               .pipe(concat('common.js'))
               .pipe(terser())
               .pipe(gulp.dest(distribution.scripts))
}
function images() {
    return gulp.src(source.imageFiles)
               .pipe(cache(imageMin()))
               .pipe(gulp.dest(distribution.images))
}
function watch() {
    gulp.watch(source.styleFiles, gulp.series(styles, browserReload));
    gulp.watch(source.imageFiles, gulp.series(images, browserReload));
    gulp.watch(source.scriptFiles, gulp.series(scripts, browserReload));
    gulp.watch(source.pageFiles, gulp.series(pages, browserReload));
    gulp.watch(source.fontFiles, gulp.series(fonts, browserReload));
}
function clearDistribution() {
    return del(distribution.root);
}
function clearCache() {
    return cache.clearAll();
}

gulp.task('build', gulp.series(
    gulp.parallel(
        clearDistribution,
        clearCache
    ),
    gulp.parallel(
        pages,
        fonts,
        styles,
        scripts,
        images
    )
));

gulp.task('default', gulp.series(
    gulp.parallel(
        clearDistribution,
        clearCache
    ),
    gulp.parallel(
        pages,
        fonts,
        styles,
        scripts,
        images
    ),
    gulp.parallel(
        browserWatch,
        watch
    )
));