var expect = chai.expect;

suite('jenkins json', function () {
  setup(function () {
    sinon.stub(jQuery, 'get');
    sinon.spy(console, 'error');
  });
  teardown(function () {
    jQuery.get.restore();
    console.error.restore();
  });

  test('right path', function () {
    lg.jenkinsJson('api/json', sinon.spy());
    expect(jQuery.get.lastCall.args[0]).to.equal('/jenkins/proxy');
    expect(jQuery.get.lastCall.args[1]).to.deep.equal({ path: '/api/json' });
  });

  test('no dumb //', function () {
    lg.jenkinsJson('/api/json', sinon.spy());
    expect(jQuery.get.lastCall.args[1]).to.deep.equal({ path: '/api/json' });
  });

  test('callback', function () {
    var callback = sinon.spy();
    var json = '{ "hello": "there" }';
    lg.jenkinsJson('', callback);
    jQuery.get.lastCall.args[2](json);
    expect(callback.lastCall.args[0]).to.deep.equal(JSON.parse(json));
  });

  suite('broken response', function () {
    test('more than 5 tries', function () {
      lg.jenkinsJson('', sinon.spy(), 5);
      expect(jQuery.get.called).to.equal(false);
      expect(console.error.lastCall.args[0]).to.match(/giving up/i);
    });

    test('up to 5 tries', function () {
      jQuery.get.yields('<html>nooooo!</html>');
      lg.jenkinsJson('', sinon.spy(), 0);
      expect(jQuery.get.callCount).to.equal(5);
      expect(console.error.getCall(0).args[0]).to.match(/error parsing response/i);
      expect(console.error.getCall(1).args[0]).to.match(/error parsing response/i);
      expect(console.error.getCall(2).args[0]).to.match(/error parsing response/i);
      expect(console.error.getCall(3).args[0]).to.match(/error parsing response/i);
      expect(console.error.getCall(4).args[0]).to.match(/error parsing response/i);
      expect(console.error.lastCall.args[0]).to.match(/giving up/i);
    });
  });
});
