require('dotenv').config({ path: './variables.env' });
const { GraphQLClient } = require('graphql-request');
const R = require('ramda');
const dayjs = require('dayjs');
const getRepoUrl = require('get-repository-url');
const parseRepoUrl = require('parse-github-url');

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

const graphQLClient = new GraphQLClient('https://api.github.com/graphql', {
  headers: {
    authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
  },
});

async function fetchGithubData (package, owner) {
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

async function fetchPackageJson (package) {
  const resp = await fetch(`https://registry.npmjs.org/${package}/latest`);
  return await resp.json();
}

const getDepCountBy = R.pipe(
  R.prop('dependencies'),
  R.keys,
  R.length,
);

function calcPercentage (open, closed) {
  const total = R.add(open, closed);
  const percentage = open / total * 100;
  return Number(percentage.toFixed(2));
}

// copied from bundlephobia source
function formatSize (value) {
  let unit, size;
  if (Math.log10(value) < 3) {
    unit = 'B';
    size = value
  } else if (Math.log10(value) < 6) {
    unit = 'kB';
    size = value / 1024
  } else {
    unit = 'mB';
    size = value / 1024 / 1024
  }

  return { unit, size }
}

async function getStats (package) {
  const repoUrl = await getRepoUrl(package);
  const owner = R.pipe(
    parseRepoUrl,
    R.prop('owner')
  )(repoUrl);

  const isRepoUrlNil = R.isNil(repoUrl);

  const bundlephobiaData = await fetchBundlephobiaData(package);
  const { downloads: weeklyNpmDownloads } = await fetchNpmDownload(package);

  const npmStats = {
    dependencies: R.prop('dependencyCount', bundlephobiaData),
    'gzip size': R.pipe(
      R.prop('gzip'),
      formatSize,
      ({ size, unit }) => `${parseFloat(size).toFixed(1)} ${unit}`
    )(bundlephobiaData),
    'weekly npm downloads': weeklyNpmDownloads,
  };

  if (isRepoUrlNil) {
    console.warn(`Requested package has no repository url in package.json so we were unable to gather stats from GitHub.`);
    console.table(npmStats);
    return;
  }

  const githubData = await fetchGithubData(package, owner);

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

getStats('react-windowed-select');