var lg = lg || {};

lg.sidebarSizes = (function () {
  var self = {};

  self.width = window.innerWidth * 0.15;

  self.bigRectHeight = 30;
  self.bigRectWidth = self.width;

  self.smallRectHeight = 19;
  self.smallRectWidth = self.width * 0.7;

  self.bigRectX = 0;
  self.smallRectX = self.width - self.smallRectWidth;

  self.bigTextX = 10;
  self.smallTextX = self.smallRectX + 6;

  return self;
})();

lg.sidebar = function () {
  var self = {};

  var failedBuilds = [];
  var buildsInProgress = [];
  var successfulBuilds = [];

  var width = lg.sidebarSizes.width;

  var transitionSemaphore = lg.semaphore(2);

  var updateScheduled = false;
  var redrawScheduled = false;

  var initializers = {
    rect: initNewRects,
    text: initNewTexts
  };

  var svg = d3.select('#sidebar').insert('svg')
    .attr('width', width)
    .attr(window.innerHeight);

  function redraw() {
    hideEverything();
    update();
  }

  function hideEverything() {
    svg.selectAll('rect').remove();
    svg.selectAll('text').remove();
  }

  function initNewRects(rectsEnter) {
    rectsEnter.append('rect')
      .attr('stroke', 'black')
      .attr('stroke-width', 2)
      .attr('x', lg.sidebarSizes.width)
      .attr('y', -lg.sidebarSizes.bigRectHeight)
      .attr('class', 'fresh enter')
      .attr('width', function (b) { return b.width; })
      .attr('height', function (b) { return b.height; })
      .attr('title', function (b) { return b.displayName; })
      .attr('fill', function (b) { return b.color; });
  }

  function initNewTexts(textsEnter) {
    textsEnter.append('text')
      .attr('class', 'fresh enter')
      .attr('font-family', 'sans-serif')
      .attr('x', lg.sidebarSizes.width)
      .attr('y', -lg.sidebarSizes.bigRectHeight)
      .text(function (b) { return b.displayName; })
      .attr('font-size', function (b) { return b.fontSize; })
      .attr('title', function (b) { return b.displayName; })
      .attr('fill', function (b) { return b.textColor; });
  }

  function updateElements(type, builds) {
    var freshSelector = type + '.fresh';
    var exitSelector = type + '.exit';
    var enterSelector = type + '.enter';

    var all = svg.selectAll(freshSelector).attr('class', 'fresh');
    var allWithData = all.data(builds, function (b) { return b.id; });

    allWithData.exit().attr('class', 'exit');
    svg.selectAll(exitSelector).transition().attr('x', width).each('end', function () {
      svg.selectAll(exitSelector).remove();
    });

    initializers[type](allWithData.enter());

    svg.selectAll(freshSelector)
      .transition()
        .delay(200)
        .attr('y', function (b) { return b.yPosition(type); });

    var newRects = svg.selectAll(enterSelector);

    if (newRects.empty()) {
      transitionSemaphore.signal();
    } else {
      var eachTransitionSemaphore = lg.semaphore(newRects[0].length, function () {
        transitionSemaphore.signal();
      });
      newRects
        .transition()
          .delay(500)
          .attr('x', function (b) { return b.xPosition(type); })
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
    var all = failedBuilds.concat(buildsInProgress.concat(successfulBuilds));
    var bigBuildsCount = failedBuilds.length + buildsInProgress.length;
    return _.map(all, function (build, index) { return lg.sidebarBuild(build, index, bigBuildsCount); });
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

  self.start = function () {
    lg.jenkinsJson('api/json?tree=jobs[name,url,color,lastBuild[number]]', function (json) {
      failedBuilds = _.filter(json.jobs, function (job) {
        return job.color === 'red' && lg.jenkins.hasJob(job.name);
      });
      buildsInProgress = _.filter(json.jobs, function (job) {
        return job.color.indexOf('anime') >= 0 && lg.jenkins.hasJob(job.name);
      });
      successfulBuilds = _.filter(json.jobs, function (job) {
        return job.color !== 'red' && job.color.indexOf('anime') == -1 && lg.jenkins.hasJob(job.name);
      });
      scheduleUpdate();
      setTimeout(self.start, 30000);
    });
  };

  self.addBuild = function (build) {
    if (build.isDone()) {
      //addCompletedBuild(build);
    } else {
      //addBuildInProgress(build);
    }
  };

  function initBrowserVisibilityChangeListener() {
    $(function () {
      var hidden, visibilityState, visibilityChange;

      if (typeof document.hidden !== 'undefined') {
        hidden = 'hidden';
        visibilityChange = 'visibilitychange';
        visibilityState = 'visibilityState';
      }
      else if (typeof document.mozHidden !== 'undefined') {
        hidden = 'mozHidden';
        visibilityChange = 'mozvisibilitychange';
        visibilityState = 'mozVisibilityState';
      }
      else if (typeof document.msHidden !== 'undefined') {
        hidden = 'msHidden';
        visibilityChange = 'msvisibilitychange';
        visibilityState = 'msVisibilityState';
      }
      else if (typeof document.webkitHidden !== 'undefined') {
        hidden = 'webkitHidden';
        visibilityChange = 'webkitvisibilitychange';
        visibilityState = 'webkitVisibilityState';
      }

      document.addEventListener(visibilityChange, function () {
        if (document[visibilityState] == 'visible') {
          scheduleRedraw();
        }
        if (document[visibilityState] == 'hidden') {
          hideEverything();
        }
      });
    });
  }

  initBrowserVisibilityChangeListener();

  return self;
};

lg.sidebarBuild = function (build, index, bigBuildsCount) {
  var self = {};

  if (build.color === 'red') {
    self.status = 'failure';
  } else if (build.color === 'blue') {
    self.status = 'success';
  } else if (build.color.indexOf('anime') >= 0) {
    self.status = 'building';
  } else {
    self.status = 'aborted';
  }

  var building = self.status === 'building';
  var failed = self.status === 'failure';
  var succeeded = self.status === 'success';
  var aborted = self.status === 'aborted';

  self.displayName = build.name.replace(/^acceptance_/i, '') + '#' + build.lastBuild.number;
  self.code = self.displayName + self.status;
  self.id = self.code + self.status;
  self.index = index;

  self.color = (function () {
    if (building) { return 'yellow'; }
    if (failed) { return 'red'; }
    if (succeeded) { return 'green'; }
    return 'gray';
  })();

  var isBig = building || failed;

  self.width = isBig ? lg.sidebarSizes.bigRectWidth : lg.sidebarSizes.smallRectWidth;
  self.height = isBig ? lg.sidebarSizes.bigRectHeight : lg.sidebarSizes.smallRectHeight;
  self.fontSize = isBig ? '14px' : '10px';
  self.textColor = building || aborted ? 'black' : 'white';

  self.xPosition = function (type) {
    if (type === 'rect') {
      return isBig ? lg.sidebarSizes.bigRectX : lg.sidebarSizes.smallRectX;
    } else {
      return isBig ? lg.sidebarSizes.bigTextX : lg.sidebarSizes.smallTextX;
    }
  };

  self.rectY = (function () {
    if (index < bigBuildsCount) {
      return index * lg.sidebarSizes.bigRectHeight;
    }
    return lg.sidebarSizes.bigRectHeight * bigBuildsCount +
      (index - bigBuildsCount) * lg.sidebarSizes.smallRectHeight;
  })();

  self.textY = (function () {
    if (index < bigBuildsCount) {
      return index * lg.sidebarSizes.bigRectHeight + 20;
    }
    return lg.sidebarSizes.bigRectHeight * bigBuildsCount +
      (index - bigBuildsCount) * lg.sidebarSizes.smallRectHeight + 13;
  })();

  self.yPosition = function (type) {
    return type === 'rect' ? self.rectY : self.textY;
  };

  return self;
};

lg.semaphore = function (total, callback) {
  var self = {};
  var count = 0;
  var inProgress = false;

  self.signal = function () {
    count = count + 1;
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

  self.inProgress = function () { return inProgress; };

  return self;
};
