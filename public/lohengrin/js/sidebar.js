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

  function redraw() {
    var rects = svg.selectAll('rect');
    var rectsWithData = rects.data(builds, buildKey);
    var texts = svg.selectAll('text');
    var textsWithData = texts.data(builds, buildKey);

    // remove old builds
    rectsWithData.exit().transition().attr('x', width).remove();
    textsWithData.exit().transition().attr('x', width).remove();

    // init new builds
    rectsWithData.enter()
      .append('rect')
      .attr('width', width)
      .attr('height', 30)
      .attr('stroke', 'black')
      .attr('stroke-width', 2)
      .attr('x', width)
      .attr('y', -30);
    textsWithData.enter()
      .append('text')
      .text(function (d) {
        return d.displayName.replace(/^qe_selenium_/i, '');
      })
      .attr("font-family", "sans-serif")
      .attr("font-size", "14px")
      .attr("x", width)
      .attr('y', -30);

    // update position
    rects.transition()
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
    texts.transition()
      .attr('y', function (d, i) {
        return i * 30 + 20;
      })
      .transition()
      .attr('x', 10)
      .attr("fill", function (d) {
        return d.isInProgress() ? 'black' : 'white';
      });
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
      var shouldRemove = b.isDone() && b.sameJobAs(build) && b.number < build.number;
      if (shouldRemove) { lg.debug(lg.sidebar, 'Removing old build from sidebar:', b.code); }
      return shouldRemove;
    });
    redraw();
  }

  function removeBuildByCode(code) {
    builds = _.reject(builds, function (b) {
      var shouldRemove = b.code == code;
      if (shouldRemove) { lg.debug(lg.sidebar, 'Removing updated build from sidebar:', b.code); }
      return shouldRemove;
    });
  }

  self.addBuild = function (build) {
    removeBuildsOlderThan(build);
    if (build.isDone() && (thereIsABuildNewerThan(build) || !build.hasFailed())) {
      return;
    }

    lg.debug(lg.sidebar, 'Adding build to sidebar:', build.code);

    if (build.isInProgress()) {
      builds.push(build);
      build.onUpdate(function (updatedBuild) {
        if (updatedBuild.isDone()) {
          if (!updatedBuild.hasFailed()) {
            removeBuildByCode(updatedBuild.code);
          }
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

