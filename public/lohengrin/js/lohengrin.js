var lg = lg || {};

_.extend(lg, (function () {
  var self = {};
  var newBuildCallbacks = [];

  self.allBuilds = [];
  self.buildsByCode = {};
  self.rootBuilds = [];

  self.addBuild = function (build) {
    if (self.buildsByCode[build.code]) {
      return;
    }

    self.buildsByCode[build.code] = build;
    lg.allBuilds.push(build);
    _.each(newBuildCallbacks, function (callback) {
      callback(build);
    });

    if (build.isRoot()) {
      self.rootBuilds.push(build);
      if (self.rootBuilds.length > 4) {
        cleanup();
      }
    }
  };

  self.hasBuild = function (buildCode) {
    return !!self.buildsByCode[buildCode];
  };

  self.onNewBuild = function (newBuildCallback) {
    newBuildCallbacks.push(newBuildCallback);
  };

  function cleanup() {
    function areStale(build) {
      return build.stale;
    }

    function markToRemove(build) {
      if (build.isRoot() || _.every(build.parents, areStale)) {
        build.stale = true;
        _.each(build.children, function (child) {
          markToRemove(child);
        });
      }
    }

    var staleRoot = _.min(self.rootBuilds, function (b) { return b.number; });
    staleRoot.stale = true;
    var nonStaleRoots = _.reject(self.rootBuilds, areStale);
    self.rootBuilds.length = 0;
    _.each(nonStaleRoots, function (b) { self.rootBuilds.push(b); });

    markToRemove(staleRoot);
    _.each(self.allBuilds, function (build) {
      if (build.stale) {
        delete self.buildsByCode[build.code];
      }
    });
    var nonStaleBuilds = _.reject(self.allBuilds, areStale);
    self.allBuilds.length = 0;
    _.each(nonStaleBuilds, function (b) { self.allBuilds.push(b); });
  }

  return self;
})());

lg.debug = function (type) {
  if (lg.debugObjects && _.contains(lg.debugObjects, type)) {
    console.debug.apply(console, Array.prototype.slice.call(arguments, 1));
  }
};
