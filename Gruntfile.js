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
        dest: 'web/themes/default/production.js'
      },
      dist2: {
        src: ['web/themes/default/source/js/lib/*.js', 'web/themes/default/source/js/site/immediate.js', 'web/themes/default/source/js/site/*.js'],
        dest: 'web/themes/default/development.js'
      },
      dist3: {
        src: ['web/themes/default/source/js/lib/*.js', 'web/themes/default/source/js/site/immediate.js', 'web/themes/default/source/js/site/*.js'],
        dest: 'web/themes/default/debug.js'
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
          sourcemap: 'inline'
        },
        files: {
          'web/themes/default/development.css': ['web/themes/default/source/scss/app.scss'],
          'web/themes/default/debug.css': ['web/themes/default/source/scss/app.scss']
        }
      }
    },
    autoprefixer: {
      dist: {
        app: {
          src: 'web/themes/default/app.css',
          dest: 'web/themes/default/app.css'
        },
        options: {
          map: true
        }
      }
    },
    cssmin: {
      dist: {
        files: {
          'web/themes/default/production.css': ['web/themes/default/development.css']
        }
      }
    },
    uglify: {
      options: {
        sourceMap: true,
        sourceMapIncludeSources: true
      },
      dist: {
        files: {
          'web/themes/default/production.js': ['web/themes/default/production.js']
        }
      }
    },
    watch: {
      views: {
        files: ['app/patterns/views/**/*.jade', 'app/patterns/views/**/*.hbs'],
        options: {
          livereload: true
        }
      },
      css: {
        files: ['web/themes/default/source/scss/**/*.scss'],
        tasks: ['sass', 'autoprefixer', 'cssmin'],
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
  grunt.registerTask('default', ['sass', 'autoprefixer', 'cssmin', 'jshint', 'concat', 'uglify', 'watch']);
};
