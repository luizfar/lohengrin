var lg = lg || {};

lg.sidebar = function () {
  var self = {};

  var failedBuilds = [];
  var buildsInProgress = [];
  var successfulBuilds = [];

  var width = window.innerWidth * 0.15;

  var rectHeight = 30;
  var rectWidth = width;

  var greenRectHeight = 19;
  var greenRectWidth = width * 0.7;

  var rectHiddenX = width;
  var rectShownX = 0;
  var greenRectShownX = width - greenRectWidth;
  var textHiddenX = width + 10;
  var textShownX = 10;
  var greenTextShownX = greenRectShownX + 6;

  var buildPositioner = function (b, i) {
    var bigBuildsCount = failedBuilds.length + buildsInProgress.length;
    if (i < bigBuildsCount) {
      return i * rectHeight;
    }
    return rectHeight * bigBuildsCount + (i - bigBuildsCount) * greenRectHeight;
  };

  var textPositioner = function (t, i) {
    var bigBuildsCount = failedBuilds.length + buildsInProgress.length;
    if (i < bigBuildsCount) {
      return i * rectHeight + 20;
    }
    return rectHeight * bigBuildsCount + (i - bigBuildsCount) * greenRectHeight + 13;
  };

  var scheduledCalls = [];
  var transitionSemaphore = (function (total) {
    var s = {};
    var count = 0;
    var transitionInProgress = false;
    s.signal = function () {
      count++;
      if (count == total) {
        transitionInProgress = false;
        count = 0;
      }
    };
    s.reset = function () {
      transitionInProgress = true;
      count = 0;
    };
    s.inProgress = function () {
      return transitionInProgress;
    };
    return s;
  })(2);

  var svg = d3.select('#sidebar').insert('svg')
    .attr('width', width)
    .attr(window.innerHeight);

  function buildKey(build) {
    return build.code + '-' + build.status;
  }

  function initNewRects(rectsEnter) {
    rectsEnter
      .append('rect')
      .attr('width', function (b) { return b.hasSucceeded() ? greenRectWidth : rectWidth; })
      .attr('height', function (b) { return b.hasSucceeded() ? greenRectHeight : rectHeight; })
      .attr('stroke', 'black')
      .attr('stroke-width', 2)
      .attr('x', rectHiddenX)
      .attr('fill', function (b) {
        if (b.hasFailed()) {
          return 'red';
        }
        if (b.isInProgress()) {
          return 'yellow';
        }
        if (b.hasSucceeded()) {
          return 'green';
        }
        return 'gray';
      });
  }

  function initNewTexts(textsEnter) {
    textsEnter
      .append('text')
      .text(function (d) {
        return d.displayName.replace(/^qe_selenium_/i, '');
      })
      .attr("font-family", "sans-serif")
      .attr("font-size", function (b) { return b.hasSucceeded()  ? "10px" : "14px"; })
      .attr("x", width)
      .attr("fill", function (b) {
        return b.isInProgress() ? 'black' : 'white';
      });
  }

  function allBuilds() {
    return failedBuilds.concat(buildsInProgress.concat(successfulBuilds));
  }

  function reset() {
    var builds = allBuilds();
    lg.debug(lg.sidebar, 'Resetting the sidebar...', builds);

    transitionSemaphore.reset();
    svg.selectAll('rect').remove();
    svg.selectAll('text').remove();

    var rects = svg.selectAll('rect').data(builds, buildKey);
    initNewRects(rects.enter());

    var texts = svg.selectAll('text').data(builds, buildKey);
    initNewTexts(texts.enter());

    rects
      .attr('y', buildPositioner)
      .transition()
      .attr('x', function (b) { return b.hasSucceeded() ? greenRectShownX : rectShownX; })
      .each('end', transitionSemaphore.signal);

    texts
      .attr('y', textPositioner)
      .transition()
      .attr('x', function (b) { return b.hasSucceeded() ? greenTextShownX : textShownX; })
      .each('end', transitionSemaphore.signal);
  }

  function addCompletedBuild(build) {
    if (thereIsABuildNewerThan(build)) {
      return;
    }
    lg.debug(lg.sidebar, 'Adding completed build to sidebar:', build.code);
    removeBuildsOlderThan(build);
    pushBuild(build);
  }

  function addBuildInProgress(build) {
    removeBuildsOlderThan(build);
    lg.debug(lg.sidebar, 'Adding in progress build to sidebar:', build.code);
    pushBuild(build);
    build.onUpdate(function (updated) {
      if (updated.isDone()) {
        removeBuildByCode(updated.code);
        addCompletedBuild(updated);
        scheduleUpdate();
      }
    });
  }

  function thereIsABuildNewerThan(build) {
    return _.some(lg.allBuilds, function (b) {
      return b.sameJobAs(build) && b.number > build.number;
    });
  }

  function removeBuildsOlderThan(build) {
    remove(function (b) {
      return b.isDone() && b.sameJobAs(build) && b.number < build.number;
    });
  }

  function removeBuildByCode(code) {
    remove(function (b) { return b.code === code; });
  }

  function remove(remover) {
    buildsInProgress = _.reject(buildsInProgress, remover);
    failedBuilds = _.reject(failedBuilds, remover);
    successfulBuilds = _.reject(successfulBuilds, remover);
  }

  function pushBuild(build) {
    if (build.isInProgress()) {
      buildsInProgress.push(build);
    } else if (build.hasFailed()) {
      failedBuilds.push(build);
    } else if (build.hasSucceeded()) {
      successfulBuilds.push(build);
    }
    scheduleUpdate();
  }

  function schedule(callback) {
    if (transitionSemaphore.inProgress()) {
      if (!_.contains(scheduledCalls, callback)) {
        lg.debug(lg.sidebar, 'Update already in progress. Sheduling new update...');
        scheduledCalls.push(callback);
        tryToExecuteScheduledCalls();
      }
    } else {
      transitionSemaphore.reset();
      callback();
    }
  }

  function tryToExecuteScheduledCalls() {
    if (scheduledCalls.length) {
      if (transitionSemaphore.inProgress()) {
        setTimeout(tryToExecuteScheduledCalls, 500);
      } else {
        transitionSemaphore.reset();
        scheduledCalls.shift()();
      }
    }
  }

  function scheduleUpdate() {
    schedule(reset);
  }

  function scheduleReset() {
    schedule(reset);
  }

  self.addBuild = function (build) {
    if (build.isDone()) {
      addCompletedBuild(build);
    } else {
      addBuildInProgress(build);
    }
  };

  function initBrowserVisibilityChangeListener() {
    $(function() {
      var hidden, visibilityState, visibilityChange;

      if (typeof document.hidden !== "undefined") {
        hidden = "hidden";
        visibilityChange = "visibilitychange";
        visibilityState = "visibilityState";
      }
      else if (typeof document.mozHidden !== "undefined") {
        hidden = "mozHidden";
        visibilityChange = "mozvisibilitychange";
        visibilityState = "mozVisibilityState";
      }
      else if (typeof document.msHidden !== "undefined") {
        hidden = "msHidden";
        visibilityChange = "msvisibilitychange";
        visibilityState = "msVisibilityState";
      }
      else if (typeof document.webkitHidden !== "undefined") {
        hidden = "webkitHidden";
        visibilityChange = "webkitvisibilitychange";
        visibilityState = "webkitVisibilityState";
      }

      document.addEventListener(visibilityChange, function() {
        if (document[visibilityState] == 'visible') {
          scheduleReset();
        }
      });
    });
  }

  initBrowserVisibilityChangeListener();

  return self;
};

