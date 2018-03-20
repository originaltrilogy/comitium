'use strict';

var autoprefixer  = require('autoprefixer'),
    gulp          = require('gulp'),
    concat        = require('gulp-concat'),
    cssnano       = require('gulp-cssnano'),
    filter        = require('gulp-filter'),
    livereload    = require('gulp-livereload'),
    postcss       = require('gulp-postcss'),
    sass          = require('gulp-sass'),
    sourcemaps    = require('gulp-sourcemaps'),
    uglify        = require('gulp-uglify');

var themes = [
      {
        name: 'Default',
        path: 'default'
      },
      // {
      //   name: 'Imperial',
      //   path: 'imperial'
      // },
      {
        name: 'OTLight',
        path: 'ot-light'
      },
      // {
      //   name: 'Rebellious',
      //   path: 'rebellious'
      // }
    ],
    debugTasks = [],
    prodTasks = [];


function css(options) {
  return gulp.src('web/themes/' + options.theme + '/source/scss/env/' + options.env + '.scss')
             .pipe(sourcemaps.init())
               .pipe(sass().on('error', sass.logError))
               .pipe(postcss([autoprefixer({ browsers: 'last 2 versions' })]))
               .pipe(cssnano({ safe: true, colormin: false }))
               .pipe(sourcemaps.write(''))
             .pipe(gulp.dest('web/themes/' + options.theme + '/min'))
             .pipe(filter('**/*.css'))
             .pipe(livereload());
}


themes.forEach( function (item, index, array) {
  debugTasks[index] = 'cssDebug' + item.name;
  prodTasks[index] = 'cssProd' + item.name;

  gulp.task('cssDebug' + item.name, function () {
    css({ env: 'debug', theme: item.path });
  });
  gulp.task('cssProd' + item.name, function () {
    css({ env: 'production', theme: item.path });
  });
});

debugTasks.push('jsDebug');
prodTasks.push('jsProd');


gulp.task('jsDebug', function () {
  return gulp.src(['web/themes/default/source/js/lib/modernizr-dev.js',
                   'web/themes/default/source/js/lib/respond.min.js',
                   'web/themes/default/source/js/site/immediate.js',
                   'web/themes/default/source/js/site/**.js'
                  ])
             .pipe(sourcemaps.init())
               .pipe(uglify())
               .pipe(concat('debug.js'))
               .pipe(sourcemaps.write(''))
             .pipe(gulp.dest('web/themes/default/min'))
             .pipe(livereload());
});

gulp.task('jsProd', function () {
  return gulp.src(['web/themes/default/source/js/lib/modernizr-prod.js',
                   'web/themes/default/source/js/lib/respond.min.js',
                   'web/themes/default/source/js/site/immediate.js',
                   'web/themes/default/source/js/site/**.js'
                  ])
             .pipe(sourcemaps.init())
               .pipe(uglify())
               .pipe(concat('production.js'))
               .pipe(sourcemaps.write(''))
             .pipe(gulp.dest('web/themes/default/min'))
             .pipe(livereload());
});

gulp.task('views', function () {
  livereload.reload();
  return;
});

gulp.task('watch', function() {
  livereload.listen();
  themes.forEach( function (item, index, array) {
    gulp.watch('web/themes/default/source/scss/**/**.scss', ['cssDebug' + item.name]);
  });
  themes.forEach( function (item, index, array) {
    if ( item.name !== 'Default') {
      gulp.watch('web/themes/' + item.path + '/source/scss/**/**.scss', ['cssDebug' + item.name]);
    }
  });
  gulp.watch('web/themes/default/source/js/**/**.js', ['jsDebug']);
  gulp.watch('app/patterns/views/**/**.jade', ['views']);
  gulp.watch('web/**/**.jade', ['views']);
});

// gulp.task('default', ['css']);
gulp.task('default', ['watch']);
gulp.task('debug', debugTasks);
gulp.task('prod', prodTasks);
gulp.task('all', debugTasks.concat(prodTasks));