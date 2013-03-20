var lg = lg || {};

lg.sidebar = function () {
  var self = {};

  var failedBuilds = [];
  var buildsInProgress = [];
  var successfulBuilds = [];

  var width = window.innerWidth * 0.15;

  var bigRectHeight = 30;
  var bigRectWidth = width;

  var smallRectHeight = 19;
  var smallRectWidth = width * 0.7;

  var bigRectX = 0;
  var smallRectX = width - smallRectWidth;

  var bigTextX = 10;
  var smallTextX = smallRectX + 6;

  var transitionSemaphore = lg.semaphore(2);

  var updateScheduled = false;
  var redrawScheduled = false;

  var svg = d3.select('#sidebar').insert('svg')
    .attr('width', width)
    .attr(window.innerHeight);

  function buildKey(build) {
    return build.code + '-' + build.status;
  }

  function isBig(build) {
    return build.hasFailed() || build.isInProgress();
  }

  function initNewRects(rectsEnter) {
    var rects = rectsEnter.append('rect');
    rects
      .attr('stroke', 'black')
      .attr('stroke-width', 2)
      .attr('x', bigRectWidth)
      .attr('y', -bigRectHeight)
      .attr('class', 'fresh enter');
    updateRects(rects);
  }

  function updateRects(rects) {
    rects
      .attr('width', function (b) { return isBig(b) ? bigRectWidth : smallRectWidth; })
      .attr('height', function (b) { return isBig(b) ? bigRectHeight : smallRectHeight; })
      .attr('title', buildKey)
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
    var texts = textsEnter.append('text');
    texts
      .attr('class', 'fresh enter')
      .text(function (d) {
        return d.displayName
          .replace(/^qe_selenium_/i, '')
          .replace(/^acceptance_/i, '');
      })
      .attr("font-family", "sans-serif")
      .attr("x", bigRectWidth)
      .attr('y', -bigRectHeight);
    updateTexts(texts);
  }

  function updateTexts(texts) {
    texts
      .attr("font-size", function (b) { return isBig(b) ? "14px" : "10px"; })
      .attr('title', buildKey)
      .attr("fill", function (b) {
        return b.isInProgress() || b.wasAborted() ? 'black' : 'white';
      });
  }

  function rectYPositioner(b) {
    var bigBuildsCount = failedBuilds.length + buildsInProgress.length;
    var i = b.indexInSidebar;
    if (i < bigBuildsCount) {
      return i * bigRectHeight;
    }
    return bigRectHeight * bigBuildsCount + (i - bigBuildsCount) * smallRectHeight;
  }

  function rectXPositioner(b) {
    return b.hasSucceeded() || b.wasAborted() ? smallRectX : bigRectX;
  }

  function textYPositioner(b) {
    var bigBuildsCount = failedBuilds.length + buildsInProgress.length;
    var i = b.indexInSidebar;
    if (i < bigBuildsCount) {
      return i * bigRectHeight + 20;
    }
    return bigRectHeight * bigBuildsCount + (i - bigBuildsCount) * smallRectHeight + 13;
  }

  function textXPositioner(b) {
    return b.hasSucceeded() || b.wasAborted() ? smallTextX : bigTextX;
  }

  function redraw() {
    svg.selectAll('rect').remove();
    svg.selectAll('text').remove();
    update();
  }

  var elementsOperators = {
    initializer: {
      rect: initNewRects,
      text: initNewTexts
    },
    updater: {
      rect: updateRects,
      text: updateTexts
    },
    yPositioner: {
      rect: rectYPositioner,
      text: textYPositioner
    },
    xPositioner: {
      rect: rectXPositioner,
      text: textXPositioner
    }
  };

  function updateElements(type, builds) {
    var freshSelector = type + '.fresh';
    var exitSelector = type + '.exit';
    var enterSelector = type + '.enter';

    var all = svg.selectAll(freshSelector).attr('class', 'fresh');
    var allWithData = all.data(builds, buildKey);

    allWithData.exit().attr('class', 'exit').remove();
    svg.selectAll(exitSelector).transition().attr('x', width).each('end', function () {
      svg.selectAll(exitSelector).remove();
    });

    elementsOperators.updater[type](all);
    elementsOperators.initializer[type](allWithData.enter());

    var fresh = svg.selectAll(freshSelector);
    if (fresh.empty()) {
      transitionSemaphore.signal();
    } else {
      var eachTransitionSemaphore = lg.semaphore(fresh[0].length, function () {
        transitionSemaphore.signal();
      });
      fresh
        .transition()
          .delay(200)
          .attr('y', elementsOperators.yPositioner[type])
        .transition()
          .delay(500)
          .attr('x', elementsOperators.xPositioner[type])
          .each('end', eachTransitionSemaphore.signal);
    }
  }

  function update() {
    var builds = allBuilds();
    lg.debug(lg.sidebar, 'Updating the sidebar...', builds);

    transitionSemaphore.reset();

    updateElements('rect', builds);
    updateElements('text', builds);
  }

  function allBuilds() {
    var r = failedBuilds.concat(buildsInProgress.concat(successfulBuilds));
    _.each(r, function (b, i) { b.indexInSidebar = i; });
    return r;
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

  function scheduleUpdate() {
    if (redrawScheduled) {
      updateScheduled = false;
      return;
    }

    if (transitionSemaphore.inProgress()) {
      updateScheduled = true;
      setTimeout(scheduleUpdate, 500);
    } else {
      update();
      updateScheduled = false;
    }
  }

  function scheduleRedraw() {
    updateScheduled = false;
    if (transitionSemaphore.inProgress()) {
      redrawScheduled = true;
      setTimeout(scheduleRedraw, 500);
    } else {
      redraw();
      redrawScheduled = false;
    }
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
