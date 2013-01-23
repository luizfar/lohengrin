var lg = lg || {};

lg.d3 = function () {
  var self = {};

  var width = window.innerWidth,
      height = window.innerHeight;

  var color = d3.scale.category20();

  function buildsToGraph() {
    var links = [];
    var buildIndexesByNameAndNumber = {};
    var builds = lg.allBuilds;

    _.each(builds, function (build, index) {
      buildIndexesByNameAndNumber[build.code] = index;
    });
    _.each(builds, function (build) {
      var buildIndex = buildIndexesByNameAndNumber[build.code];
      _.each(build.children, function (child) {
        links.push({
          source: buildIndex,
          target: buildIndexesByNameAndNumber[child.code]
        });
      });
    });

    return {
      nodes: builds,
      links: links
    };
  }

  var svg = d3.select("body").insert("svg", ":first-child")
      .attr("width", width)
      .attr("height", height);

  var force = d3.layout.force()
      .charge(-240)
      .linkDistance(20)
      .size([width, height]);

  var forceNodes = force.nodes();
  var forceLinks = force.links();

  function restart() {
    var allLinks = svg.selectAll("line.link")
        .data(forceLinks, function (d) { return d.source + '-' + d.target; });

    var linkEnter = allLinks
        .enter().insert('svg:line', 'g.node')
        .attr('class',  'link');

    allLinks.exit().remove();

    var allNodes = svg
        .selectAll('.node')
        .data(forceNodes);

    var nodeEnter = allNodes
        .enter()
        .append('g')
        .attr('class', 'node')
        .attr('data-build-code', function (d) { return d.code; })
        .call(force.drag);

    nodeEnter.append('svg:circle')
        .attr('r', function (d) {
          return 10;
        })
        .attr('class', function (d) { 
          return d.status + ' ' + (d.job.isLast ? 'last' : ''); 
        })
        .style('fill', function(d) {
          if (d.status == 'success') {
            if (d.isRoot()) {
              return '#00cc00';
            }
            if (d.job.isLast) {
              return '#00ff00';
            }
            return 'green';
          }
          if (d.status == 'building') {
            return 'yellow';
          }
          if (d.status == 'failure') {
            return 'red';
          }
          return '#bbb';
        });

    nodeEnter.append('text')
        .attr('class', 'nodetext')
        .attr("dx", 12)
        .attr("dy", ".35em")
        .text(function (d) {
          if (d.hasFailed()) {
            return d.displayName.replace(/^qe_selenium_/i, '');
          }
          if (d.isRoot()) {
            return d.culprits;
          }
          return '';
        });

    nodeEnter.append('title').text(function (d) { return d.displayName; });

    allNodes.exit().remove();

    force.on("tick", function() {
      linkEnter
          .attr("x1", function(d) { return d.source.x; })
          .attr("y1", function(d) { return d.source.y; })
          .attr("x2", function(d) { return d.target.x; })
          .attr("y2", function(d) { return d.target.y; });

      nodeEnter.attr("transform", function(d) {
            return "translate(" + d.x + "," + d.y + ")";
          });
    });


    force.start();
  }

  self.redraw = function () {
    forceNodes.splice(0, forceNodes.length);
    forceLinks.splice(0, forceLinks.length);
    restart();

    var graph = buildsToGraph();

    _.each(graph.nodes, function (n) { forceNodes.push(n); });
    _.each(graph.links, function (l) { forceLinks.push(l); });
    restart();
  };

  return self;
};
