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
      prod: {
        src: ['web/themes/default/source/js/lib/modernizr-prod.js',
              'web/themes/default/source/js/lib/respond.min.js',
              'web/themes/default/source/js/site/immediate.js',
              'web/themes/default/source/js/site/*.js'],
        dest: 'web/themes/default/min/production.js'
      }
    },
    sass: {
      debug: {
        options: {
          sourcemap: 'auto'
        },
        files: {
          'web/themes/default/min/debug.css': ['web/themes/default/source/scss/env/debug.scss'],
          'web/themes/imperial/min/debug.css': ['web/themes/imperial/source/scss/env/debug.scss'],
          'web/themes/ot-light/min/debug.css': ['web/themes/ot-light/source/scss/env/debug.scss'],
          'web/themes/rebellious/min/debug.css': ['web/themes/rebellious/source/scss/env/debug.scss']
        }
      },
      prod: {
        options: {
          sourcemap: 'auto'
        },
        files: {
          'web/themes/default/min/production.css': ['web/themes/default/source/scss/env/production.scss'],
          'web/themes/imperial/min/production.css': ['web/themes/imperial/source/scss/env/production.scss'],
          'web/themes/ot-light/min/production.css': ['web/themes/ot-light/source/scss/env/production.scss'],
          'web/themes/rebellious/min/production.css': ['web/themes/rebellious/source/scss/env/production.scss']
        }
      }
    },
    postcss: {
      debug: {
        options: {
          processors: [
            require('autoprefixer')({ browsers: 'last 2 versions' }), // add vendor prefixes
            require('cssnano')({ safe: true, colormin: false }) // minify the result
          ]
        },
        default: {
          src: 'web/themes/default/min/debug.css',
          dest: 'web/themes/default/min/debug.css'
        },
        imperial: {
          src: 'web/themes/imperial/min/debug.css',
          dest: 'web/themes/imperial/min/debug.css'
        },
        otlight: {
          src: 'web/themes/ot-light/min/debug.css',
          dest: 'web/themes/ot-light/min/debug.css'
        },
        rebellious: {
          src: 'web/themes/default/min/debug.css',
          dest: 'web/themes/default/min/debug.css'
        },
      },
      prod: {
        options: {
          map: {
            inline: false
          },
          processors: [
            require('autoprefixer')({ browsers: 'last 2 versions' }), // add vendor prefixes
            require('cssnano')({ safe: true, colormin: false }) // minify the result
          ]
        },
        default: {
          src: 'web/themes/default/min/production.css',
          dest: 'web/themes/default/min/production.css'
        },
        imperial: {
          src: 'web/themes/imperial/min/production.css',
          dest: 'web/themes/imperial/min/production.css'
        },
        otlight: {
          src: 'web/themes/ot-light/min/production.css',
          dest: 'web/themes/ot-light/min/production.css'
        },
        rebellious: {
          src: 'web/themes/default/min/production.css',
          dest: 'web/themes/default/min/production.css'
        }
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
        tasks: ['sass:debug', 'postcss:debug'],
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
        tasks: ['concat:debug'],
        options: {
          livereload: true
        }
      }
    }
  });

  require('load-grunt-tasks')(grunt);
  grunt.registerTask('debug', ['sass:debug', 'postcss:debug', 'jshint', 'concat:debug', 'watch']);
  grunt.registerTask('prod', ['sass:prod', 'postcss:prod', 'jshint', 'concat:prod', 'uglify']);
};
