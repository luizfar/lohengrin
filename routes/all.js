'use strict';

var home = require('./home'),
    jenkins = require('./jenkins'),
    config = require('./config');

exports.register = function (app) {
  app.get('/', home.index);

  app.get('/jenkins/proxy', jenkins.proxy);
  app.get('/jenkins/jobs', jenkins.jobs);

  app.get('/config', config.index);
};
