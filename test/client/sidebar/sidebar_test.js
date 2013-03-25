var expect = chai.expect;

suite('sidebar', function () {
  setup(function () {
    sinon.stub(lg, 'every');
    sinon.stub(lg, 'jenkinsJson');
    sinon.stub(lg.jenkins, 'hasJob');
    $('body').append($('<div id="sidebar"></div>'));
  });

  teardown(function () {
    lg.every.restore();
    lg.jenkinsJson.restore();
    lg.jenkins.hasJob.restore();
    $('#sidebar').remove();
  });

  suite('start', function () {
    var sidebar;
    setup(function () { (sidebar = lg.sidebar()).start(); });

    test('jenkins json', function () {
      expect(lg.jenkinsJson.lastCall.args[0]).to.equal(
        'api/json?tree=jobs[name,url,color,lastBuild[number]]'
      );
    });

    test('reschedule', function () {
      lg.jenkinsJson.invokeCallback({});
      expect(lg.every.calledWith(30000, sidebar.start)).to.equal(true);
    });

    suite('builds', function () {
      test('sucess', function () {
        lg.jenkins.hasJob.returns(true);
        lg.jenkinsJson.invokeCallback({
          jobs: [
            { color: 'banana', name: '', lastBuild: {} },
            { color: 'green', name: '', lastBuild: {} },
            { color: 'red', name: '', lastBuild: {} },
            { color: 'green anime', name: '', lastBuild: {} },
            { color: 'blue', name: '', lastBuild: {} }
          ]
        });

        expect(_(sidebar.listBuilds('successful')).pluck('color').value()).to.deep.equal(
          ['banana', 'green', 'blue']
        );
      });

      test('failure', function () {
        lg.jenkins.hasJob.returns(true);
        lg.jenkinsJson.invokeCallback({
          jobs: [
            { color: 'banana', name: '', lastBuild: {} },
            { color: 'green', name: '', lastBuild: {} },
            { color: 'red', name: '', lastBuild: {} },
            { color: 'green anime', name: '', lastBuild: {} },
            { color: 'blue', name: '', lastBuild: {} }
          ]
        });

        expect(_(sidebar.listBuilds('failed')).pluck('color').value()).to.deep.equal(
          ['red']
        );
      });

      test('progress', function () {
        lg.jenkins.hasJob.returns(true);
        lg.jenkinsJson.invokeCallback({
          jobs: [
            { color: 'banana', name: '', lastBuild: {} },
            { color: 'green', name: '', lastBuild: {} },
            { color: 'red', name: '', lastBuild: {} },
            { color: 'green anime', name: '', lastBuild: {} },
            { color: 'banana anime', name: '', lastBuild: {} },
            { color: 'blue', name: '', lastBuild: {} }
          ]
        });

        expect(_(sidebar.listBuilds('inProgress')).pluck('color').value()).to.deep.equal(
          ['green anime', 'banana anime']
        );
      });
    });
  });
});
