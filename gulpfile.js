const fs = require('fs');
const gulp = require("gulp");
const concat = require('gulp-concat');
const minify = require('gulp-babel-minify');
const cleanCSS = require('gulp-clean-css');

// By default, we don't do anyhting
function doNothing(cb) { cb(); }

function parse_include(loc, data) {
    var output = [];

    data.forEach(line => {
        if (line.replace(' ', '') === '' || line[0] === '#') {
            return;
        }

        if (line.startsWith('include')) {
            // additional include tooling
            var subdir = line.match(/include\(([^\)]+)\)/)[1];
            var sub_root = `${loc}/${subdir}`
            var sub_content = fs.readFileSync(`${sub_root}/include`, 'utf8');
            output.push(...parse_include(sub_root, sub_content.split('\n')));
        } else {
            output.push(`${loc}/${line.trim()}`);
        }
    });

    return output;
}


function  includes(cb) {
    loc = "./src/";
    var content = fs.readFileSync(`${loc}/include`, "utf8");
    return parse_include(loc, content.split('\n'));
}


function javascript(cb) {
    const source_order = includes(cb);
    return gulp.src(source_order)
        .pipe(minify({"builtIns": false, 'mangle':false}))
        .pipe(concat('beams.min.js'))
        .pipe(gulp.dest('./build/'));
}


function css(cb) {
    // const css_files = [
    //     './style/beamsstyle.css'
    // ];

    // return gulp.src(css_files)
    //     .pipe(cleanCSS())
    //     .pipe(gulp.dest('./build/'));
}


exports.js = javascript;
exports.css = css;
exports.all = gulp.parallel(javascript);
exports.watch = function() {
  // The task will be executed upon startup
  gulp.watch('src/*', { ignoreInitial: false }, function(cb) {
    // body omitted
    javascript(cb);
    cb();
  });
}
exports.default = doNothing;