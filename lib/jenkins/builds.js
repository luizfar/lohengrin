'use strict';

var jobs = require('./jobs');

exports.create = function (params) {
  var build = _.extend({
    number: -1,
    'status': 'invalid',
    job: undefined,
    triggeredBy: undefined
  }, params);

  if (build.job instanceof String) {
    build.job = jobs.findByName(build.job);
  }

  return build;
};
