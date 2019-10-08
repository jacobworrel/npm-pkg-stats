#!/usr/bin/env node

const R = require('ramda');
const dayjs = require('dayjs');
const getRepoUrl = require('get-repository-url');
const parseRepoUrl = require('parse-github-url');

const {
  fetchBundlephobiaData,
  fetchGithubData,
  fetchNpmDownload,
} = require('./api');
const {
  calcPercentage,
  formatSize,
} = require('./util');

/**
 * TODO
 * 1) format numbers
 * 2) write readme
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

  const weeklyNpmDownloads = R.prop('downloads', npmDownloadData);

  const npmStats = {
    dependencies: R.prop('dependencyCount', bundlephobiaData),
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

  const owner = R.pipe(
    parseRepoUrl,
    R.prop('owner')
  )(repoUrl);

  const githubData = await fetchGithubData(package, owner, token);

  const openIssues = R.path(['repository', 'openIssues', 'totalCount'], githubData);
  const closedIssues = R.path(['repository', 'closedIssues', 'totalCount'], githubData);
  const openPRs = R.path(['repository', 'openPRs', 'totalCount'], githubData);
  const closedPRs = R.path(['repository', 'closedPRs', 'totalCount'], githubData);

  const githubStats = {
    stars: R.path(['repository', 'stargazers', 'totalCount'], githubData),
    'open PRs': openPRs,
    'open PRs (% of total)': calcPercentage(openPRs, closedPRs),
    'closed PRs': closedPRs,
    'open issues': openIssues,
    'open issues (% of total)': calcPercentage(openIssues, closedIssues),
    'closed issues': closedIssues,
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