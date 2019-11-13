#!/usr/bin/env node

const chalk = require('chalk');
const figlet = require('figlet');
const ora = require('ora');
const R = require('ramda');

const { getStats } = require('./api');


/**
 * TODO
 * - add support for multiple packages (ie. comparison mode)
 */

const [ pkg ] = R.drop(2, process.argv);
const token = process.env.NPM_PKG_STATS_TOKEN;

console.log(chalk.magenta(figlet.textSync('npm pkg stats', { font: 'Big' })));

const spinner = ora({
  text: 'Getting stats...',
  color: 'magenta',
});

spinner.start();

getStats(pkg, token)
.then(() => spinner.stop())
.catch(err => console.error(err));