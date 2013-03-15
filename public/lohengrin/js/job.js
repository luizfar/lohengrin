var lg = lg || {};

lg.job = function (name, baseUrlParam) {
  var self = {};

  self.name = name;
  self.url = '/job/' + name;

  self.children = [];
  self.parents = [];
  self.builds = [];

  self.started = false;

  self.addChild = function (child) {
    if (!self.hasChild(child)) {
      self.children.push(child);
      child.parents.push(self);
    }
  };

  self.hasChild = function (job) {
    return _.find(self.children, function (c) { return c.name === job.name; }) != null;
  };

  self.hasParent = function (job) {
    return _.find(self.parents, function (p) { return p.name === job.name; }) != null;
  };

  self.isRoot = function () {
    return self.parents.length === 0;
  };

  self.start = function () {
    if (!self.started) {
      self.started = true;
      self.poll();
      _.each(self.children, function (child, index) {
        setTimeout(child.start, (index + 1) * 10000);
      });
    }
  };

  self.poll = function () {
    console.debug('Checking for new builds of job ' + self.name);

    lg.jenkinsJson(self.url + lg.job.URL_SUFFIX, function (jobJson) {
      var newBuilds = selectNewBuildsIn(jobJson);

      if (newBuilds.length) {
        console.debug('Processing builds for ' + self.name + ': ' + _.pluck(newBuilds, 'number').join(', '));
      } else {
        console.debug('Found no new builds for ' + self.name);
      }

      _.each(newBuilds, function (build) {
        if (build.parsed) {
          onNewBuild(build);
        } else {
          build.load(function () {
            onNewBuild(build);
          });
        }
      });

      setTimeout(self.poll, 45000);
    });
  };

  function selectNewBuildsIn(jobJson) {
    var builds = getAllJenkinsBuildsIn(jobJson);

    if (self.isRoot() && !self.builds.length) {
      return [builds[0], builds[1], builds[2], builds[3]];
    }

    if (self.builds.length) {
      var latestBuildNumber = _.max(_.map(self.builds, function (build) { return build.number; }));
      return _.filter(builds, function (b) { return b.number > latestBuildNumber; });
    }

    return builds.splice(0, 5);
  }

  function getAllJenkinsBuildsIn(jobJson) {
    var builds = jobJson['builds'];
    var latestListedBuildNumber = parseInt(builds[0]['number']);
    var lastBuild = parseInt(jobJson['lastBuild']['number']);

    var result = _.map(builds, function (build) {
      return lg.build.fromJenkinsBuildData(self, build);
    });

    // jenkins does not include the last build number in the list
    // of builds it returns if the latest build is in progress
    if (lastBuild > latestListedBuildNumber) {
      var missingBuildNumbers = _.range(latestListedBuildNumber + 1, lastBuild + 1);
      _.each(missingBuildNumbers, function (number) {
        result.unshift(lg.build(self, number));
      });
    }

    return result;
  }

  function onNewBuild(build) {
    var isUnknownBuild = !lg.buildsByCode[build.code];
    if (isUnknownBuild && shouldAdd(build)) {
      add(build);
    }
  }

  function shouldAdd(build) {
    if (build.job.isRoot()) {
      return true;
    }

    var hasKnownParents = false;
    _.each(build.upstreamProjectCodes, function (code) {
      var parentBuild = lg.buildsByCode[code];
      if (parentBuild) {
        hasKnownParents = true;
        parentBuild.addChild(build);
      }
    });

    if (hasKnownParents) {
      return true;
    }

    return false;
  }

  function add(build) {
    console.debug('Adding new build: ' + build.code);
    lg.addBuild(build);
    self.builds.push(build);
    if (!build.isDone()) {
      build.checkStatus();
    }
  }

  return self;
};

lg.job.URL_SUFFIX = '/api/json?tree=lastBuild[number],builds[number,building,result,actions[causes[userName,upstreamProject,upstreamBuild]],culprits[fullName]]';
