"use strict";

let src = "src";
let dist = "dist/";
let root = "";

let source = {
  pages: `${src}/**/*.html`,
  fonts: `${src}/fonts/**/*.+(eot|svg|ttf|woff|woff2)`,
  images: `${src}/images/**/*`,

  styles: `${src}/styles/*.+(sass|scss)`,
  styleLibs: `${src}/styles/**/*.+(sass|scss)`,

  scripts: `${src}/scripts/*.js`,
  scriptLibs: `${src}/scripts/**/*.js`,

  serviceWorkers: `${src}/*.sw.js`
};

let distribution = {
  dist: `${dist}`,
  root: `${dist}${root}`,
  styles: `${dist}${root}styles/`,
  scripts: `${dist}${root}scripts/`,
  images: `${dist}${root}images/`,
  fonts: `${dist}${root}fonts/`
};

let autoPrefixBrowserList = ["last 10 version", "cover 99.5%", "last 2 years"];

let del = require("del"),
  gulp = require("gulp"),
  sass = require("gulp-sass"),
  cache = require("gulp-cache"),
  rigger = require("gulp-rigger"),
  notify = require("gulp-notify"),
  concat = require("gulp-concat"),
  terser = require("gulp-terser"),
  imageMin = require("gulp-imagemin"),
  autoPrefixer = require("gulp-autoprefixer"),
  browserSync = require("browser-sync"),
  htmlMin = require("gulp-htmlmin");

let buildConfig = {
  pages: function () {
    return gulp
      .src(source.pages)
      .pipe(rigger())
      .pipe(htmlMin({ collapseWhitespace: true }))
      .pipe(gulp.dest(distribution.root));
  },
  styles: function () {
    return gulp
      .src(source.styles)
      .pipe(
        sass({
          errLogToConsole: true,
          outputStyle: "compressed",
          includePaths: [source.styleLibs]
        })
      )
      .pipe(
        autoPrefixer({
          browsers: autoPrefixBrowserList,
          grid: true
        })
      )
      .on("error", notify.onError())
      .pipe(gulp.dest(distribution.styles));
  },
  scripts: function () {
    return gulp
      .src(source.scripts)
      .pipe(rigger())
      .pipe(terser())
      .pipe(gulp.dest(distribution.scripts));
  },
  serviceWorkers: function () {
    return gulp
      .src(source.serviceWorkers)
      .pipe(rigger())
      .pipe(terser())
      .pipe(gulp.dest(distribution.root));
  },
  images: function () {
    return gulp
      .src(source.images)
      .pipe(cache(imageMin()))
      .pipe(gulp.dest(distribution.images));
  }
};

let watchConfig = {
  pages: function () {
    return gulp
      .src(source.pages)
      .pipe(rigger())
      .pipe(gulp.dest(distribution.root));
  },
  styles: function () {
    return gulp
      .src(source.styles)
      .pipe(
        sass({
          errLogToConsole: true,
          outputStyle: "expanded",
          includePaths: [source.styleLibs]
        })
      )
      // .pipe(
      //   autoPrefixer({
      //     browsers: autoPrefixBrowserList,
      //     grid: true
      //   })
      // )
      .on("error", notify.onError())
      .pipe(gulp.dest(distribution.styles));
  },
  scripts: function () {
    return gulp
      .src(source.scripts)
      .pipe(rigger())
      .pipe(gulp.dest(distribution.scripts));
  },
  serviceWorkers: function () {
    return gulp
      .src(source.serviceWorkers)
      .pipe(rigger())
      .pipe(gulp.dest(distribution.root));
  },
  images: function () {
    return gulp
      .src(source.images)
      .pipe(gulp.dest(distribution.images));
  },
  watch: function () {
    gulp.watch(source.pages, gulp.series(watchConfig.pages, browserReload));
    gulp.watch(source.fonts, gulp.series(fonts, browserReload));
    gulp.watch(source.images, gulp.series(watchConfig.images, browserReload));
    gulp.watch(source.styleLibs, gulp.series(watchConfig.styles, browserReload));
    gulp.watch(source.scriptLibs, gulp.series(watchConfig.scripts, browserReload));
    gulp.watch(source.serviceWorkers, gulp.series(watchConfig.serviceWorkers, browserReload));
  }
};

function browserWatch(done) {
  browserSync({
    server: dist,
    notify: false,
    startPath: root,
    open: false
  });
  done();
}
function browserReload(done) {
  browserSync.reload();
  done();
}
function fonts() {
  return gulp.src(source.fonts)
    .pipe(gulp.dest(distribution.fonts));
}
function clearDistribution() {
  return del(distribution.root);
}
function clearCache() {
  return cache.clearAll();
}

gulp.task(
  "build",
  gulp.series(
    gulp.parallel(clearDistribution, clearCache),
    gulp.parallel(
      buildConfig.pages,
      fonts,
      buildConfig.styles,
      buildConfig.scripts,
      buildConfig.serviceWorkers,
      buildConfig.images
    )
  )
);

gulp.task(
  "default",
  gulp.series(
    gulp.parallel(clearDistribution, clearCache),
    gulp.parallel(
      watchConfig.pages,
      fonts,
      watchConfig.styles,
      watchConfig.scripts,
      watchConfig.serviceWorkers,
      watchConfig.images
    ),
    gulp.parallel(browserWatch, watchConfig.watch)
  )
);
