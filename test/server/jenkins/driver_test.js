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

    test('encoding', function () {
      var callbacks = { partial: sinon.spy() };
      var request = { setEncoding: sinon.spy(), on: sinon.spy() };
      driver.request('', callbacks);
      httpsRequest.lastCall.args[1](request);
      expect(request.setEncoding.calledWith('utf8')).to.equal(true);
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
        var onData;
        var request = { setEncoding: sinon.spy(), on: function (name, fn) {
          onData = onData || (name === 'data') && fn;
        }};
        driver.request('', callbacks);
        httpsRequest.lastCall.args[1](request);

        onData('chunk1');
        expect(callbacks.partial.calledWith('chunk1')).to.equal(true);
      });

      test('success', function () {
        var callbacks = { success: sinon.spy() };
        var onData, onEnd;
        var request = { setEncoding: sinon.spy(), on: function (name, fn) {
          onData = onData || (name === 'data') && fn;
          onEnd = onEnd || (name === 'end') && fn;
        }};
        driver.request('', callbacks);
        httpsRequest.lastCall.args[1](request);

        onData('chunk1');
        onData('chunk2');
        onEnd();

        expect(callbacks.success.calledWith('chunk1chunk2')).to.equal(true);
      });
    });
  });
});
