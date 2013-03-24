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

  suite('status', function () {
    test('failure', function () { expect(dummyBuild({ color: 'red' }).status).to.equal('failure'); });
    test('success', function () { expect(dummyBuild({ color: 'blue' }).status).to.equal('success'); });
    test('building', function () { expect(dummyBuild({ color: 'banana anime' }).status).to.equal('building'); });
    test('aborted', function () { expect(dummyBuild({ color: 'banana' }).status).to.equal('aborted'); });
  });
});
