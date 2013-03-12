var lg = lg || {};

lg.sidebar = function () {
  var self = {};

  var builds = [];
  var width = window.innerWidth * 0.15;

  var svg = d3.select('#sidebar').insert('svg')
    .attr('width', width)
    .attr(window.innerHeight);

  function redraw() {
    var dataset = builds;

    var rects = svg.selectAll('rect')
      .data(dataset);

    rects.exit()
      .transition()
      .attr('x', width)
      .remove();

    rects.enter()
      .append('rect')
      .attr('x', width)
      .attr('y', function (d, i) {
        return i * 30;
      })
      .attr('width', width)
      .attr('height', 30)
      .attr('fill', function (d) {
        if (d.hasFailed()) {
          return 'red';
        }
        if (d.isInProgress()) {
          return 'yellow';
        }
        if (d.hasSucceeded()) {
          return 'green';
        }
        return 'pink';
      })
      .attr('stroke', 'black')
      .attr('stroke-width', 2)
      .transition()
      .attr('x', 0);

    var texts = svg.selectAll('text')
      .data(dataset);

    texts.exit()
      .transition()
      .attr('x', width)
      .remove();

    texts.enter()
      .append('text')
      .text(function (d) {
        return d.displayName.replace(/^qe_selenium_/i, '');
      })
      .attr("x", width)
      .attr("y", function(d, i) {
         return i * 30 + 20;
      })
      .attr("font-family", "sans-serif")
      .attr("font-size", "14px")
      .attr("fill", function (d) {
        return d.isInProgress() ? 'black' : 'white';
      })
      .transition()
      .attr('x', 10);
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
      build.onUpdate(function (doneBuild) {
        if (doneBuild.isDone() && !doneBuild.hasFailed()) {
          removeBuildByCode(doneBuild.code);
        }
      });
    }

    if (build.hasFailed()) {
      builds.push(build);
    }

    redraw();
  };

  return self;
};

