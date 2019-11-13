const api = require('./api');
const util = require('./util');
const R = require('ramda');

describe(`api`, () => {
  describe(`makeNpmStats`, () => {
    it(`should have version`, () => {
      const bundlephobiaData = {
        version: 1,
      };
      const npmDownloadData = {};

      const { version } = api.makeNpmStats({ bundlephobiaData, npmDownloadData });
      expect(version).toEqual(1);
    });

    it(`should default version`, () => {
      const bundlephobiaData = {};
      const npmDownloadData = {};

      const { version } = api.makeNpmStats({ bundlephobiaData, npmDownloadData });
      expect(version).toEqual('--');
    });

    it(`should have dependencies`, () => {
      const bundlephobiaData = {
        dependencyCount: 1,
      };
      const npmDownloadData = {};

      const spy = jest.spyOn(util, 'formatNumber').mockImplementation(
        R.pipe(
          R.toString,
          R.concat(R.__, '_formatted')
        )
      );
      const { dependencies } = api.makeNpmStats({ bundlephobiaData, npmDownloadData });
      expect(dependencies).toEqual('1_formatted');

      spy.mockRestore();
    });

    it(`should have gzip size`, () => {
      const bundlephobiaData = {
        gzip: 1,
      };
      const npmDownloadData = {};

      jest.spyOn(util, 'formatSize').mockImplementation(R.always({
        size: '10.33',
        unit: 'kB',
      }));
      const gzipSize = R.prop('gzip size', api.makeNpmStats({ bundlephobiaData, npmDownloadData }));
      expect(gzipSize).toEqual('10.3 kB');
    });

    it(`should have weekly npm downloads`, () => {
      const bundlephobiaData = {};
      const npmDownloadData = {
        downloads: 100,
      };

      const spy = jest.spyOn(util, 'formatNumber').mockImplementation(
        R.pipe(
          R.toString,
          R.concat(R.__, '_formatted')
        )
      );
      const weeklyNpmDownloads = R.prop('weekly npm downloads', api.makeNpmStats({ bundlephobiaData, npmDownloadData }));
      expect(weeklyNpmDownloads).toEqual('100_formatted');

      spy.mockRestore();
    });
  });

  describe(`makeQuery`, () => {
    it(`should`, () => {
      expect(api.makeQuery('react', 'facebook')).toMatchSnapshot();
    });
  });
});