'use strict';

var _ = require('underscore');
var jenkins = require('./driver');
var allJobs = [];

exports.create = function (params) {
  var job = _.extend({
    name: 'missing-job-name',
    'status': undefined,
    downstream: [],
    updateStructure: updateStructure,
    upstream: []
  }, exports.findByName((params || {}).name) || {}, params);

  return (allJobs.push(job) && false) || job;
};

function jobWithName(name) {
  return function (job) { return job.name == name; };
}

function pathToUpdateStructureOf(job) {
  var path = '';
  path = path + '/job/' + job.name + '/api/json?';
  path = path + 'tree=';
  _.times(20, function () {
    path = path + [
      'name,buildable,',
      'lastBuild[number],lastFailedBuild[number],lastCompleteBuild[number],',
      'lastSuccessfulBuild[number],lastUnSucccessfulBuil[number],',
      'downstreamProjects['
    ].join('');
  });
  path = path + 'name]]]]]]]]]]]]]]]]]]]]';
  path = path + '&depth=20';
  return path;
}

function updateStructure(callback) {
  /*jshint validthis:true*/
  var job = this;
  jenkins.request(pathToUpdateStructureOf(job), {
    success: function (data) {
      updateFromData(job, data);
      callback && callback(job);
    }
  });
}

function statusFrom(data) {
  return (
    (!data.buildable && 'disabled') ||
    (!data.lastBuild && 'unknown') ||
    (data.lastBuild.number == (data.lastSuccessfulBuild || {}).number && 'success') ||
    (data.lastBuild.number == (data.lastFailedBuild || {}).number && 'failure') ||
    (data.lastBuild.number && 'building')
  );
}

function parseData(data) {
  try { return JSON.parse(data); } catch (e) { return data; }
}

function updateFromData(job, data) {
  var parsed = parseData(data);

  job.name = parsed.name;
  job.status = statusFrom(parsed);
  job.downstream = _.map(parsed.downstreamProjects || [], function (downstreamJob) {
    return updateFromData(exports.create(), downstreamJob);
  });

  return job;
}

exports.findByName = function (name) {
  return _.find(allJobs, jobWithName(name));
};
