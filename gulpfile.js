"use strict";

let src = "src";
let dist = "dist/";
let root = "";

let source = {
  pages: `${src}/**/*.html`,

  fonts: `${src}/fonts/**/*.+(eot|svg|ttf|woff|woff2)`,
  imageFiles: `${src}/images/**/*`,

  styleFile: `${src}/styles/common.sass`,
  styleFiles: `${src}/styles/**/*.+(sass|scss)`,

  scriptFile: `${src}/scripts/common.js`,
  scriptFiles: `${src}/scripts/**/*.js`,

  serviceWorkerFile: `${src}/service-worker.js`
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
  pages: function() {
    return gulp
      .src(source.pages)
      .pipe(htmlMin({ collapseWhitespace: true }))
      .pipe(gulp.dest(distribution.root));
  },
  styles: function() {
    return gulp
      .src(source.styleFile)
      .pipe(
        sass({
          errLogToConsole: true,
          outputStyle: "compressed",
          includePaths: [source.styleFiles]
        })
      )
      .pipe(
        autoPrefixer({
          browsers: autoPrefixBrowserList,
          grid: true
        })
      )
      .on("error", notify.onError())
      .pipe(concat("common.css"))
      .pipe(gulp.dest(distribution.styles));
  },
  scripts: function() {
    return gulp
      .src(source.scriptFile)
      .pipe(rigger())
      .pipe(concat("common.js"))
      .pipe(terser())
      .pipe(gulp.dest(distribution.scripts));
  },
  serviceWorker: function() {
    return gulp
      .src(source.serviceWorkerFile)
      .pipe(rigger())
      .pipe(terser())
      .pipe(gulp.dest(distribution.root));
  },
  images: function() {
    return gulp
      .src(source.imageFiles)
      .pipe(cache(imageMin()))
      .pipe(gulp.dest(distribution.images));
  }
};

let watchConfig = {
  pages: function() {
    return gulp.src(source.pages).pipe(gulp.dest(distribution.root));
  },
  styles: function() {
    return gulp
      .src(source.styleFile)
      .pipe(
        sass({
          errLogToConsole: true,
          outputStyle: "expanded",
          includePaths: [source.styleFiles]
        })
      )
      .pipe(
        autoPrefixer({
          browsers: autoPrefixBrowserList,
          grid: true
        })
      )
      .on("error", notify.onError())
      .pipe(concat("common.css"))
      .pipe(gulp.dest(distribution.styles));
  },
  scripts: function() {
    return gulp
      .src(source.scriptFile)
      .pipe(rigger())
      .pipe(concat("common.js"))
      .pipe(gulp.dest(distribution.scripts));
  },
  serviceWorker: function() {
    return gulp
      .src(source.serviceWorkerFile)
      .pipe(rigger())
      .pipe(gulp.dest(distribution.root));
  },
  images: function() {
    return gulp.src(source.imageFiles).pipe(gulp.dest(distribution.images));
  },
  watch: function() {
    gulp.watch(
      source.styleFiles,
      gulp.series(watchConfig.styles, browserReload)
    );
    gulp.watch(
      source.imageFiles,
      gulp.series(watchConfig.images, browserReload)
    );
    gulp.watch(
      source.scriptFiles,
      gulp.series(watchConfig.scripts, browserReload)
    );
    gulp.watch(
      source.serviceWorkerFile,
      gulp.series(watchConfig.serviceWorker, browserReload)
    );
    gulp.watch(source.pages, gulp.series(watchConfig.pages, browserReload));
    gulp.watch(source.fonts, gulp.series(fonts, browserReload));
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
  return gulp.src(source.fonts).pipe(gulp.dest(distribution.fonts));
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
      buildConfig.serviceWorker,
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
      watchConfig.serviceWorker,
      watchConfig.images
    ),
    gulp.parallel(browserWatch, watchConfig.watch)
  )
);
