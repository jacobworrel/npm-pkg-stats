const api = require('./api');
const util = require('./util');
const R = require('ramda');

describe(`api`, () => {
  describe(`getStats`, () => {
    afterEach(() => jest.restoreAllMocks());

    it(`should throw error msg token is nil`, async () => {
      expect.assertions(1);
      try {
        await api.getStats('react');
      } catch (err) {
        expect(err).toBeDefined();
      }
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

      const result = await api.getStats('react', 'token');

      expect(consoleWarn).toHaveBeenCalledWith(
        'Requested package has no repository url in package.json so we were unable to gather stats from GitHub.',
      );
      expect(result).toEqual({
        npmStats: {
          dependencies: '1',
          'gzip size': '1.0 B',
          version: 1,
          'weekly npm downloads': '1',
        },
      });
    });

    it(`should log npm and github stats repository url exists in package.json`, async () => {
      const bundlephobiaData = {
        version: 1,
        dependencyCount: 1,
        gzip: 1,
      };

      jest
        .spyOn(api, 'fetchBundlephobiaData')
        .mockImplementation(R.always(bundlephobiaData));

      const npmDownloadData = {
        downloads: 1,
      };
      jest
        .spyOn(api, 'fetchNpmDownload')
        .mockImplementation(R.always(npmDownloadData));

      jest
        .spyOn(api, 'getRepoUrl')
        .mockImplementation(R.always('https://github.com/facebook/react.git'));

      const githubData = {
        repository: {
          stargazers: {
            totalCount: 1,
          },
          openIssues: {
            totalCount: 1,
          },
          openPRs: {
            totalCount: 1,
          },
          closedIssues: {
            totalCount: 1,
          },
          closedPRs: {
            totalCount: 1,
          },
          releases: {
            nodes: [{ publishedAt: Date.now() }],
          },
          licenseInfo: {
            name: 'MIT',
          },
        },
      };
      jest
        .spyOn(api, 'fetchGithubData')
        .mockImplementation(R.always(githubData));

      jest.spyOn(util, 'formatDate').mockImplementation(R.always('mock_date'));

      const result = await api.getStats('react', 'token');

      expect(result).toEqual({
        npmStats: {
          dependencies: '1',
          'gzip size': '1.0 B',
          version: 1,
          'weekly npm downloads': '1',
        },
        githubStats: {
          'closed PRs': '1',
          'closed issues': '1',
          'github stars': '1',
          'last release': 'mock_date',
          license: 'MIT',
          'open PRs': '1',
          'open PRs (% of total)': '50.00%',
          'open issues': '1',
          'open issues (% of total)': '50.00%',
        },
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
