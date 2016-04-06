/*-------------------------------------------------------------------
Configuration
-------------------------------------------------------------------*/

source_path = './source/';
output_path = './output/';
tinypng_apicode = 'naRxEerrW6SgfdH9sdfns9tfajYqa3W';
minify_img = true;
minify_html = false;
minify_css = false;
minify_js = true;

/*-------------------------------------------------------------------
Required plugins
-------------------------------------------------------------------*/

var gulp = require('gulp'),
    htmlmin = require('gulp-htmlmin'),
    notify = require('gulp-notify'),
    nunjucksRender = require('gulp-nunjucks-render'),
    plumber = require('gulp-plumber'),
    prettify = require('gulp-prettify'),
    sass = require('gulp-sass'),
    sourcemaps = require('gulp-sourcemaps'),
    tinypng = require('gulp-tinypng'),
    uglify = require('gulp-uglify'),
    watch = require('gulp-watch'),
    zip = require('gulp-zip');

/*-------------------------------------------------------------------
Tasks
-------------------------------------------------------------------*/

// minifies images using tinypng
gulp.task('img', function() {
    $ret = gulp_source(source_path+'img/**/*.+(png|jpg)');
    if (minify_img && typeof tinypng_apicode != 'undefined') {
        $ret.pipe(tinypng(tinypng_apicode));
    }
    return $ret.pipe(gulp.dest(output_path+'img/'));
});

// Compile js and minify
gulp.task('js', function() {
    $ret = gulp_source(source_path+'js/**/*.js');
    if (minify_js) {
        $ret.pipe(uglify());
    }
    return $ret.pipe(gulp.dest(output_path+'js/'));
});

// Compile sass into CSS
gulp.task('scss_compile', function() {
    if (minify_css) {
        css_output = 'compressed';
    } else {
        css_output = 'expanded';
    }
    $ret = gulp.src(source_path+'scss/**/*.scss')
        .pipe(plumber({errorHandler: notify.onError('Error: <%= error.message %>')}))
        .pipe(sourcemaps.init())
        .pipe(sass({
            errLogToConsole: true,
            outputStyle: css_output,
            includePaths: [
                './source/thirdparty/'
            ]
        }))
        .pipe(sourcemaps.write());
    $ret.pipe(gulp.dest(output_path+'css/'));
    $ret.pipe(notify({ message: 'Compiled <%= file.relative %> style.' }));
    return $ret;
});

gulp.task('scss', function () {
  gulp.watch(source_path+'scss/**/*.scss', ['scss_compile']);
});

// Gets .html and .nunjucks files in templates
gulp.task('templates', function() {
    nunjucksRender.nunjucks.configure([source_path+'templates']);
    $ret = gulp_source(source_path+'templates/**/*.html')
        .pipe(nunjucksRender());
    if (minify_html) {
        $ret.pipe(htmlmin({
            collapseWhitespace: true,
            collapseInlineTagWhitespace: true,
            minifyJS: true,
            minifyCSS: true,
            removeComments: true
        }));
    }else{
        $ret.pipe(prettify({indent_size: 2}));
    }

    return $ret.pipe(gulp.dest(output_path+'templates'));
});

// Copies contents of source directory to output ready for packaging
gulp.task('copy', function() {
    return gulp_source(
        [
            '!'+source_path+'+(img|js|scss|templates)/**/*', // exludes files in img, js, scss and templates
            '!'+source_path+'+(img|js|scss|templates)',  // exludes img, js, scss and templates folder
            source_path+'**/*'
        ])
        .pipe(gulp.dest(output_path));
});

// Zips the output ready for distribution
gulp.task('zip', function() {
    return gulp.src(output_path+'**/*')
        .pipe(zip('archive.zip'))
        .pipe(gulp.dest('./distribute'));
});

// set default actions to run all tasks listed above
gulp.task('default', ['img','js','scss','templates','copy']);

// helper function to initiate a task
function gulp_source(path){
    return gulp.src(path)
        .pipe(watch(path))
        .pipe(plumber({errorHandler: notify.onError('Error: <%= error.message %>')}));
}
