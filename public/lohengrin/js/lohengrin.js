var lg = lg || {};

_.extend(lg, (function () {
  var self = {};
  var newBuildCallbacks = [];

  self.allBuilds = [];
  self.buildsByCode = {};
  self.rootBuilds = [];
  self.trees = {};

  self.reset = function () {
    lg.allBuilds = [];
    lg.buildsByCode = {};
    lg.rootBuilds = [];
    lg.trees = {};
  };

  self.addBuild = function (build) {
    if (lg.buildsByCode[build.code]) {
      return;
    }

    lg.buildsByCode[build.code] = build;
    lg.allBuilds.push(build);
    if (build.isRoot()) {
      var newTree = lg.tree(build);
      lg.trees[build.code] = newTree;

      lg.rootBuilds.push(build);
      if (lg.rootBuilds.length > 4) {
        cleanup();
      }
    } else {
      var roots = findRootsOf(build);
      if (roots.length > 1) {
        mergeTrees(roots);
      }
      lg.trees[roots[0].code].addBuild(build);
    }
    _.each(newBuildCallbacks, function (callback) {
      callback(build);
    });

  };

  self.hasBuild = function (buildCode) {
    return !!lg.buildsByCode[buildCode];
  };

  self.onNewBuild = function (newBuildCallback) {
    newBuildCallbacks.push(newBuildCallback);
  };

  function findRootsOf(build) {
    return _.map(build.rootBuildsCode, function (rootBuildCode) {
      return lg.buildsByCode[rootBuildCode];
    });
  }

  function mergeTrees(roots) {
    var trees = _.map(roots, function (root) { return lg.trees[root.code]; });
    trees = _.sortBy(trees, function (tree) { return tree.createdDate; });
    var firstTree = trees.shift();

    _.reduce(trees, function (memo, tree) {
      return memo.mergeWith(tree);
    }, firstTree);

    _.each(firstTree.roots, function (root) {
      lg.trees[root.code] = firstTree;
    });
  }

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

    var staleRoot = _.min(lg.rootBuilds, function (b) { return b.number; });
    staleRoot.stale = true;
    var nonStaleRoots = _.reject(lg.rootBuilds, areStale);
    lg.rootBuilds.length = 0;
    _.each(nonStaleRoots, function (b) { lg.rootBuilds.push(b); });

    markToRemove(staleRoot);
    _.each(lg.allBuilds, function (build) {
      if (build.stale) {
        delete lg.buildsByCode[build.code];
      }
    });
    var nonStaleBuilds = _.reject(lg.allBuilds, areStale);
    self.allBuilds.length = 0;
    _.each(nonStaleBuilds, function (b) { lg.allBuilds.push(b); });
  }

  return self;
})());

lg.debug = function (type) {
  if (lg.debugObjects && _.contains(lg.debugObjects, type)) {
    console.debug.apply(console, Array.prototype.slice.call(arguments, 1));
  }
};
