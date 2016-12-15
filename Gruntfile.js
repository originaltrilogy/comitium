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
      debug: {
        src: ['web/themes/default/source/js/lib/modernizr-dev.js',
              'web/themes/default/source/js/lib/respond.min.js',
              'web/themes/default/source/js/site/immediate.js',
              'web/themes/default/source/js/site/*.js'],
        dest: 'web/themes/default/min/debug.js'
      },
      development: {
        src: ['web/themes/default/source/js/lib/modernizr-dev.js',
              'web/themes/default/source/js/lib/respond.min.js',
              'web/themes/default/source/js/site/immediate.js',
              'web/themes/default/source/js/site/*.js'],
        dest: 'web/themes/default/min/development.js'
      },
      production: {
        src: ['web/themes/default/source/js/lib/modernizr-prod.js',
              'web/themes/default/source/js/lib/respond.min.js',
              'web/themes/default/source/js/site/immediate.js',
              'web/themes/default/source/js/site/*.js'],
        dest: 'web/themes/default/min/production.js'
      }
    },
    sass: {
      dist: {
        options: {
          sourcemap: 'auto'
        },
        files: {
          'web/themes/default/min/production.css': ['web/themes/default/source/scss/env/production.scss'],
          'web/themes/default/min/debug.css': ['web/themes/default/source/scss/env/debug.scss'],
          'web/themes/default/min/development.css': ['web/themes/default/source/scss/env/development.scss'],
          'web/themes/imperial/min/production.css': ['web/themes/imperial/source/scss/env/production.scss'],
          'web/themes/imperial/min/debug.css': ['web/themes/imperial/source/scss/env/debug.scss'],
          'web/themes/imperial/min/development.css': ['web/themes/imperial/source/scss/env/development.scss'],
          'web/themes/rebellious/min/production.css': ['web/themes/rebellious/source/scss/env/production.scss'],
          'web/themes/rebellious/min/debug.css': ['web/themes/rebellious/source/scss/env/debug.scss'],
          'web/themes/rebellious/min/development.css': ['web/themes/rebellious/source/scss/env/development.scss']
        }
      }
    },
    postcss: {
      options: {
        map: {
          inline: false
        },
        processors: [
          require('autoprefixer')({ browsers: 'last 2 versions' }), // add vendor prefixes
          require('cssnano')({ safe: true, colormin: false }) // minify the result
        ]
      },
      default1: {
        src: 'web/themes/default/min/debug.css',
        dest: 'web/themes/default/min/debug.css'
      },
      default2: {
        src: 'web/themes/default/min/development.css',
        dest: 'web/themes/default/min/development.css'
      },
      default3: {
        src: 'web/themes/default/min/production.css',
        dest: 'web/themes/default/min/production.css'
      },
      imperial1: {
        src: 'web/themes/imperial/min/debug.css',
        dest: 'web/themes/imperial/min/debug.css'
      },
      imperial2: {
        src: 'web/themes/imperial/min/development.css',
        dest: 'web/themes/imperial/min/development.css'
      },
      imperial3: {
        src: 'web/themes/imperial/min/production.css',
        dest: 'web/themes/imperial/min/production.css'
      },
      rebellious1: {
        src: 'web/themes/default/min/debug.css',
        dest: 'web/themes/default/min/debug.css'
      },
      rebellious2: {
        src: 'web/themes/default/min/development.css',
        dest: 'web/themes/default/min/development.css'
      },
      rebellious3: {
        src: 'web/themes/default/min/production.css',
        dest: 'web/themes/default/min/production.css'
      }
    },
    uglify: {
      options: {
        mangle: false,
        sourceMap: true,
        sourceMapIncludeSources: true
      },
      dist: {
        files: {
          'web/themes/default/min/production.js': ['web/themes/default/min/production.js']
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
        files: ['web/themes/*/source/scss/**/*.scss'],
        tasks: ['sass', 'postcss'],
        options: {
          livereload: true
        }
      },
      jshint: {
        files: 'web/themes/*/source/js/site/*.js',
        tasks: ['jshint']
      },
      js: {
        files: ['web/themes/*/source/js/lib/*.js',
        'web/themes/*/source/js/site/*.js'],
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
