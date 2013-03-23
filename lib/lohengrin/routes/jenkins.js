var jenkins = require('../jenkins/driver');

exports.proxy = function (req, res) {
  jenkins.request(req.query.path, {
    partial: function (data) { res.write(data); },
    success: function () { res.end(); },
    error: function (error) { res.json(error); }
  });
};
