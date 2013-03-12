var lg = lg || {};

lg.jenkinsJson = function (path, callback, tries) {
  tries = tries || 0;
  if (tries < 5) {
    var fixedPath = path.length && path[0] === '/' ? path : '/' + path;
    $.get('/jenkins/proxy?path=' + fixedPath, function (response) {
      try {
        var json = JSON.parse(response);
      } catch (e) {
        console.error('Error parsing response to ' + path + ': ' + response);
        lg.jenksinsJson(path, callback, tries + 1);
      }
      callback(json);
    });
  } else {
    console.error('Giving up request to ' + path + ' after many errors.');
  }
};
