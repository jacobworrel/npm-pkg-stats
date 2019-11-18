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
┌──────────────────────────┬─────────────┐
│ package                  │ react       │
├──────────────────────────┼─────────────┤
│ version                  │ 16.10.2     │
├──────────────────────────┼─────────────┤
│ dependencies             │ 3           │
├──────────────────────────┼─────────────┤
│ gzip size                │ 2.6 kB      │
├──────────────────────────┼─────────────┤
│ weekly npm downloads     │ 5,878,791   │
├──────────────────────────┼─────────────┤
│ github stars             │ 137,853     │
├──────────────────────────┼─────────────┤
│ open PRs                 │ 233         │
├──────────────────────────┼─────────────┤
│ open PRs (% of total)    │ 8.77%       │
├──────────────────────────┼─────────────┤
│ closed PRs               │ 2,423       │
├──────────────────────────┼─────────────┤
│ open issues              │ 637         │
├──────────────────────────┼─────────────┤
│ open issues (% of total) │ 7.74%       │
├──────────────────────────┼─────────────┤
│ closed issues            │ 7,588       │
├──────────────────────────┼─────────────┤
│ last release             │ 2019-10-03  │
├──────────────────────────┼─────────────┤
│ license                  │ MIT License │
└──────────────────────────┴─────────────┘
```

If you prefer to use `npx`:

`npx npm-pkg-stats react`

### Multiple Packages

It also works if you want to compare multiple packages side by side.

For example, `npm-pkg-stats ramda lodash underscore` prints the following to the console:

```
┌────────────┬─────────┬──────────────┬───────────┬──────────────────────┬──────────────┬──────────┬───────────────────────┬────────────┬─────────────┬──────────────────────────┬───────────────┬──────────────┬─────────────┐
│ pkg        │ version │ dependencies │ gzip size │ weekly npm downloads │ github stars │ open PRs │ open PRs (% of total) │ closed PRs │ open issues │ open issues (% of total) │ closed issues │ last release │ license     │
├────────────┼─────────┼──────────────┼───────────┼──────────────────────┼──────────────┼──────────┼───────────────────────┼────────────┼─────────────┼──────────────────────────┼───────────────┼──────────────┼─────────────┤
│ ramda      │ 0.26.1  │ 0            │ 12.3 kB   │ 5,611,712            │ 17,525       │ 97       │ 24.31%                │ 302        │ 172         │ 12.49%                   │ 1,205         │ 2019-05-26   │ MIT License │
├────────────┼─────────┼──────────────┼───────────┼──────────────────────┼──────────────┼──────────┼───────────────────────┼────────────┼─────────────┼──────────────────────────┼───────────────┼──────────────┼─────────────┤
│ lodash     │ 4.17.15 │ 0            │ 24.3 kB   │ 25,955,925           │ 42,361       │ 11       │ 2.39%                 │ 449        │ 8           │ 0.23%                    │ 3,516         │ 2016-01-12   │ Other       │
├────────────┼─────────┼──────────────┼───────────┼──────────────────────┼──────────────┼──────────┼───────────────────────┼────────────┼─────────────┼──────────────────────────┼───────────────┼──────────────┼─────────────┤
│ underscore │ 1.9.1   │ 0            │ 6.3 kB    │ 6,645,455            │ 24,984       │ 53       │ 6.83%                 │ 723        │ 70          │ 5.22%                    │ 1,272         │ 2019-11-17   │ MIT License │
└────────────┴─────────┴──────────────┴───────────┴──────────────────────┴──────────────┴──────────┴───────────────────────┴────────────┴─────────────┴──────────────────────────┴───────────────┴──────────────┴─────────────┘
```

## Stats

#### version | source: bundlephobia (via npm)
#### dependencies | source: bundlephobia (via npm)
#### gzip size | source: bundlephobia (via npm)
#### weekly npm downloads | source: npm
#### github stars | source: github
#### open PRs | source: github
#### open PRs (% of total) | source: github
#### closed PRs | source: github
#### open issues | source: github
#### open issues (% of total) | source: github
#### closed issues | source: github
#### last release | source: github
#### license | source: github