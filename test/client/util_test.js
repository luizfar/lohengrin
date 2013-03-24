var expect = chai.expect;

suite('jenkins json', function () {
  setup(function () { sinon.stub(jQuery, 'get'); });
  teardown(function () { jQuery.get.restore(); });

  test('gets from the proxy', function () {
    lg.jenkinsJson('api/json', sinon.spy());

    expect(jQuery.get.lastCall.args[0]).to.equal('/jenkins/proxy');
    expect(jQuery.get.lastCall.args[1]).to.deep.equal({ path: '/api/json' });
  });
});
