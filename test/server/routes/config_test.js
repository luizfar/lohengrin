var expect = require('chai').expect;
var sinon = require('sinon');

suite('config route', function () {
  var route = require('../../../lib/lohengrin/routes/config');
  var config = require('../../../lib/lohengrin/config/all');

  test('json of client config', function () {
    var res = { json: sinon.spy() };

    route.index(undefined, res);

    expect(res.json.lastCall.args[0]).to.deep.equal(config.clientConfig);
  });
});
