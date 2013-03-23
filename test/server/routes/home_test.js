var expect = require('chai').expect;
var sinon = require('sinon');

suite('home route', function () {
  var route = require('../../../lib/lohengrin/routes/home');

  test('json of client config', function () {
    var res = { render: sinon.spy() };

    route.index(undefined, res);

    expect(res.render.lastCall.args[0]).to.equal('home/index');
  });
});
