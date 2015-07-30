// Gruntfile

'use strict';

module.exports = function (grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jshint: {
      files: 'web/themes/default/source/js/site/*.js',
      options: {
        jshintrc: true
      }
    },
    concat: {
      dist: {
        src: ['web/themes/default/source/js/lib/*.js', 'web/themes/default/source/js/site/immediate.js', 'web/themes/default/source/js/site/*.js'],
        dest: 'web/themes/default/app.js'
      }
    },
    imagemin: {
      options: {
        cache: false
      },
      files: [{
        expand: true,
        cwd: 'web/themes/default/images/',
        src: ['**/*.{png,jpg,gif}'],
        dest: 'web/themes/default/images/'
      }]
    },
    sass: {
      dist: {
        options: {
          sourcemap: 'auto'
        },
        files: {
          'web/themes/default/production.css': ['web/themes/default/source/scss/_production.scss'],
          'web/themes/default/debug.css': ['web/themes/default/source/scss/_debug.scss'],
          'web/themes/default/development.css': ['web/themes/default/source/scss/_development.scss']
        }
      }
    },
    postcss: {
      options: {
        map: {
          inline: false
        },
        processors: [
          require('autoprefixer-core')({ browsers: 'last 2 versions' }), // add vendor prefixes 
          require('cssnano')() // minify the result 
        ]
      },
      dist: {
        src: 'web/themes/default/production.css',
        dest: 'web/themes/default/production.css'
      },
      dist2: {
        src: 'web/themes/default/debug.css',
        dest: 'web/themes/default/debug.css'
      },
      dist3: {
        src: 'web/themes/default/development.css',
        dest: 'web/themes/default/development.css'
      }
    },
    uglify: {
      options: {
        sourceMap: true,
        sourceMapIncludeSources: true
      },
      dist: {
        files: {
          'web/themes/default/app.js': ['web/themes/default/app.js']
        }
      }
    },
    watch: {
      views: {
        files: ['app/patterns/views/**/*.jade', 'app/patterns/views/**/*.hbs', 'app/patterns/views/**/*.html'],
        options: {
          livereload: true
        }
      },
      css: {
        files: ['web/themes/default/source/scss/**/*.scss'],
        tasks: ['sass', 'postcss'],
        options: {
          livereload: true
        }
      },
      images: {
        files: 'web/themes/default/images/**/*.{png,jpg,gif}',
        tasks: ['imagemin'],
        options: {
          livereload: true
        }
      },
      jshint: {
        files: 'web/themes/default/source/js/site/*.js',
        tasks: ['jshint']
      },
      js: {
        files: ['web/themes/default/source/js/lib/*.js',
        'web/themes/default/source/js/site/*.js'],
        tasks: ['concat', 'uglify'],
        options: {
          livereload: true
        }
      }
    }
  });

  require('load-grunt-tasks')(grunt);
  grunt.registerTask('default', ['sass', 'postcss', 'jshint', 'concat', 'uglify', 'watch']);
};
