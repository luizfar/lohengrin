var lg = lg || {};

lg.SIDEBAR_WIDTH = 200;

lg.sidebar = function () {
  var self = {};

  var builds = [];

  var svg = d3.select('#sidebar').insert('svg')
    .attr('width', 200)
    .attr(window.innerHeight);

  function redraw() {
    var dataset = builds;

    var rects = svg.selectAll('rect')
      .data(dataset)
      .enter()
      .append('rect')
      .attr('x', 0)
      .attr('y', function (d, i) {
        return i * 30;
      })
      .attr('width', 200)
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
      .attr('stroke-width', 2);

    svg.selectAll('text')
      .data(dataset)
      .enter()
      .append('text')
      .text(function (d) {
        return d.displayName.replace(/^qe_selenium_/i, '');
      })
      .attr("x", 10)
      .attr("y", function(d, i) {
         return i * 30 + 20;
      })
      .attr("font-family", "sans-serif")
      .attr("font-size", "14px")
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

  self.addBuild = function (build) {
    builds = _.reject(builds, function (b) {
      return b.isDone() &&
        b.job.name === build.job.name &&
        b.number < build.number;
    });

    if (build.isInProgress() || build.hasFailed()) {
      builds.push(build);
      build.onUpdate(function () {
        if (!build.hasFailed()) {
          builds = _.reject(builds, function (b) {
            return b.code === build.code;
          });
        }
        redraw();
      });
    }

    redraw();
  };

  return self;
};

