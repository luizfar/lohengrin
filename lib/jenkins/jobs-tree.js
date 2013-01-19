'use strict';

var _ = require('underscore');
var jobs = require('./jobs');
var config = require('../config/all');
var forest = [];

exports.create = function (callback) {
  console.log('creating tree');
  var root = jobs.create({ name: config.jenkins.root });
  var tree = {};
  root.updateStructure(function (job) {
    tree.root = subTree(root);
    callback(tree);
  });
};

function subTree(currentNode) {
  return {
    name: currentNode.name,
    'status': currentNode.status,
    childNodes: _.map(currentNode.downstream, subTree)
  };
}
