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

  var buildYPositioner = function (b) {
    var bigBuildsCount = failedBuilds.length + buildsInProgress.length;
    var i = b.indexInSidebar;
    if (i < bigBuildsCount) {
      return i * rectHeight;
    }
    return rectHeight * bigBuildsCount + (i - bigBuildsCount) * greenRectHeight;
  };

  var buildXPositioner = function (b) {
    return b.hasSucceeded() ? greenRectShownX : rectShownX;
  };

  var textYPositioner = function (b) {
    var bigBuildsCount = failedBuilds.length + buildsInProgress.length;
    var i = b.indexInSidebar;
    if (i < bigBuildsCount) {
      return i * rectHeight + 20;
    }
    return rectHeight * bigBuildsCount + (i - bigBuildsCount) * greenRectHeight + 13;
  };

  var textXPositioner = function (b) {
    return b.hasSucceeded() ? greenTextShownX : textShownX;
  };

  var scheduledCalls = [];

  var transitionSemaphore = lg.semaphore(2);

  var svg = d3.select('#sidebar').insert('svg')
    .attr('width', width)
    .attr(window.innerHeight);

  function buildKey(build) {
    return build.code + '-' + build.status;
  }

  function initNewRects(rectsEnter) {
    rectsEnter
      .append('rect')
      .attr('width', function (b) { return b.hasFailed() || b.isInProgress() ? rectWidth : greenRectWidth; })
      .attr('height', function (b) { return b.hasFailed() || b.isInProgress() ? rectHeight : greenRectHeight; })
      .attr('stroke', 'black')
      .attr('stroke-width', 2)
      .attr('x', rectHiddenX)
      .attr('y', -rectHeight)
      .attr('class', 'enter update')
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
      .attr('class', 'enter update')
      .text(function (d) {
        return d.displayName
          .replace(/^qe_selenium_/i, '')
          .replace(/^acceptance_/i, '');
      })
      .attr("font-family", "sans-serif")
      .attr("font-size", function (b) { return b.hasFailed() || b.isInProgress() ? "14px" : "10px"; })
      .attr("x", width)
      .attr('y', -rectHeight)
      .attr("fill", function (b) {
        return b.isInProgress() ? 'black' : 'white';
      });
  }

  function redraw() {
    var builds = allBuilds();
    lg.debug(lg.sidebar, 'Redrawing the whole sidebar...', builds);

    transitionSemaphore.reset();
    svg.selectAll('rect').remove();
    svg.selectAll('text').remove();

    var rects = svg.selectAll('rect').data(builds, buildKey);
    initNewRects(rects.enter());

    var texts = svg.selectAll('text').data(builds, buildKey);
    initNewTexts(texts.enter());

    rects
      .attr('y', buildYPositioner)
      .transition()
      .attr('x', buildXPositioner)
      .each('end', transitionSemaphore.signal);

    texts
      .attr('y', textYPositioner)
      .transition()
      .attr('x', textXPositioner)
      .each('end', transitionSemaphore.signal);
  }

  function allBuilds() {
    var r = failedBuilds.concat(buildsInProgress.concat(successfulBuilds));
    _.each(r, function (b, i) { b.indexInSidebar = i; });
    return r;
  }

  function update() {
    var builds = allBuilds();
    lg.debug(lg.sidebar, 'Updating the sidebar...', builds);

    transitionSemaphore.reset();

    var rects = svg.selectAll('rect.update').attr('class', 'update');
    var rectsData = rects.data(builds, buildKey);

    rectsData.exit().attr('class', 'exit');
    svg.selectAll('rect.exit').transition().attr('x', width).each('end', function () {
      svg.selectAll('rect.exit').remove();
    });

    initNewRects(rectsData.enter());

    svg.selectAll('rect.update')
      .transition()
        .delay(250)
        .attr('y', buildYPositioner);

    svg.selectAll('rect.enter')
      .transition()
        .delay(750)
        .attr('x', buildXPositioner)
        .each('end', transitionSemaphore.signal);

    var texts = svg.selectAll('text.update').attr('class', 'update');
    var textsData = texts.data(builds, buildKey);

    textsData.exit().attr('class', 'exit');
    svg.selectAll('text.exit').transition().attr('x', width).each('end', function () {
      svg.selectAll('text.exit').remove();
    });

    initNewTexts(textsData.enter());

    svg.selectAll('text.update')
      .transition()
        .delay(250)
        .attr('y', textYPositioner);

    svg.selectAll('text.enter')
      .transition()
        .delay(750)
        .attr('x', textXPositioner)
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
    } else {
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
      callback();
    }
  }

  function tryToExecuteScheduledCalls() {
    if (scheduledCalls.length) {
      if (transitionSemaphore.inProgress()) {
        setTimeout(tryToExecuteScheduledCalls, 500);
      } else {
        scheduledCalls.shift()();
      }
    }
  }

  function scheduleUpdate() {
    schedule(update);
  }

  function scheduleRedraw() {
    schedule(redraw);
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
          scheduleRedraw();
        }
      });
    });
  }

  initBrowserVisibilityChangeListener();

  return self;
};

lg.semaphore = function (total, callback) {
  var self = {};
  var count = 0;
  var inProgress = false;

  self.signal = function () {
    count++;
    if (count === total) {
      count = 0;
      inProgress = false;
      callback && callback();
    }
  };

  self.reset = function () {
    count = 0;
    inProgress = true;
  };

  self.inProgress = function () {
    return inProgress;
  };

  return self;
};
