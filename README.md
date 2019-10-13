# npm-pkg-stats

Quickly grok the current health of an npm package using a single command.

## Installation & Usage

If you'd like to get stats from GitHub, please follow these instructions to [create a personal access token](https://help.github.com/en/articles/creating-a-personal-access-token-for-the-command-line). You will only need read access for the script to work.

Once you've created the token, add it to your global environment variables under `NPM_PKG_STATS_TOKEN`.
For example, if you're using bash, add the following line to your `.bashrc` file: 

`export NPM_PKG_STATS_TOKEN=add_token_here`

Now that you've created your token, just install `npm-pkg-stats` globally:

`npm install --global npm-pkg-stats`

And you're good to go!

`npm-pkg-stats package_name`

For example, `npm-pkg-stats react` prints the following stats to the console:

```
┌──────────────────────────┬───────────────┐
│         (index)          │    Values     │
├──────────────────────────┼───────────────┤
│         version          │   '16.10.2'   │
│       dependencies       │      '3'      │
│        gzip size         │   '2.6 kB'    │
│   weekly npm downloads   │  '6,007,165'  │
│          stars           │   '137,662'   │
│         open PRs         │     '223'     │
│  open PRs (% of total)   │    '8.43%'    │
│        closed PRs        │    '2,422'    │
│       open issues        │     '630'     │
│ open issues (% of total) │    '7.68%'    │
│      closed issues       │    '7,577'    │
│       last release       │ '2019-10-03'  │
│         license          │ 'MIT License' │
└──────────────────────────┴───────────────┘
```

If you prefer to use `npx`:

`npx npm-pkg-stats react`

## Stats

#### version | source: bundlephobia (via npm)
#### dependencies | source: bundlephobia (via npm)
#### gzip size | source: bundlephobia (via npm)
#### weekly npm downloads | source: npm
#### stars | source: github
#### open PRs | source: github
#### open PRs (% of total) | source: github
#### closed PRs | source: github
#### open issues | source: github
#### open issues (% of total) | source: github
#### closed issues | source: github
#### last release | source: github
#### license | source: github