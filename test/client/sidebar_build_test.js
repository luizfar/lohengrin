var expect = chai.expect;

suite('sidebar build', function () {
  function dummyBuild(extras, index, bigBuildsCount) {
    return lg.sidebarBuild(
      _({
        color: 'magenta',
        name: 'dummy',
        lastBuild: { number: 0 }
      }).extend(extras).value(),
      index,
      bigBuildsCount
    );
  }

  test('display name', function () {
    expect(
      dummyBuild({ name: 'name', lastBuild: { number: 10 } }).displayName
    ).to.equal('name#10');
  });

  test('code', function () {
    expect(
      dummyBuild({ name: 'name', lastBuild: { number: 10 }, color: 'red' }).code
    ).to.equal('name#10failure');
  });

  test('id', function () {
    expect(
      dummyBuild({ name: 'name', lastBuild: { number: 10 }, color: 'red' }).id
    ).to.equal('name#10failurefailure');
  });

  test('index', function () {
    expect(dummyBuild({}, 42).index).to.equal(42);
  });

  suite('status', function () {
    test('failure', function () { expect(dummyBuild({ color: 'red' }).status).to.equal('failure'); });
    test('success', function () { expect(dummyBuild({ color: 'blue' }).status).to.equal('success'); });
    test('building', function () { expect(dummyBuild({ color: 'banana anime' }).status).to.equal('building'); });
    test('aborted', function () { expect(dummyBuild({ color: 'banana' }).status).to.equal('aborted'); });
  });

  suite('color', function () {
    test('red', function () { expect(dummyBuild({ color: 'red' }).color).to.equal('red'); });
    test('green', function () { expect(dummyBuild({ color: 'blue' }).color).to.equal('green'); });
    test('yellow', function () { expect(dummyBuild({ color: 'banana anime' }).color).to.equal('yellow'); });
    test('gray', function () { expect(dummyBuild({ color: 'banana' }).color).to.equal('gray'); });
  });
});
