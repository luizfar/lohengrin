'use strict';

var _ = require('underscore');
var jobs = require('./jobs');
var config = require('../config/all');
var forest = [];

exports.create = function (callback) {
  var root = jobs.create({ name: config.jenkins.root });
  var tree = {};
  tree.toD3 = toD3;
  root.updateStructure(function (job) {
    tree.root = subTree(root);
    callback(tree);
  });
};

function toD3() {
  var d3 = { nodes: [], links: [] };
  
  subD3Nodes(d3, this.root);
  subD3Links(d3, this.root);

  d3.links = _.flatten(d3.links);
  d3.links = _.uniq(d3.links, false, function (x) { 
    return 'source' + x.source + 'target' + x.target; 
  });

  return d3;
}

function subD3Nodes(d3, node) {
  d3.nodes.push({name: node.name, 'status': node.status });
  _.each(node.childNodes || [], function (childNode) { subD3Nodes(d3, childNode); });
  d3.nodes = _.uniq(d3.nodes, false, function (x) { return x.name; } );
}

function subD3Links(d3, node) {
  var indexOfNode = indexOfD3(d3, node);
  d3.links.push(_.map(node.childNodes || [], function (childNode) {
    var indexOfChild = indexOfD3(d3, childNode);
    subD3Links(d3, childNode);
    return { source: indexOfNode, target: indexOfChild }; 
  }));
}

function indexOfD3(d3, node) {
  var indexOfNode = 0;
  _.find(d3.nodes || [], function (d3Node, index) {
    if (d3Node.name == node.name) {
      indexOfNode = index;
      return true;
    }
  });
  return indexOfNode;
}

function subTree(currentNode) {
  return {
    name: currentNode.name,
    'status': currentNode.status,
    childNodes: _.map(currentNode.downstream, subTree)
  };
}
