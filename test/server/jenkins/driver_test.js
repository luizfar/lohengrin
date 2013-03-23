var expect = require('chai').expect;
var sinon = require('sinon');
require('sinon-mocha').enhance(sinon);

describe('jenkins driver', function () {
  process.env['LOHENGRIN_JENKINS_HOSTNAME'] = 'hostname';
  process.env['LOHENGRIN_JENKINS_ROOT'] = 'root';
  process.env['LOHENGRIN_JENKINS_USERNAME'] = 'username';
  process.env['LOHENGRIN_JENKINS_PASSWORD'] = 'password';
  process.env['LOHENGRIN_JENKINS_JOB_FILTER'] = 'job_filter';
  process.env['LOHENGRIN_JENKINS_LAST_JOB_NAME'] = 'last_job_name';

  var driver = require('../../../lib/lohengrin/jenkins/driver');
  var https = require('https');
  var httpsRequest, httpsResponse;

  beforeEach(function () {
    httpsRequest = sinon.stub(https, 'request');
    httpsResponse = { on: sinon.spy(), end: sinon.spy() };
    httpsRequest.returns(httpsResponse);
  });

  it('requests the right path', function () {
    var path = '/path/inside/jenkins';

    driver.request(path);

    expect(httpsRequest.lastCall.args[0]).to.deep.equal({
      hostname: 'hostname',
      auth: 'username:password',
      path: path
    });
  });

  it('adds an error callback', function () {
    var callbacks = { error: sinon.spy() };

    driver.request('path', callbacks);

    expect(httpsResponse.on.lastCall.args[0]).to.equal('error');

    expect(callbacks.error.called).not.to.equal(true);

    httpsResponse.on.lastCall.args[1]('o noes!');

    expect(callbacks.error.lastCall.args[0]).to.equal('o noes!');
  });
});
