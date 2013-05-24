var expect = chai.expect;

describe('tree', function () {

  var rootJob, middleJob1, middleJob2, lastJob, rootBuild, middleBuild1, middleBuild2;

  beforeEach(function () {
    lg.reset();

    rootJob = lg.job('Root', 'url');
    middleJob1 = lg.job('Middle1', 'url');
    middleJob2 = lg.job('Middle2', 'url');
    lastJob = lg.job('Last', 'url');
    lastJob.isLast = true;

    rootJob.addChild(middleJob1);
    rootJob.addChild(middleJob2);
    middleJob1.addChild(lastJob);
    middleJob2.addChild(lastJob);

    rootBuild = lg.build(rootJob, 1);
    middleBuild1 = lg.build(middleJob1, 1);
    middleBuild2 = lg.build(middleJob2, 1);

    rootBuild.addChild(middleBuild1);
    rootBuild.addChild(middleBuild2);

    rootBuild.status = 'success';
    middleBuild1.status = 'success'
    middleBuild2.status = 'success'

    lg.addBuild(rootBuild);
    lg.addBuild(middleBuild1);
    lg.addBuild(middleBuild2);
  });

  it('is not done when it does not include a last build', function () {
    expect(lg.trees[rootBuild.code].isFinished()).to.be.false;
  });

  it('is done when it includes a last build', function () {
    var lastBuild = lg.build(lastJob, 1);
    lastBuild.status = 'success'
    middleBuild1.addChild(lastBuild);
    lg.addBuild(lastBuild);

    expect(lg.trees[rootBuild.code].isFinished()).to.be.true;
  });

  it('is done when it has a failed build', function () {
    middleBuild1.status = 'failure';
    middleBuild1.updated();

    expect(lg.trees[rootBuild.code].isFinished()).to.be.true;
  });
});
