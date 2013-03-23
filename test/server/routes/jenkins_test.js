var expect = require('chai').expect;
var sinon = require('sinon');

suite('jenkins route', function () {
  var driver = require('../../../lib/lohengrin/jenkins/driver');
  var route = require('../../../lib/lohengrin/routes/jenkins');
  var req, res;

  setup(function () {
    sinon.stub(driver, 'request');
    req = { query: { path: '' } };
    res = { write: sinon.spy(), end: sinon.spy(), json: sinon.spy() };
  });

  teardown(function () {
    driver.request.restore();
  });

  suite('proxy', function () {
    test('path', function () {
      req.query.path = 'path-inside-jenkins';
      route.proxy(req, res);
      expect(driver.request.lastCall.args[0]).to.equal('path-inside-jenkins');
    });

    suite('callbacks', function () {
      test('error', function () {
        route.proxy(req, res);
        driver.request.lastCall.args[1].error('noooo!');
        expect(res.json.calledWith('noooo!')).to.equal(true);
      });

      test('partial', function () {
        route.proxy(req, res);
        driver.request.lastCall.args[1].partial('part of it');
        expect(res.write.calledWith('part of it')).to.equal(true);
      });

      test('success', function () {
        route.proxy(req, res);
        driver.request.lastCall.args[1].success();
        expect(res.end.called).to.equal(true);
      });
    });
  });
});

