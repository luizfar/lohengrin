module.exports = function (grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jshint: {
      all: [
        'public/lohengrin/js/**/*.js',
        'app.js',
        'lib/**/*.js',
        'test/client/**/*.js',
        'test/server/**/*.js',
        'Gruntfile.js'
      ],
      options: { jshintrc: '.jshintrc' }
    },
    concat: {
      options: {
        separator: ';;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;\n',
        stripBanners: false,
        banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %> */',
        footer: '/*! <%= pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %> */'
      },
      external: {
        src: [
          'public/external/js/src/lodash.js',
          'public/external/js/src/jquery-v2.0.0-pre.js',
          'public/external/js/src/d3.v3.js',
          'public/external/js/src/require.js'
        ],
        dest: 'public/external/js/all.js'
      }
    },
    simplemocha: {
      all: {
        options: {
          globals: [],
          timeout: 5000,
          ui: 'tdd',
          ignoreLeaks: false,
          reporter: 'list'
        },
        src: [
          'test/server/**/*_test.js'
        ]
      }
    },
    testacular: {
      local: {
        options: {
          configFile: 'testacular.conf.js',
          browsers: [ 'Chrome' ],
          reporters: [ 'dots' ],
          runnerPort: 9101,
          keepalive: true,
          autoWatch: true,
          singleRun: false
        }
      },
      ci: {
        options: {
          configFile: 'testacular.conf.js',
          browsers: [ 'Chrome', 'PhantomJS', 'Firefox' ],
          reporters: [ 'dots' ],
          runnerPort: 9102,
          keepalive: true,
          autoWatch: false,
          singleRun: true
        }
      },
      travis: {
        options: {
          configFile: 'testacular.conf.js',
          browsers: [ 'PhantomJS' ],
          reporters: [ 'dots' ],
          runnerPort: 9102,
          keepalive: true,
          autoWatch: false,
          singleRun: true
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-simple-mocha');
  grunt.loadNpmTasks('grunt-testacular');

  grunt.registerTask('default', ['concat', 'jshint', 'test']);
  grunt.registerTask('test', ['simplemocha', 'testacular:ci']);
  grunt.registerTask('travis', ['concat', 'jshint', 'simplemocha', 'testacular:travis']);
};
