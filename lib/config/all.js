'use strict';

var configuration = {
  jenkins: {
    url: 'http://jenkins-ci.org',
    hostname: 'jenkins-ci.org',
    username: 'user',
    password: 'secret',
    rootJobName: 'Root_Job'
  },

  /**
   * Defines which jobs will have builds displayed.
   * The allowed values are:
   *
   * 'none': all jobs that are downstream projects of the root job will be
   * displayed. This is the default.
   *
   * 'whitelist': displays only the jobs listed in the 'whitelist' setting.
   *
   * 'blacklist': filters out the jobs listed in the 'blacklist' setting.
   *
   * 'upstream': displays only jobs that are upstream dependencies of a
   * a given job, named in the 'lastJobName' setting.
   */
  jobFilter: 'none',
  lastJobName: ''
};

var jenkinsUrlKey = 'JENKINS_URL';
var jenkinsHostnameKey = 'JENKINS_HOSTNAME';
var jenkinsRootKey = 'JENKINS_ROOT';
var jenkinsUsernameKey = 'JENKINS_USERNAME';
var jenkinsPasswordKey = 'JENKINS_PASSWORD';
var jobFilterKey = 'JOB_FILTER';
var lastJobNameKey =  'LAST_JOB_NAME';

function init(env) {
  configuration.jenkins.url = env[jenkinsUrlKey] || configuration.jenkins.url;
  configuration.jenkins.username = env[jenkinsUsernameKey] || configuration.jenkins.username;
  configuration.jenkins.password = env[jenkinsPasswordKey] || configuration.jenkins.password;
  configuration.jenkins.hostname = env[jenkinsHostnameKey] || configuration.jenkins.hostname;
  configuration.jenkins.rootJobName = env[jenkinsRootKey] || configuration.jenkins.root;
  configuration.jobFilter = env[jobFilterKey] || configuration.jobFilter;
  configuration.lastJobName = env[lastJobNameKey] || configuration.lastJobName;
}

init(process.env);

module.exports = configuration;
module.exports.clientConfig = {
  rootJobName: configuration.jenkins.rootJobName,
  jobFilter: configuration.jobFilter,
  lastJobName: configuration.lastJobName
};
