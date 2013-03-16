var lg = lg || {};

lg.jenkins = (function () {
  var self = {};

  function upstreamFilter(jobsByName) {
    var result = {};

    var lastJob = jobsByName[lg.settings.lastJobName];
    if (!lastJob) {
      throw 'Could not find job matching configured lastJobName: ' + lg.settings.lastJobName;
    }

    function addJobAndParents(job) {
      result[job.name] = job;
      _.each(job.parents, function (p) {
        addJobAndParents(p);
      });
    }
    addJobAndParents(lastJob);

    return result;
  }

  function blacklistFilter(jobsByName) {
    function blacklisted(job) {
      return job.blacklisted;
    }

    function markToRemoveIfBlacklisted(job) {
      if (_.contains(blacklist, job.name) || _.any(job.parents, blacklisted)) {
        job.blacklisted = true;
      }
      _.each(job.children, markToRemoveIfBlacklisted);
    }

    var blacklist = (lg.settings.blacklist || '').split(', ');
    markToRemoveIfBlacklisted(jobsByName[lg.settings.rootJobName]);
    var result = {};
    _.each(jobsByName, function (job) {
      if (!blacklisted(job)) {
        result[job.name] = job;
      }
    });

    return result;
  }

  function whitelistFilter(jobsByName) {
    function whitelisted(job) {
      return job.whitelisted;
    }

    function markToKeepIfWhitelisted(job) {
      if (_.contains(whitelist, job.name)) {
        job.whitelisted = true;
      }
      _.each(job.children, markToKeepIfWhitelisted);
    }

    var whitelist = (lg.settings.whitelist || '').split(', ');
    whitelist.push(lg.settings.rootJobName);
    markToKeepIfWhitelisted(jobsByName[lg.settings.rootJobName]);
    var result = {};
    _.each(jobsByName, function (job) {
      if (whitelisted(job)) {
        delete job.whitelisted;
        result[job.name] = job;
      }
    });

    return result;
  }

  function cleanupRemovedChildrenFrom(allJobs) {
    function thatHaveBeenRemoved(job) {
      return !allJobs[job.name];
    }

    _.each(allJobs, function (job) {
      job.children = _.reject(job.children, thatHaveBeenRemoved);
      job.parents = _.reject(job.parents, thatHaveBeenRemoved);
    });

    return allJobs;
  }

  function buildJobTreeFrom(json) {

    var rootJobName = lg.settings.rootJobName;
    var processedJobs = {};
    var downstreamOf = {};
    _.each(json.jobs, function (job) {
      downstreamOf[job.name] = _.pluck(job.downstreamProjects, 'name');
    });

    if (!downstreamOf[rootJobName]) {
      return {};
    }

    function findDownstreamJobs(job) {
      processedJobs[job.name] = job;

      var numberOfSiblings = downstreamOf[job.name].length;

      _.each(downstreamOf[job.name], function (downstreamProjectName) {
        if (processedJobs[downstreamProjectName]) {
          job.addChild(processedJobs[downstreamProjectName]);
        } else {
          var child = lg.job(downstreamProjectName);
          job.addChild(child);
          if (child.name === lg.settings.lastJobName) {
            child.isLast = true;
          }
          child.numberOfSiblings = numberOfSiblings;
          findDownstreamJobs(child);
        }
      });
    }

    var rootJob = lg.job(rootJobName);
    findDownstreamJobs(rootJob);
    var result = processedJobs;

    if (lg.settings.jobFilter === 'upstream') {
      result = upstreamFilter(processedJobs);
    }

    if (lg.settings.jobFilter === 'blacklist') {
      result = blacklistFilter(processedJobs);
    }

    if (lg.settings.jobFilter === 'whitelist') {
      result = whitelistFilter(processedJobs);
    }

    return cleanupRemovedChildrenFrom(result);
  }

  self.buildJobTree = function (callback) {
    lg.jenkinsJson('api/json?tree=jobs[name,downstreamProjects[name],upstreamProjects[name]]', function (json) {
      var jobs = buildJobTreeFrom(json);

      var result = {
        allJobs: jobs,
        root: jobs[lg.settings.rootJobName]
      };

      callback(result);
    });
  };

  return self;
})();
