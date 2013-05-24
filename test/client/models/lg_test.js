var expect = chai.expect;

describe('lohengrin', function () {

  function dummyJob(jobName, isRoot) {
    var job = lg.job(jobName, 'http://localhost/');
    job.isRoot = function () { return isRoot; };
    return job;
  }

  function dummyBuild(jobName, buildNumber, isRoot) {
    return lg.build(dummyJob(jobName, isRoot), buildNumber);
  }

  beforeEach(function () {
    lg.reset();
  });

  it('creates a tree when adding a new root build', function () {
    var rootBuild = dummyBuild('Dummy', 1, true);
    lg.addBuild(rootBuild);

    var tree = lg.trees['Dummy#1'];
    expect(tree.roots.length).to.equal(1);
    expect(tree.roots[0]).to.equal(rootBuild);
  });

  it('can have multiple trees', function () {
    var rootBuild1 = dummyBuild('Root', 1, true);
    lg.addBuild(rootBuild1);

    var rootBuild2 = dummyBuild('Root', 2, true);
    lg.addBuild(rootBuild2);

    expect(lg.trees['Root#1'].roots.length).to.equal(1);
    expect(lg.trees['Root#1'].roots[0]).to.equal(rootBuild1);
    expect(lg.trees['Root#2'].roots.length).to.equal(1);
    expect(lg.trees['Root#2'].roots[0]).to.equal(rootBuild2);
  });

  it('can merge trees', function () {
    var rootJob = dummyJob('Root', true);
    var childJob = dummyJob('Child', false);
    rootJob.addChild(childJob);

    var rootBuild1 = lg.build(rootJob, 1);
    lg.addBuild(rootBuild1);
    var rootBuild2 = lg.build(rootJob, 2);
    lg.addBuild(rootBuild2);

    var mergingBuild = lg.build(childJob, 1);
    rootBuild1.addChild(mergingBuild);
    rootBuild2.addChild(mergingBuild);
    lg.addBuild(mergingBuild);

    expect(lg.trees['Root#1']).to.equal(lg.trees['Root#2']);
  });
});
