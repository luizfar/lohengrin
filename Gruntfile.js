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
    }
  });

  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-jshint');

  grunt.registerTask('default', ['jshint']);
};
