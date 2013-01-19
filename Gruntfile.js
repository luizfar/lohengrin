'use strict';
module.exports = function (grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    qunit: { all: ['http://localhost:19999/jenkins-crawler/tests/all.html'] },
    connect: { server: { options: { port: 19999, base: './public/' } } },
    jshint: {
      all: [
        'public/jenkins-crawler/js/**/*.js',
        'app.js',
        'routes/**/*.js',
        'lib/**/*.js',
        'Gruntfile.js'
      ],
      options: {
        indent: 2,
        expr: true,
        bitwise: true,
        camelcase: true,
        curly: true,
        immed: true,
        noarg: true,
        nonew: true,
        plusplus: true,
        quotmark: 'single',
        trailing: true,
        maxparams: 3,
        maxlen: 150,
        browser: true,
        nomen: true,
        node: true,
        jquery: true,
        globals: {
          '$': true,
          'jQuery': true,
          'console': true,
          'equal': true,
          'ok': true,
          'expect': true,
          'sinon': true,
          'module': true,
          'QUnit': true,
          'test': true,
          'require': true,
          'define': true,
          '_': true
        },
        undef: true
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-qunit');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-jshint');

  grunt.registerTask('test', ['connect', 'qunit']);
  grunt.registerTask('default', ['jshint', 'test']);
};
