var lg = lg || {};

function init() {
  initSettings(function () {
    lg.jenkins.buildJobTree(function (result) {
      console.debug('Retrieved jobs from Jenkins...');
      console.debug(result);
      var renderer = lg.d3();
      lg.onNewBuild(function (build) {
        renderer.redraw();
        build.onUpdate(renderer.redraw);
      });

      result.root.start();
    });
  });

  function initSettings(callback) {
    $.get('/config', function (config) {
      lg.settings = {
        rootJobName: config.rootJobName,
        jobFilter: config.jobFilter
      };
      callback();
    });
  }
}

(function () {
  $('body').empty();
  init();
})();
