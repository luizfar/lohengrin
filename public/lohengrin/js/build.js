var lg = lg || {};

lg.build = function (job, number) {
  var self = {};
  var updateListeners = [];

  self.number = number;
  self.status = 'unknown';
  self.culprits = '';
  self.job = job;
  self.code = lg.build.codeOf(job, number);
  self.url = self.job.url + '/' + self.number;
  self.started = false;
  self.parsed = false;
  self.upstreamProjectCodes = [];
  self.displayName = (function () {
    return self.code;
  })();

  self.parents = [];
  self.children = [];

  self.addChild = function (child) {
    if (!self.hasChild(child)) {
      self.children.push(child);
    }
    if (!child.hasParent(self)) {
      child.parents.push(self);
    }
  };

  self.hasChild = function (build) {
    return _.find(self.children, function (c) { return c.code === build.code; }) != null;
  };

  self.hasParent = function (build) {
    return _.find(self.parents, function (p) { return p.code === build.code; }) != null;
  };

  self.isDone = function () {
    return self.status === 'success' || self.status === 'failure';
  };

  self.isInProgress = function () {
    return !self.isDone();
  };

  self.hasFailed = function () {
    return self.status == 'failure';
  };

  self.hasSucceeded = function () {
    return self.status == 'success';
  };

  self.isRoot = function () {
    return self.job.isRoot();
  };

  self.sameJobAs = function (build) {
    return self.job.name === build.job.name;
  };

  self.parseJenkinsBuildJson = function (buildJson) {
    self.status = buildJson['building'] ? 'building' : buildJson['result'].toLowerCase();

    var causesAction = _.find(buildJson['actions'], function (action) { return action['causes']; });
    var causes = causesAction['causes'];

    if (causes[0]['userName']) {
      self.culprits = causes[0]['userName'];
    }
    if (!self.culprits && buildJson['culprits'].length) {
      self.culprits = _.pluck(buildJson['culprits'], 'fullName').join(', ');
    }

    _.each(causes, function (cause, index) {
      if (cause['upstreamBuild']) {
        var code = lg.build.codeOf(cause['upstreamProject'], cause['upstreamBuild']);
        self.upstreamProjectCodes.push(code);
      }
    });

    self.parsed = true;
  };

  self.load = function (callback) {
    lg.jenkinsJson(self.url + '/api/json', function (buildJson) {
      self.parseJenkinsBuildJson(buildJson);
      callback(self);
    });
  };

  self.checkStatus = function () {
    console.debug('Checking status of build ' + self.code);
    self.load(function () {
      if (self.isDone()) {
        console.debug('Build ' + self.code + ' finished.');
        self.updated();
      } else {
        setTimeout(function () { self.checkStatus(); }, 10000);
      }
    });
  };

  self.onUpdate = function (listener) {
    updateListeners.push(listener);
  };

  self.updated = function () {
    _.each(updateListeners, function (listener) {
      listener(self);
    });
  };

  return self;
};

lg.build.codeOf = function (job, number) {
  return (typeof(job) === 'string' ? job : job.name) + '#' + number;
};

lg.build.fromJenkinsBuildData = function (job, buildJson) {
  var build = lg.build(job, parseInt(buildJson['number']));
  build.parseJenkinsBuildJson(buildJson);
  return build;
};
