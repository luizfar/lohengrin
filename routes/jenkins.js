var jenkins = require('../lib/jenkins/driver');

exports.proxy = function (req, res) {
  jenkins.request(req.query.path, {
    partial: function (data) { res.write(data); },
    success: function () { res.end(); },
    error: function (error) { res.json(error); }
  });
};

exports.jobs = function (req, res) {
  require('../lib/jenkins/jobs-tree').create(function (tree) {
    res.json(tree);
  });
};

exports.builds = function (req, res) {
  require('../lib/jenkins/builds').poll(function (newBuilds) {
    res.json(newBuilds);
  });
};
