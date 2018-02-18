"use strict"; //eslint-disable-line
const gulp = require("gulp");
const eslint = require("gulp-eslint");
const del = require("del");
const babel = require("gulp-babel");
const sourcemaps = require("gulp-sourcemaps");

gulp.task("clean", () => {
  return del(["build/**/*"]);
});


gulp.task("compile", ["lint"], () => {
  return gulp.src(["src/**/*"])
    .pipe(sourcemaps.init({identityMap: true}))
    .pipe(babel())
    .pipe(sourcemaps.write(".", {includeContent: false, sourceRoot: "../src/"}))
    .pipe(gulp.dest("build"));
});

gulp.task("lint", ["clean"], () => {
  return gulp.src(["src/**/*.js"])
    .pipe(eslint({fix: true}))
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});


// gulp.task("test", ["compile"], function() {
//   return gulp.src("./build/tests/**/*.test.js")
//     .pipe(jest({
//       "preprocessorIgnorePatterns": [
//         "<rootDir>/src/", "<rootDir>/node_modules/"
//       ],
//       "automock": false,
//     }));
// });

// gulp.task("doc", function(cb) {
//   var config = require("./jsdoc.json");
//   gulp.src(["README.md", "package.json", "./src/**/*.js"], {read: false})
//     .pipe(jsdoc3(config, cb));
// });

gulp.task("watch", () => {
  gulp.watch(["src/**/*.*", "./config.js", "./*.config.js"], ["compile"]);
});

gulp.task("default", ["compile"]);
