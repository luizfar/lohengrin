var expect = chai.expect;

describe('jenkins json', function () {
  beforeEach(function () { sinon.stub(jQuery, 'get'); });
  afterEach(function () { jQuery.get.restore(); });

  it('gets from the proxy', function () {
    var json = JSON.stringify({'first': 'test'});

    lg.jenkinsJson('api/json', sinon.spy());

    expect(jQuery.get.lastCall.args[0]).to.equal('/jenkins/proxy');
    expect(jQuery.get.lastCall.args[1]).to.deep.equal({ path: '/api/json' });
  });
});
