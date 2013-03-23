var home = require('./home');
var jenkins = require('./jenkins');
var config = require('./config');

exports.register = function (app) {
  app.get('/', home.index);

  app.get('/jenkins/proxy', jenkins.proxy);
  app.get('/jenkins/jobs', jenkins.jobs);

  app.get('/config', config.index);
};
