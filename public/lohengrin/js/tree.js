var lg = lg || {};

lg.tree = function (root) {
  var self = {};
  self.roots = [root];

  var finished = false;
  var newestBuild = root;

  self.mergeWith = function (tree) {
    _.each(tree.roots, function (root) {
      self.roots.push(root);
    });
  };

  self.addBuild = function (build) {
    updateNewestBuild(build);
    build.onUpdate(function () {
      updateNewestBuild(build);
    });
  };

  self.time = function () {
    var startTime = self.firstRoot().timestamp;
    var endTime = newestBuild.endTime();
    return formatTime(endTime - startTime);
  };

  self.firstRoot = function () {
    return self.roots[0];
  };

  function updateNewestBuild(build) {
    if (build.endTime() > newestBuild.endTime()) {
      newestBuild = build;
    }
  }

  function formatTime(time) {
    var minutes = Math.floor(time / 1000 / 60);
    var seconds = Math.floor(time / 1000 - (minutes * 60));
    return minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
  }

  self.isFinished = function () {
    return finished;
  };

  function isOrHasLastBuild(build) {
    if (build.job.isLast) { return true; }
    return _.some(build.children, function (child) { return isOrHasLastBuild(child); });
  }

  function isOrHasFailedBuild(build) {
    if (build.hasFailed() || build.wasAborted()) { return true; }
    return _.some(build.children, function (child) { return isOrHasFailedBuild(child); });
  }

  function isOrHasBuildInProgress(build) {
    if (build.isInProgress()) { return true; }
    return _.some(build.children, function (child) { return isOrHasFailedBuild(child); });
  }

  return self;
};
