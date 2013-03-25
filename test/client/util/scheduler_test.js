var expect = chai.expect;

suite('scheduler', function () {
  // ugly hack because PhantomJS doesn't like people messing with setTimeout
  // this test will not be run on PhantomJS as a result :(
  if ((/phantomjs/i).test(navigator.userAgent)) { return; }

  setup(function () { sinon.stub(window, 'setTimeout'); });
  teardown(function () { window.setTimeout.restore(); });

  test('every', function () {
    var callback = sinon.spy();
    lg.every(12345, callback);

    expect(window.setTimeout.calledWith(callback, 12345)).to.equal(true);
  });
});
