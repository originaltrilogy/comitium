'use strict'

var autoprefixer  = require('autoprefixer'),
    concat        = require('gulp-concat'),
    cssnano       = require('gulp-cssnano'),
    filter        = require('gulp-filter'),
    gulp          = require('gulp'),
    livereload    = require('gulp-livereload'),
    postcss       = require('gulp-postcss'),
    sass          = require('gulp-sass'),
    sourcemaps    = require('gulp-sourcemaps'),
    uglify        = require('gulp-uglify-es').default

var themes = [
      {
        // Dark Side theme
        name: 'Default',
        path: 'default'
      },
      // {
      //   name: 'Imperial',
      //   path: 'imperial'
      // },
      {
        name: 'LightSide',
        path: 'light-side'
      },
      // {
      //   name: 'Rebellious',
      //   path: 'rebellious'
      // }
    ],
    buildTasks = []

themes.forEach( function (item, index) {
  buildTasks[index] = 'css' + item.name

  gulp.task('css' + item.name, function (done) {
    gulp.src('web/themes/' + item.path + '/source/scss/site.scss')
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(postcss([autoprefixer({ browsers: 'last 2 versions' })]))
        .pipe(cssnano({ safe: true, colormin: false }))
        .pipe(sourcemaps.write(''))
        .pipe(gulp.dest('web/themes/' + item.path + '/min'))
        .pipe(filter('**/*.css*'))
        .pipe(livereload())
    done()
  })
})

buildTasks.push('js')

gulp.task('js', function (done) {
  gulp.src([
            'web/themes/default/source/js/site/immediate.js',
            'web/themes/default/source/js/site/**.js',
            'web/themes/default/source/js/lib/svgxuse.min.js'
          ])
      .pipe(sourcemaps.init())
      .pipe(uglify())
      .pipe(concat('site.js'))
      .pipe(sourcemaps.write(''))
      .pipe(gulp.dest('web/themes/default/min'))
      .pipe(livereload())
  done()
})

gulp.task('reload', function (done) {
  // Give citizen time to reload the module before refreshing
  setTimeout(function () {
    livereload.reload()
  }, 500)
  done()
})

gulp.task('watch', function (done) {
  livereload.listen()
  themes.forEach( function (item) {
    gulp.watch('web/themes/default/source/scss/**/**.scss', gulp.parallel('css' + item.name))
  })
  themes.forEach( function (item) {
    if ( item.name !== 'Default') {
      gulp.watch('web/themes/' + item.path + '/source/scss/**/**.scss', gulp.parallel('css' + item.name))
    }
  })
  gulp.watch('web/themes/default/source/js/**/**.js', gulp.parallel('js'))
  gulp.watch('app/patterns/**', gulp.parallel('reload'))
  gulp.watch('app/toolbox/**', gulp.parallel('reload'))
  gulp.watch('web/**/**.html', gulp.parallel('reload'))
  done()
})

gulp.task('default', gulp.parallel('watch'))
gulp.task('all', gulp.parallel(buildTasks))
