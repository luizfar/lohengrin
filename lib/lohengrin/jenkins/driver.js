var config = require('../config/all');
var https = require('https');

exports.request = function (path, callbacks) {
  var options = {
    hostname: config.jenkins.hostname,
    auth: config.jenkins.username + ':' + config.jenkins.password,
    path: path
  };

  var handlers = callbacks || {};
  var onData = handlers.partial || function () {};
  var onEnd = handlers.success || function () {};
  var onError = handlers.error || function () {};

  var allData = '';

  console.log(options);

  var response = https.request(options, function (request) {
    request.setEncoding('utf8');

    request.on('data', function (data) {
      onData(data);
      allData = allData + data;
    });

    request.on('end', function () { onEnd(allData); });
  });

  response.on('error', function (e) { onError(e); });

  response.end();
};
