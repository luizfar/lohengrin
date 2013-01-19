var lg = lg || {};

lg.jenkinsJson = function (path, callback) {
  var fixedPath = path.length && path[0] === '/' ? path : '/' + path;
  $.get('/jenkins/proxy?path=' + fixedPath, function (response) {
    var json = JSON.parse(response);
    callback(json);
  });
};
