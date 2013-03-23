var expect = require('chai').expect;
var sinon = require('sinon');

suite('jenkins driver', function () {
  var dummyEnv = {
    'LOHENGRIN_JENKINS_HOSTNAME': 'hostname',
    'LOHENGRIN_JENKINS_USERNAME': 'username',
    'LOHENGRIN_JENKINS_PASSWORD': 'password'
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

  suite('request', function () {
    test('path', function () {
      var path = '/path/inside/jenkins';
      driver.request(path);
      expect(httpsRequest.lastCall.args[0]).to.deep.equal({
        hostname: 'hostname',
        auth: 'username:password',
        path: path
      });
    });

    suite('callbacks', function () {
      test('error', function () {
        var callbacks = { error: sinon.spy() };
        driver.request('', callbacks);
        expect(httpsResponse.on.calledWith('error')).to.equal(true);

        httpsResponse.on.lastCall.args[1]('o noes!');
        expect(callbacks.error.lastCall.args[0]).to.equal('o noes!');
      });

      test('partial', function () {
        var callbacks = { partial: sinon.spy() };
        driver.request('', callbacks);
      });

      test('success', function () {
        var callbacks = { success: sinon.spy() };
        driver.request('', callbacks);
      });
    });
  });
});
