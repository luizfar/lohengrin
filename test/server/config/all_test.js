var expect = require('chai').expect;
var sinon = require('sinon');

suite('config all', function () {
  var dummyEnv = {
    'LOHENGRIN_JENKINS_HOSTNAME': 'hostname',
    'LOHENGRIN_JENKINS_ROOT': 'root',
    'LOHENGRIN_JENKINS_USERNAME': 'username',
    'LOHENGRIN_JENKINS_PASSWORD': 'password',
    'LOHENGRIN_JENKINS_JOB_FILTER': 'job_filter',
    'LOHENGRIN_JENKINS_LAST_JOB_NAME': 'last_job_name'
  };

  var config = require('../../../lib/lohengrin/config/all');

  setup(function () { config.init(dummyEnv); });

  test('all the configuration params', function () {
    expect(config.jenkins.username).to.equal('username');
    expect(config.jenkins.password).to.equal('password');
    expect(config.jenkins.hostname).to.equal('hostname');
    expect(config.jenkins.rootJobName).to.equal('root');
    expect(config.jobFilter).to.equal('job_filter');
    expect(config.lastJobName).to.equal('last_job_name');
    expect(config.clientConfig.rootJobName).to.equal('root');
    expect(config.clientConfig.jobFilter).to.equal('job_filter');
    expect(config.clientConfig.lastJobName).to.equal('last_job_name');
  });
});
