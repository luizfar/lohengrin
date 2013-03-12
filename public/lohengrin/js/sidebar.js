var lg = lg || {};

lg.sidebar = function () {
  var self = {};

  var builds = [];
  var width = window.innerWidth * 0.15;

  var svg = d3.select('#sidebar').insert('svg')
    .attr('width', width)
    .attr(window.innerHeight);

  function buildKey(build) {
    return build.displayName + build.status;
  }

  function updateRects(rects) {
    rects
      .transition()
      .attr('y', function (d, i) {
        return i * 30;
      })
      .transition()
      .attr('x', 0)
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

  function updateTexts(texts) {
    texts
      .transition()
      .attr('y', function (d, i) {
        return i * 30 + 20;
      })
      .transition()
      .attr('x', 10);
  }

  function redraw() {
    var dataset = builds;

    var allRects = svg.selectAll('rect')
      .data(dataset, buildKey);
    var oldRects = allRects.exit();
    var newRects = allRects.enter().append('rect');

    oldRects.transition().attr('x', width).remove();
    newRects
      .attr('width', width)
      .attr('height', 30)
      .attr('stroke', 'black')
      .attr('stroke-width', 2)
      .attr('x', width);

    updateRects(allRects);
    updateRects(newRects);

    var allTexts = svg.selectAll('text').data(dataset, buildKey);
    var oldTexts = allTexts.exit();
    var newTexts = allTexts.enter().append('text');

    oldTexts.transition().attr('x', width).remove();
    newTexts
      .text(function (d) {
        return d.displayName.replace(/^qe_selenium_/i, '');
      })
      .attr("x", width)
      .attr("font-family", "sans-serif")
      .attr("font-size", "14px")
      .attr("fill", function (d) {
        return d.isInProgress() ? 'black' : 'white';
      });

    updateTexts(allTexts);
    updateTexts(newTexts);
  }

  function valuesOf(object) {
    var result = [];
    for (var key in object) {
      if (object.hasOwnProperty(key)) {
        result.push(object[key]);
      }
    }
    return result;
  };

  function thereIsABuildNewerThan(build) {
    return _.some(lg.allBuilds, function (b) {
      return b.sameJobAs(build) && b.number > build.number;
    });
  }

  function removeBuildsOlderThan(build) {
    builds = _.reject(builds, function (b) {
      return b.isDone() && b.sameJobAs(build) && b.number < build.number;
    });
    redraw();
  }

  function removeBuildByCode(code) {
    builds = _.reject(builds, function (b) {
      return b.code == code;
    });
  }

  self.addBuild = function (build) {
    removeBuildsOlderThan(build);
    if (build.isDone() && (thereIsABuildNewerThan(build) || !build.hasFailed())) {
      return;
    }

    if (build.isInProgress()) {
      builds.push(build);
      build.onUpdate(function (updatedBuild) {
        if (updatedBuild.isDone()) {
          if (!updatedBuild.hasFailed()) {
            removeBuildByCode(updatedBuild.code);
          }
          redraw();
        }
        redraw();
      });
    }

    if (build.hasFailed()) {
      builds.push(build);
    }

    redraw();
  };

  return self;
};

