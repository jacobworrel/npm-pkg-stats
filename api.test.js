const api = require('./api');
const util = require('./util');
const R = require('ramda');

describe(`api`, () => {
  describe(`getStats`, () => {
    afterEach(() => jest.restoreAllMocks());

    it(`should log error msg to console when token is nil`, async () => {
      const spy = jest
        .spyOn(global.console, 'error')
        .mockImplementation(() => {});
      await api.getStats('react');

      expect(spy).toHaveBeenCalledWith(
        'No NPM_PKG_STATS_TOKEN found in your environment variables. Please follow the installation instructions.',
      );
    });

    it(`should only log npm stats when no repository url exists in package.json`, async () => {
      const bundlephobiaData = {
        version: 1,
        dependencyCount: 1,
        gzip: 1,
      };

      const npmDownloadData = {
        downloads: 1,
      };

      jest
        .spyOn(api, 'fetchBundlephobiaData')
        .mockImplementation(R.always(bundlephobiaData));

      jest
        .spyOn(api, 'fetchNpmDownload')
        .mockImplementation(R.always(npmDownloadData));

      jest.spyOn(api, 'getRepoUrl').mockImplementation(R.always(undefined));

      const consoleWarn = jest
        .spyOn(global.console, 'warn')
        .mockImplementation(() => {});

      const consoleLog = jest
        .spyOn(global.console, 'log')
        .mockImplementation(() => {});

      const makeVerticalTable = jest.spyOn(api, 'makeVerticalTable');

      await api.getStats('react', 'token');

      expect(consoleWarn).toHaveBeenCalledWith(
        'Requested package has no repository url in package.json so we were unable to gather stats from GitHub.',
      );
      expect(consoleLog).toHaveBeenCalledTimes(1);
      expect(makeVerticalTable).toHaveBeenCalledWith({
        npmStats: {
          dependencies: '1',
          'gzip size': '1.0 B',
          version: 1,
          'weekly npm downloads': '1',
        },
        pkg: 'react',
      });
    });
  });

  describe(`makeNpmStats`, () => {
    afterEach(() => jest.restoreAllMocks());

    it(`should have version`, () => {
      const bundlephobiaData = {
        version: 1,
      };
      const npmDownloadData = {};

      const { version } = api.makeNpmStats({
        bundlephobiaData,
        npmDownloadData,
      });
      expect(version).toEqual(1);
    });

    it(`should default version`, () => {
      const bundlephobiaData = {};
      const npmDownloadData = {};

      const { version } = api.makeNpmStats({
        bundlephobiaData,
        npmDownloadData,
      });
      expect(version).toEqual('--');
    });

    it(`should have dependencies`, () => {
      const bundlephobiaData = {
        dependencyCount: 1,
      };
      const npmDownloadData = {};

      jest
        .spyOn(util, 'formatNumber')
        .mockImplementation(R.pipe(R.toString, R.concat(R.__, '_formatted')));
      const { dependencies } = api.makeNpmStats({
        bundlephobiaData,
        npmDownloadData,
      });
      expect(dependencies).toEqual('1_formatted');
    });

    it(`should have gzip size`, () => {
      const bundlephobiaData = {
        gzip: 1,
      };
      const npmDownloadData = {};

      jest.spyOn(util, 'formatSize').mockImplementation(
        R.always({
          size: '10.33',
          unit: 'kB',
        }),
      );
      const gzipSize = R.prop(
        'gzip size',
        api.makeNpmStats({ bundlephobiaData, npmDownloadData }),
      );
      expect(gzipSize).toEqual('10.3 kB');
    });

    it(`should have weekly npm downloads`, () => {
      const bundlephobiaData = {};
      const npmDownloadData = {
        downloads: 100,
      };

      jest
        .spyOn(util, 'formatNumber')
        .mockImplementation(R.pipe(R.toString, R.concat(R.__, '_formatted')));
      const weeklyNpmDownloads = R.prop(
        'weekly npm downloads',
        api.makeNpmStats({ bundlephobiaData, npmDownloadData }),
      );
      expect(weeklyNpmDownloads).toEqual('100_formatted');
    });
  });

  describe(`makeQuery`, () => {
    it(`should`, () => {
      expect(api.makeQuery('react', 'facebook')).toMatchSnapshot();
    });
  });
});
