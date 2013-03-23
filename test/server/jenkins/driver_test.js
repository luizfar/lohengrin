var expect = require('chai').expect;
var sinon = require('sinon');

suite('jenkins driver', function () {
  var dummyEnv = {
    'LOHENGRIN_JENKINS_HOSTNAME': 'hostname',
    'LOHENGRIN_JENKINS_ROOT': 'root',
    'LOHENGRIN_JENKINS_USERNAME': 'username',
    'LOHENGRIN_JENKINS_PASSWORD': 'password',
    'LOHENGRIN_JENKINS_JOB_FILTER': 'job_filter',
    'LOHENGRIN_JENKINS_LAST_JOB_NAME': 'last_job_name'
  };

  require('../../../lib/lohengrin/config/all').init(dummyEnv);

  var https = require('https');
  var httpsRequest, httpsResponse;
  var driver = require('../../../lib/lohengrin/jenkins/driver');

  setup(function () {
    httpsRequest = sinon.stub(https, 'request');
    httpsResponse = { on: sinon.spy(), end: sinon.spy() };
    httpsRequest.returns(httpsResponse);
  });

  teardown(function () {
    httpsRequest.restore();
  });

  test('requests the right path', function () {
    var path = '/path/inside/jenkins';

    driver.request(path);

    expect(httpsRequest.lastCall.args[0]).to.deep.equal({
      hostname: 'hostname',
      auth: 'username:password',
      path: path
    });
  });

  test('adds an error callback', function () {
    var callbacks = { error: sinon.spy() };

    driver.request('path', callbacks);

    expect(httpsResponse.on.lastCall.args[0]).to.equal('error');

    expect(callbacks.error.called).not.to.equal(true);

    httpsResponse.on.lastCall.args[1]('o noes!');

    expect(callbacks.error.lastCall.args[0]).to.equal('o noes!');
  });
});
