const core = require('@actions/core');
const SentryCli = require('@sentry/cli');
const runCommand = require('../src/runCommand');
const run = require('../src/create-deploy');

jest.mock('@actions/core');
jest.mock('@sentry/cli', () => jest.fn());
jest.mock('../src/runCommand');

describe('create-deploy', () => {
  test('No releaseNamePrefix', async () => {
    const getPath = jest.fn().mockReturnValue('sentryCliPath');

    SentryCli.mockImplementation(() => ({
      releases: {},
    }));
    SentryCli.getPath = getPath;
    core.getInput.mockReturnValueOnce('refs/tags/v1.0.0').mockReturnValueOnce('qa');
    runCommand.runCommand.mockResolvedValue('done');

    await run();

    expect(runCommand.runCommand).toHaveBeenCalledTimes(1);
    expect(runCommand.runCommand).toHaveBeenCalledWith('sentryCliPath', [
      'releases',
      'deploys',
      'v1.0.0',
      'new',
      '-e',
      'qa',
    ]);

    expect(core.setFailed).toHaveBeenCalledTimes(0);
  });

  test('releaseNamePrefix set', async () => {
    const getPath = jest.fn().mockReturnValue('sentryCliPath');

    SentryCli.mockImplementation(() => ({
      releases: {},
    }));
    SentryCli.getPath = getPath;
    core.getInput
      .mockReturnValueOnce('refs/tags/v1.0.0')
      .mockReturnValueOnce('qa')
      .mockReturnValueOnce('myAwesomeProject-');
    runCommand.runCommand.mockResolvedValue('done');

    await run();

    expect(runCommand.runCommand).toHaveBeenCalledTimes(1);
    expect(runCommand.runCommand).toHaveBeenCalledWith('sentryCliPath', [
      'releases',
      'deploys',
      'myAwesomeProject-v1.0.0',
      'new',
      '-e',
      'qa',
    ]);

    expect(core.setFailed).toHaveBeenCalledTimes(0);
  });

  test('Action fails', async () => {
    core.getInput.mockImplementation(() => {
      throw new Error('doh, something failed');
    });

    await run();

    expect(core.setFailed).toHaveBeenCalledTimes(1);
    expect(core.setFailed).toHaveBeenCalledWith('doh, something failed');
  });
});
