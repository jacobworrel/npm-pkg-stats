const getRepoUrl = require('get-repository-url');
const parseGithubUrl = require('parse-github-url');
const R = require('ramda');
const Table = require('cli-table');
const { GraphQLClient } = require('graphql-request');
const util = require('./util');

const api = {};

api.nilValue = '--';

api.getRepoUrl = async pkg => await getRepoUrl(pkg);

api.makeOwnerAndPkgNameBy = R.pipe(parseGithubUrl, R.pick(['owner', 'name']));

api.makeQuery = (pkg, owner) => `{
  repository(name: "${pkg}", owner: "${owner}"){
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

const tableStyle = {
  head: ['magenta'],
};

api.makeVerticalTable = function makeVerticalTable({ pkg, ...stats }) {
  const table = new Table({
    style: tableStyle,
    head: ['package', pkg],
  });
  const rows = R.pipe(
    R.keys,
    R.map(key => ({ [key]: stats[key] })),
  )(stats);
  table.push(...rows);

  return table;
};

api.makeHorizontalTable = function makeHorizontalTable({
  labelList,
  valueList,
}) {
  const table = new Table({
    style: tableStyle,
    head: labelList,
  });
  table.push(...valueList);

  return table;
};

api.makeNpmStats = function makeNpmStats({
  bundlephobiaData,
  npmDownloadData,
}) {
  return {
    version: R.pipe(
      R.prop('version'),
      R.defaultTo(api.nilValue),
    )(bundlephobiaData),
    dependencies: R.pipe(
      R.prop('dependencyCount'),
      util.formatNumber,
    )(bundlephobiaData),
    'gzip size': R.pipe(
      R.prop('gzip'),
      R.ifElse(
        R.isNil,
        R.always(api.nilValue),
        R.pipe(
          util.formatSize,
          ({ size, unit }) => `${parseFloat(size).toFixed(1)} ${unit}`,
        ),
      ),
    )(bundlephobiaData),
    'weekly npm downloads': R.pipe(
      R.prop('downloads'),
      util.formatNumber,
    )(npmDownloadData),
  };
};

api.makeGithubStats = function makeGithubStats({ githubData = {} }) {
  const openIssues = R.path(
    ['repository', 'openIssues', 'totalCount'],
    githubData,
  );
  const closedIssues = R.path(
    ['repository', 'closedIssues', 'totalCount'],
    githubData,
  );
  const openPRs = R.path(['repository', 'openPRs', 'totalCount'], githubData);
  const closedPRs = R.path(
    ['repository', 'closedPRs', 'totalCount'],
    githubData,
  );

  return {
    'github stars': R.pipe(
      R.path(['repository', 'stargazers', 'totalCount']),
      util.formatNumber,
    )(githubData),
    'open PRs': util.formatNumber(openPRs),
    'open PRs (% of total)': util.formatPercentage(
      util.calcRatio(openPRs, closedPRs),
    ),
    'closed PRs': util.formatNumber(closedPRs),
    'open issues': util.formatNumber(openIssues),
    'open issues (% of total)': util.formatPercentage(
      util.calcRatio(openIssues, closedIssues),
    ),
    'closed issues': util.formatNumber(closedIssues),
    'last release': R.pipe(
      R.path(['repository', 'releases', 'nodes']),
      R.defaultTo([]),
      R.head,
      R.prop('publishedAt'),
      util.formatDate,
    )(githubData),
    license: R.pipe(
      R.path(['repository', 'licenseInfo', 'name']),
      R.defaultTo(api.nilValue),
    )(githubData),
  };
};

api.getStats = R.curry(async function getStats(token, pkg) {
  if (R.isNil(token)) {
    throw new Error(
      'No NPM_PKG_STATS_TOKEN found in your environment variables. Please follow the installation instructions: https://github.com/jacobworrel/npm-pkg-stats#installation--usage.',
    );
  }

  const [bundlephobiaData, npmDownloadData] = await Promise.all([
    api.fetchBundlephobiaData(pkg),
    api.fetchNpmDownload(pkg),
  ]);
  const npmStats = api.makeNpmStats({ bundlephobiaData, npmDownloadData });

  const repoUrl = await api.getRepoUrl(pkg);
  if (R.isNil(repoUrl)) {
    console.warn(
      `Requested package "${pkg}" has no repository url in package.json so we were unable to gather stats from GitHub.`,
    );
    return {
      pkg,
      ...npmStats,
    };
  }

  const { owner, name: githubPackageName } = api.makeOwnerAndPkgNameBy(repoUrl);
  const githubData = await api.fetchGithubData(githubPackageName, owner, token);
  const githubStats = api.makeGithubStats({ githubData });

  return {
    pkg,
    ...npmStats,
    ...githubStats,
  };
});

api.fetchGithubData = async function fetchGithubData(pkg, owner, token) {
  const graphQLClient = new GraphQLClient('https://api.github.com/graphql', {
    headers: {
      authorization: `Bearer ${token}`,
    },
  });
  return await graphQLClient.request(api.makeQuery(pkg, owner));
};

api.fetchBundlephobiaData = async function fetchBundlephobiaData(pkg) {
  const resp = await fetch(`https://bundlephobia.com/api/size?package=${pkg}`);
  return await resp.json();
};

api.fetchNpmDownload = async function fetchNpmDownload(pkg) {
  const resp = await fetch(
    `https://api.npmjs.org/downloads/point/last-week/${pkg}`,
  );
  return await resp.json();
};

module.exports = api;
