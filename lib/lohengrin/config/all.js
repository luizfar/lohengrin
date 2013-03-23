var configuration = {
  jenkins: {
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

var jenkinsHostnameKey = 'LOHENGRIN_JENKINS_HOSTNAME';
var jenkinsRootKey = 'LOHENGRIN_JENKINS_ROOT';
var jenkinsUsernameKey = 'LOHENGRIN_JENKINS_USERNAME';
var jenkinsPasswordKey = 'LOHENGRIN_JENKINS_PASSWORD';
var jobFilterKey = 'LOHENGRIN_JENKINS_JOB_FILTER';
var lastJobNameKey =  'LOHENGRIN_JENKINS_LAST_JOB_NAME';

function init(env) {
  configuration.jenkins.username = env[jenkinsUsernameKey] || configuration.jenkins.username;
  configuration.jenkins.password = env[jenkinsPasswordKey] || configuration.jenkins.password;
  configuration.jenkins.hostname = env[jenkinsHostnameKey] || configuration.jenkins.hostname;
  configuration.jenkins.rootJobName = env[jenkinsRootKey] || configuration.jenkins.root;
  configuration.jobFilter = env[jobFilterKey] || configuration.jobFilter;
  configuration.lastJobName = env[lastJobNameKey] || configuration.lastJobName;

  module.exports = configuration;
  module.exports.clientConfig = {
    rootJobName: configuration.jenkins.rootJobName,
    jobFilter: configuration.jobFilter,
    lastJobName: configuration.lastJobName
  };
  module.exports.init = init;
}

init(process.env);

