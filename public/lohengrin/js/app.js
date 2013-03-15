var lg = lg || {};

lg.debugObjects = [lg, lg.build, lg.job, lg.sidebar];

function init() {
  initSettings(function () {
    lg.jenkins.buildJobTree(function (result) {
      lg.debug(lg, 'Retrieved jobs from Jenkins...');
      lg.debug(lg, result);
      var renderer = lg.d3();
      var sidebar = lg.sidebar();
      lg.onNewBuild(function (build) {
        renderer.redraw();
        sidebar.addBuild(build);
        build.onUpdate(renderer.redraw);
      });

      result.root.start();
    });
  });

  function initSettings(callback) {
    $.get('/config', function (config) {
      lg.settings = {
        rootJobName: config.rootJobName,
        jobFilter: config.jobFilter,
        lastJobName: config.lastJobName
      };
      callback();
    });
  }
}

(function () {
  $('body').empty();
  init();
})();
