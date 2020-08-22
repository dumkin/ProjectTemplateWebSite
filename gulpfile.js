"use strict";

const sourcePath = "src";
const appPath = "dist";

const paths = {
  source: {
    pages: `${sourcePath}/**/*.html`,
    scripts: `${sourcePath}/scripts/*.js`,
    scriptsLibs: `${sourcePath}/scripts/**/*.js`,
    styles: `${sourcePath}/styles/*.+(sass|scss)`,
    stylesLibs: `${sourcePath}/styles/**/*.+(sass|scss)`,
    images: `${sourcePath}/images/**/*`,
    fonts: `${sourcePath}/fonts/**/*.+(eot|svg|ttf|woff|woff2)`,
  },
  destination: {
    pages: `${appPath}/`,
    scripts: `${appPath}/scripts/`,
    styles: `${appPath}/styles/`,
    images: `${appPath}/images/`,
    fonts: `${appPath}/fonts/`,
  }
}

const {task, src, dest, parallel, series, watch} = require('gulp');
const sass = require('gulp-sass');
const cleancss = require('gulp-clean-css');
const browserSync = require('browser-sync').create();
const uglify = require('gulp-uglify-es').default;
const autoprefixer = require('gulp-autoprefixer');
const imagemin = require('gulp-imagemin');
const del = require('del');
const htmlmin = require('gulp-htmlmin');
const notify = require('gulp-notify');
const cache = require('gulp-cache');
const rigger = require('gulp-rigger');

let buildConfig = {
  pages: function () {
    return src(paths.source.pages)
    .pipe(rigger())
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(dest(paths.destination.pages));
  },
  styles: function () {
    return src(paths.source.styles)
    .pipe(
      sass({
        errLogToConsole: true,
        outputStyle: "compressed",
        includePaths: [paths.source.stylesLibs]
      })
    )
    .pipe(
      autoprefixer({
        grid: true
      })
    )
    .pipe(cleancss({
      level: {
        1: {
          specialComments: 0
        }
      }
    }))
    .on("error", notify.onError())
    .pipe(dest(paths.destination.styles));
  },
  scripts: function () {
    return src(paths.source.scripts)
    .pipe(uglify())
    .pipe(rigger())
    .pipe(dest(paths.destination.scripts));
  },
  images: function () {
    return src(paths.source.images)
    .pipe(cache(imagemin()))
    .pipe(dest(paths.destination.images));
  }
};
let watchConfig = {
  pages: function () {
    return src(paths.source.pages)
    .pipe(rigger())
    .pipe(dest(paths.destination.pages));
  },
  styles: function () {
    return src(paths.source.styles)
    .pipe(
      sass({
        errLogToConsole: true,
        outputStyle: "expanded",
        includePaths: [paths.source.stylesLibs]
      })
    )
    .on("error", notify.onError())
    .pipe(dest(paths.destination.styles))
    .pipe(browserSync.stream());
  },
  scripts: function () {
    return src(paths.source.scripts)
    .pipe(rigger())
    .pipe(dest(paths.destination.scripts))
    .pipe(browserSync.stream());
  },
  images: function () {
    return src(paths.source.images)
    .pipe(dest(paths.destination.images));
  },
  watch: function () {
    watch(paths.source.pages, series(watchConfig.pages, browserReload));
    watch(paths.source.fonts, series(fonts, browserReload));
    watch(paths.source.images, series(watchConfig.images, browserReload));
    watch(paths.source.stylesLibs, watchConfig.styles);
    watch(paths.source.scriptsLibs, watchConfig.scripts);
  }
};

function browserWatch(done) {
  browserSync.init({
    server: appPath,
    notify: false,
    startPath: "",
    open: false
  });
  done();
}

function browserReload(done) {
  browserSync.reload();
  done();
}

function fonts() {
  return src(paths.source.fonts)
  .pipe(dest(paths.destination.fonts));
}

function appClear() {
  return del(appPath);
}

function cacheClear() {
  return cache.clearAll();
}

task(
  "build",
  series(
    parallel(appClear, cacheClear),
    parallel(
      buildConfig.pages,
      fonts,
      buildConfig.styles,
      buildConfig.scripts,
      buildConfig.images
    )
  )
);

task(
  "default",
  series(
    parallel(appClear, cacheClear),
    parallel(
      watchConfig.pages,
      fonts,
      watchConfig.styles,
      watchConfig.scripts,
      watchConfig.images
    ),
    parallel(browserWatch, watchConfig.watch)
  )
);
