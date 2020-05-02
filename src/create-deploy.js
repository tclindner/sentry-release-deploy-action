const core = require('@actions/core');
const SentryCli = require('@sentry/cli');
const {runCommand} = require('./runCommand');

const run = async () => {
  try {
    // Get the inputs from the workflow file: https://github.com/actions/toolkit/tree/master/packages/core#inputsoutputs
    const version = core.getInput('version', {
      required: true,
    });
    const environment = core.getInput('environment', {
      required: true,
    });
    const versionPrefix = core.getInput('versionPrefix', {
      required: false,
    });

    // This removes the 'refs/tags' portion of the string, i.e. from 'refs/tags/v1.0.0' to 'v1.0.0'
    const cleanVersion = version.replace('refs/tags/', '');
    let sentryReleaseVersion = cleanVersion;

    if (versionPrefix) {
      sentryReleaseVersion = `${versionPrefix}${cleanVersion}`;
    }

    core.info(`Clean version is: ${cleanVersion}`);
    core.info(`Sentry release version is: ${sentryReleaseVersion}`);

    // Create a deployment (A node.js function isn't exposed for this operation.)
    const sentryCliPath = SentryCli.getPath();

    core.info(`sentryCliPath: ${sentryCliPath}`);
    await runCommand(sentryCliPath, ['releases', 'deploys', sentryReleaseVersion, 'new', '-e', environment]);
  } catch (error) {
    core.setFailed(error.message);
  }
};

module.exports = run;
