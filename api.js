const dayjs = require('dayjs');
const getRepoUrl = require('get-repository-url');
const parseRepoUrl = require('parse-github-url');
const R = require('ramda');
const Table = require('cli-table');
const { GraphQLClient } = require('graphql-request');
const {
  calcRatio,
  formatNumber,
  formatPercentage,
  formatSize,
} = require('./util');

const nilValue = '--';

const makeQuery = (package, owner) => `{
  repository(name: "${package}", owner: "${owner}"){
    openIssues: issues(filterBy: { states: [OPEN]}) {
      totalCount
    }
    
    closedIssues: issues(filterBy: { states: [CLOSED]}) {
      totalCount
    }
    
    openPRs: pullRequests(states:[OPEN]) {
      totalCount
    }
    
    closedPRs: pullRequests(states:[CLOSED]) {
      totalCount
    }
    
    stargazers {
      totalCount
    }
    
    licenseInfo {
      name
    }
    
    releases(last: 1) {
      nodes {
        publishedAt
        name
      }
    }
    
  }
}`;

function makeVerticalTable ({
  githubStats,
  npmStats,
  package,
}) {
  const stats = {
    ...npmStats,
    ...githubStats,
  };
  const table = new Table({
    style: {
      head: ['magenta'],
    },
    head: ['package', package],
  });
  const rows = R.pipe(
    R.keys,
    R.map(key => ({ [key]: stats[key] }))
  )(stats);
  table.push(...rows);

  return table;
}

function makeNpmStats ({ bundlephobiaData, npmDownloadData }) {
  const weeklyNpmDownloads = R.pipe(
    R.prop('downloads'),
    formatNumber
  )(npmDownloadData);

  return {
    version: R.pipe(
      R.prop('version'),
      R.defaultTo(nilValue)
    )(bundlephobiaData),
    dependencies: R.pipe(
      R.prop('dependencyCount'),
      formatNumber
    )(bundlephobiaData),
    'gzip size': R.pipe(
      R.prop('gzip'),
      R.ifElse(
        R.isNil,
        R.always(nilValue),
        R.pipe(
          formatSize,
          ({ size, unit }) => `${parseFloat(size).toFixed(1)} ${unit}`
        )
      )
    )(bundlephobiaData),
    'weekly npm downloads': weeklyNpmDownloads,
  };
}

function makeGithubStats ({ githubData }) {
  const openIssues = R.path(['repository', 'openIssues', 'totalCount'], githubData);
  const closedIssues = R.path(['repository', 'closedIssues', 'totalCount'], githubData);
  const openPRs = R.path(['repository', 'openPRs', 'totalCount'], githubData);
  const closedPRs = R.path(['repository', 'closedPRs', 'totalCount'], githubData);

  return {
    'github stars': R.pipe(
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
    license: R.pipe(
      R.path(['repository', 'licenseInfo', 'name']),
      R.defaultTo(nilValue)
    )(githubData),
  };
}

async function getStats (package, token) {
  if (R.isNil(token)) {
    console.error('No NPM_PKG_STATS_TOKEN found in your environment variables. Please follow the installation instructions.');
    return;
  }

  const [ bundlephobiaData, npmDownloadData ] = await Promise.all([
    fetchBundlephobiaData(package),
    fetchNpmDownload(package),
  ]);

  const npmStats = makeNpmStats({ bundlephobiaData, npmDownloadData });

  const repoUrl = await getRepoUrl(package);
  if (R.isNil(repoUrl)) {
    console.warn(`Requested package has no repository url in package.json so we were unable to gather stats from GitHub.`);
    console.log(makeVerticalTable({ npmStats, package }).toString());
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

  const githubStats = makeGithubStats({ githubData });

  console.log('\n');
  console.log(makeVerticalTable({ npmStats, githubStats, package }).toString());
}

async function fetchGithubData (package, owner, token) {
  const graphQLClient = new GraphQLClient('https://api.github.com/graphql', {
    headers: {
      authorization: `Bearer ${token}`,
    },
  });
  return await graphQLClient.request(makeQuery(package, owner));
}

async function fetchBundlephobiaData (package) {
  const resp = await fetch(`https://bundlephobia.com/api/size?package=${package}`);
  return await resp.json();
}

async function fetchNpmDownload (package) {
  const resp = await fetch(`https://api.npmjs.org/downloads/point/last-week/${package}`);
  return await resp.json();
}

module.exports = {
  getStats,
};