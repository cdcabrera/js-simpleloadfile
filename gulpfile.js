(function(global, undefined){

    var _packageJson    = require('./package.json'),
        _browserSync    = require('browser-sync'),
        _gulp           = require('gulp'),
        _less           = require('gulp-less'),
        _clean          = require('gulp-clean'),
        _concat         = require('gulp-concat'),
        _jshint         = require('gulp-jshint'),
        _wrap           = require('gulp-wrap'),
        _insert         = require('gulp-insert');

    var _settings = {

        version:        _packageJson.version,
        date:           new Date().toDateString(),

        servePath:      './src',

        genericMatch:   ['./src/**/*.md'],
        jsMatch:        ['./src/**/*.js', '!src/**/*.dev.js', '!src/**/*_spec.js'],

        demoMatch:      ['./src/index.htm', './src/index.html'],


        dist:           './dist',
        distJsFile:     (_packageJson.name.toLowerCase() + '.' + _packageJson.version +'.js'),
        distJsFileMin:  (_packageJson.name.toLowerCase() + '.' + _packageJson.version +'.min.js')
    };

    /**
     * Clean up the distribution directory
     */
    _gulp.task('clean', function () {

        return _gulp.src(_settings.dist).pipe(_clean());
    });

    /**
     * Copy markdown, HTML, partials and CSS over to dist
     */
    _gulp.task('copy', ['clean'], function () {

        _gulp.src(_settings.genericMatch, {base: _settings.servePath})
            .pipe(_gulp.dest(_settings.dist));

        //_gulp.src(_settings.indexMatch, {base: _settings.servePath})
        //    .pipe(_gulp.dest(_settings.dist));
    });

    /**
     * JSHint JS files
     */
    _gulp.task('js-hint', function () {

        _gulp.src(_settings.jsMatch)
            .pipe(_jshint())
            .pipe(_jshint.reporter('default'))
            .pipe(_browserSync.reload({ stream: true }));

    });

    /**
     * Concat JS files and move over to dist
     */
    _gulp.task('js', ['clean', 'js-hint'], function () {

        var version     = '//@version ' + _settings.version +', '+ _settings.date + '\n',
            wrapper     = '//@file <%= file.path.split("/").pop() %>\n<%= contents %>',
            iffeWrapper = '(function(window,undefined){\n"use strict";\n<%= contents %>\n})(this);';

        _gulp.src(_settings.jsMatch, { base: _settings.servePath })
            .pipe(_wrap(wrapper))
            .pipe(_concat(_settings.distJsFile))
            .pipe(_wrap(iffeWrapper))
            .pipe(_insert.prepend(version))
            .pipe(_gulp.dest(_settings.dist));
    });

    /**
     * Serve up app directory and watch for file updates
     */
    _gulp.task('browser-sync', function () {

        _browserSync({
            server: {
                baseDir: _settings.servePath,
                directory:true
            }
        });

        _gulp.watch(_settings.jsMatch, ['js-hint']);

        _gulp
            .watch(_settings.demoMatch.concat(_settings.jsMatch))
            .on('change', _browserSync.reload);
    });


    _gulp.task('build', ['copy', 'js']);
    _gulp.task('serve', ['browser-sync']);

})(global);