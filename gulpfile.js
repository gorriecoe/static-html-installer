/*-------------------------------------------------------------------
Configuration
-------------------------------------------------------------------*/

source_path = './source/';
output_path = './output/';
tinypng_apicode = 'naRxETuVW6StyRcH9pxAns9tfajYqa3W';
minify_img = true;
minify_html = true;
minify_css = true;
minify_js = true;

/*-------------------------------------------------------------------
Required plugins
-------------------------------------------------------------------*/

var gulp = require('gulp'),
    watch = require('gulp-watch'),
    plumber = require('gulp-plumber'),
    notify = require('gulp-notify'),
    nunjucksRender = require('gulp-nunjucks-render'),
    uglify = require('gulp-uglify'),
    htmlmin = require('gulp-htmlmin'),
    tinypng = require('gulp-tinypng'),
    sass = require('gulp-sass'),
    sourcemaps = require('gulp-sourcemaps'),
    zip = require('gulp-zip');

/*-------------------------------------------------------------------
Tasks
-------------------------------------------------------------------*/

// minifies images using tinypng
gulp.task('img', function() {
    $ret = gulp_source(source_path+'images/**/*.+(png|jpg)');
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
    return $ret.pipe(gulp.dest('js'));
});

// Compile sass into CSS
gulp.task('scss', function() {
    if (minify_css) {
        css_output = 'compressed';
    } else {
        css_output = 'expanded';
    }
    $ret = gulp_source(source_path+'scss/**/*.scss')
        .pipe(sourcemaps.init())
        .pipe(sass({
            errLogToConsole: true,
            outputStyle: css_output,
            includePaths: [
                './source/thirdparty/'
            ]
        }))
        .pipe(sourcemaps.write());
    return $ret.pipe(gulp.dest(output_path+'css/'));
});

// Gets .html and .nunjucks files in templates
gulp.task('templates', function() {
    nunjucksRender.nunjucks.configure([source_path+'templates']);
    $ret = gulp_source(source_path+'templates/**/*.+(html|nunjucks)')
        .pipe(nunjucksRender());
    if (minify_html) {
        $ret.pipe(htmlmin({
            collapseWhitespace: true,
            collapseInlineTagWhitespace: true,
            minifyJS: true,
            minifyCSS: true,
            removeComments: true
        }));
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
gulp.task('default', ['img','js','scss','templates','copy','zip']);

// helper function to initiate a task
function gulp_source(path){
    return gulp.src(path)
        .pipe(watch(path))
        .pipe(plumber({errorHandler: notify.onError('Error: <%= error.message %>')}));
}
