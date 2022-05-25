const { src, dest } = require('gulp');
const uglifyPlugin = require('gulp-uglify');
const concatPlugin = require('gulp-concat');

var copyJsTask = function (callback) {
    src('./lib/*.js')
        .pipe(concatPlugin('input-manager.js'))
        .pipe(dest('./dist/js'));

    callback();
}

var minifyJsTask = function (callback) {
    src('./lib/*.js')
        .pipe(uglifyPlugin())
        .pipe(concatPlugin('input-manager.min.js'))
        .pipe(dest('./dist/js'));

    callback();
}

var defaultTask = function (callback) {
    copyJsTask(callback);
    minifyJsTask(callback);

    callback();
}

exports.copyJs = copyJsTask;
exports.minifyJs = minifyJsTask;
exports.default = defaultTask;
