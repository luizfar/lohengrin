var expect = require('chai').expect;
var sinon = require('sinon');

suite('config route', function () {
  var configRoute = require('../../../lib/lohengrin/routes/config');
  var jenkinsRoute = require('../../../lib/lohengrin/routes/jenkins');
  var homeRoute = require('../../../lib/lohengrin/routes/home');
  var allRoutes = require('../../../lib/lohengrin/routes/all');

  test('json of client config', function () {
    var app = { get: sinon.spy() };

    allRoutes.register(app);

    expect(app.get.calledWith('/', homeRoute.index)).to.equal(true);

    expect(app.get.calledWith('/jenkins/proxy', jenkinsRoute.proxy)).to.equal(true);
    expect(app.get.calledWith('/jenkins/jobs', jenkinsRoute.jobs)).to.equal(true);

    expect(app.get.calledWith('/config', configRoute.index)).to.equal(true);
  });
});
