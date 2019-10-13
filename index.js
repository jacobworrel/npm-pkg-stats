#!/usr/bin/env node

const dayjs = require('dayjs');
const getRepoUrl = require('get-repository-url');
const parseRepoUrl = require('parse-github-url');
const R = require('ramda');

const {
  fetchBundlephobiaData,
  fetchGithubData,
  fetchNpmDownload,
} = require('./api');
const {
  calcRatio,
  formatNumber,
  formatPercentage,
  formatSize,
} = require('./util');

/**
 * TODO
 * - handle no bundlephobia data case (test with 'npm-pkg-stats node')
 * - prettify console output
 *  - use better table logging package (ie. cli-table, table etc...)
 *  - add banner (look into figlet, chalk etc..)
 * - add support for multiple packages (ie. comparison mode)
 */

async function getStats (package, token) {
  if (R.isNil(token)) {
    console.error('No NPM_PKG_STATS_TOKEN found in your environment variables. Please follow the installation instructions.');
    return;
  }

  const [ bundlephobiaData, npmDownloadData ] = await Promise.all([
    fetchBundlephobiaData(package),
    fetchNpmDownload(package),
  ]);

  const weeklyNpmDownloads = R.pipe(
    R.prop('downloads'),
    formatNumber
  )(npmDownloadData);

  const npmStats = {
    version: R.prop('version', bundlephobiaData),
    dependencies: R.pipe(
      R.prop('dependencyCount'),
      formatNumber
    )(bundlephobiaData),
    'gzip size': R.pipe(
      R.prop('gzip'),
      formatSize,
      ({ size, unit }) => `${parseFloat(size).toFixed(1)} ${unit}`
    )(bundlephobiaData),
    'weekly npm downloads': weeklyNpmDownloads,
  };

  const repoUrl = await getRepoUrl(package);
  if (R.isNil(repoUrl)) {
    console.warn(`Requested package has no repository url in package.json so we were unable to gather stats from GitHub.`);
    console.table(npmStats);
    return;
  }

  const {
    owner,
    name: githubPackageName,
  } = R.pipe(
    parseRepoUrl,
    R.pick(['owner', 'name'])
  )(repoUrl);

  const githubData = await fetchGithubData(githubPackageName, owner, token);

  const openIssues = R.path(['repository', 'openIssues', 'totalCount'], githubData);
  const closedIssues = R.path(['repository', 'closedIssues', 'totalCount'], githubData);
  const openPRs = R.path(['repository', 'openPRs', 'totalCount'], githubData);
  const closedPRs = R.path(['repository', 'closedPRs', 'totalCount'], githubData);

  const githubStats = {
    stars: R.pipe(
      R.path(['repository', 'stargazers', 'totalCount']),
      formatNumber
    )(githubData),
    'open PRs': formatNumber(openPRs),
    'open PRs (% of total)': formatPercentage(calcRatio(openPRs, closedPRs)),
    'closed PRs': formatNumber(closedPRs),
    'open issues': formatNumber(openIssues),
    'open issues (% of total)': formatPercentage(calcRatio(openIssues, closedIssues)),
    'closed issues': formatNumber(closedIssues),
    'last release': R.pipe(
      R.path(['repository', 'releases', 'nodes']),
      R.head,
      R.prop('publishedAt'),
      date => dayjs(date).format('YYYY-MM-DD')
    )(githubData),
    license: R.path(['repository', 'licenseInfo', 'name'], githubData),
  };

  console.table({
    ...npmStats,
    ...githubStats,
  })
}
const [ package ] = R.drop(2, process.argv);
const token = process.env.NPM_PKG_STATS_TOKEN;

getStats(package, token).catch(err => console.error(err));