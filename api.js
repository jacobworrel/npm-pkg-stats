const { GraphQLClient } = require('graphql-request');

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
  fetchGithubData,
  fetchBundlephobiaData,
  fetchNpmDownload,
};