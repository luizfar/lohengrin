var expect = chai.expect;

suite('semaphore', function () {
  test('waiting for count', function () {
    var callback = sinon.spy();
    var semaphore = lg.semaphore(3, callback);

    expect(callback.called).to.equal(false);

    semaphore.signal();
    expect(callback.called).to.equal(false);

    semaphore.signal();
    expect(callback.called).to.equal(false);

    semaphore.signal();
    expect(callback.called).to.equal(true);
  });

  test('reset', function () {
    var callback = sinon.spy();
    var semaphore = lg.semaphore(2, callback);

    expect(callback.called).to.equal(false);

    semaphore.signal();
    expect(callback.called).to.equal(false);

    semaphore.reset();

    semaphore.signal();
    expect(callback.called).to.equal(false);

    semaphore.signal();
    expect(callback.called).to.equal(true);
  });
});
