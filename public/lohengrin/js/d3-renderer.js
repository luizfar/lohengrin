var lg = lg || {};

lg.d3 = function () {
  var self = {};

  var width = window.innerWidth * 0.85 - 20,
      height = window.innerHeight,
      nodeRadius = 10;

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

  var svg = d3.select("#graph").insert("svg", ":first-child")
      .attr("width", width)
      .attr("height", height);

  var force = d3.layout.force()
      .gravity(0.1)
      .charge(-200)
      .linkDistance(
        function(link) {
          if (link.target.numberOfSiblings() > 6) {
            return 60;
          } else {
            return 20;
          }
        })
      .size([width, height]);

  var forceNodes = force.nodes();
  
  var forceLinks = force.links();

  var buildsCentroids = [
    {x: 1 * width/4, y: 1 * height/4},
    {x: 3 * width/4, y: 1 * height/4},
    {x: 3 * width/4, y: 3 * height/4},
    {x: 1 * width/4, y: 3 * height/4}];

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
          return nodeRadius;
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

    function findHeadBuild(build) {
      var parentBuilds;
      parentBuilds = forceLinks.filter(function (link) {
        return link.target.code === build;
      });

      if (parentBuilds.length == 0) {
        return build;
      }

      return findHeadBuild(parentBuilds[0].source.code);
    };

    force.on("tick", function(e) {
      linkEnter
        .attr("x1", function(d) { return normalizePosition(d.source).x; })
        .attr("y1", function(d) { return normalizePosition(d.source).y; })
        .attr("x2", function(d) { return normalizePosition(d.target).x; })
        .attr("y2", function(d) { return normalizePosition(d.target).y; });

      nodeEnter.attr("transform", function(d) {
        var position = normalizePosition(d);
        return "translate(" + position.x + "," + position.y + ")";
      });

      var headNodes = forceNodes.filter(
        function(node) {
          parentBuilds = forceLinks.filter(function (link) {
            return link.target.code === node.code;
          });
          return parentBuilds.length == 0;
        });

      headNodes.sort(
        function(a, b) {
          if (a.code < b.code)
            return 1;
          if (a.code > b.code)
            return -1;
          return 0;
        });

      var k = e.alpha * 0.1;
      forceNodes.forEach(
        function(node) {
          var headBuildCode = findHeadBuild(node.code);
          var center = buildsCentroids[headNodes.reduce(
            function( cur, val, index ){
              if( val.code === headBuildCode && cur === -1 ) {
                return index;
              }
              return cur;
            }, -1 )];
          node.x += (center.x - node.x) * k;
          node.y += (center.y - node.y) * k;
        });
    });

    force.start();
  }

  function normalizePosition(d) {
    var averageTextSize = 100;
    return {
      x: Math.max(nodeRadius, Math.min(width - nodeRadius - averageTextSize, d.x)),
      y: Math.max(nodeRadius, Math.min(height - nodeRadius, d.y))
    };
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
