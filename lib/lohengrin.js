function start(rootdir) {
  var express = require('express');
  var http = require('http');
  var path = require('path');

  var routes = require('./lohengrin/routes/all');
  var config = require('./lohengrin/config/all');

  var app = express();

  app.configure(function () {
    app.set('port', process.env.PORT || 3000);
    app.set('views', rootdir + '/views');
    app.set('view engine', 'ejs');
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.cookieParser('your secret here'));
    app.use(express.session());
    app.use(app.router);
    app.use(require('less-middleware')({
      debug: true,
      src: path.join(rootdir, '/public/lohengrin/stylesheets/less'),
      dest: path.join(rootdir, '/public/lohengrin/stylesheets/css'),
      prefix: '/lohengrin/stylesheets/css'
    }));
    app.use(express['static'](path.join(rootdir, 'public')));
  });

  app.configure('development', function () {
    app.use(express.errorHandler());
  });

  routes.register(app);

  http.createServer(app).listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
  });
}

exports.start = start;
