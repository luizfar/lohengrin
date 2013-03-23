module.exports = function (grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    connect: { server: { options: { port: 19999, base: './public/' } } },
    jshint: {
      all: [
        'public/jenkins-crawler/js/**/*.js',
        'app.js',
        'routes/**/*.js',
        'lib/**/*.js',
        'Gruntfile.js'
      ],
      options: { jshintrc: '.jshintrc' }
    },
    concat: {
      options: {
        separator: ';;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;',
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
    }
  });

  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-concat');

  grunt.registerTask('default', ['concat', 'jshint']);
};
