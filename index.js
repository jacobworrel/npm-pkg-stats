#!/usr/bin/env node

const api = require('./api');
const chalk = require('chalk');
const figlet = require('figlet');
const ora = require('ora');
const R = require('ramda');
const util = require('./util');

const { getStats } = require('./api');

/**
 * TODO
 */

const pkgList = R.drop(2, process.argv);
const token = process.env.NPM_PKG_STATS_TOKEN;

console.log(chalk.magenta(figlet.textSync('npm pkg stats', { font: 'Big' })));

const spinner = ora({
  text: 'Getting stats...',
  color: 'magenta',
});

spinner.start();

Promise.all(R.map(getStats(token), pkgList))
  .then(
    R.pipe(
      R.tap(() => console.log('\n')),
      R.ifElse(
        R.pipe(R.length, R.equals(1)),
        R.pipe(R.head, api.makeVerticalTable, R.toString, console.log),
        pkgStatsList => {
          const labelList = R.pipe(
            R.reduce(
              (result, pkgStats) => R.concat(R.keys(pkgStats), result),
              [],
            ),
            R.uniq,
          )(pkgStatsList);
          const valueList = R.map(
            R.pipe(R.values, util.fillWith(api.nilValue, labelList.length)),
            pkgStatsList,
          );
          console.log(
            api.makeHorizontalTable({ labelList, valueList }).toString(),
          );
        },
      ),
      () => spinner.stop(),
    ),
  )
  .catch(err => {
    console.error(err);
    spinner.stop();
  });
