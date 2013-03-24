var lg = lg || {};

lg.debugObjects = [lg, lg.sidebar];

(function () {
  function init() {
    initSettings(function () {
      lg.jenkins.buildJobTree(function (result) {
        lg.debug(lg, 'Retrieved jobs from Jenkins...');
        lg.debug(lg, result);
        var renderer = lg.d3();
        lg.onNewBuild(function (build) {
          renderer.redraw();
          build.onUpdate(renderer.redraw);
        });

        result.root.start();

        var sidebar = lg.sidebar();
        sidebar.start();
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

  $('body').empty();
  init();
})();
