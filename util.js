const dayjs = require('dayjs');
const numeral = require('numeral');
const R = require('ramda');

function calcRatio(open, closed) {
  const total = R.add(open, closed);
  return open / total;
}

function formatDate(date) {
  return dayjs(date).format('YYYY-MM-DD');
}

function formatNumber(x) {
  return numeral(x).format('0,0');
}

function formatPercentage(x) {
  return numeral(x).format('0.00%');
}

// copied from bundlephobia source
function formatSize(value) {
  let unit, size;
  if (Math.log10(value) < 3) {
    unit = 'B';
    size = value;
  } else if (Math.log10(value) < 6) {
    unit = 'kB';
    size = value / 1024;
  } else {
    unit = 'mB';
    size = value / 1024 / 1024;
  }

  return { unit, size };
}

const fillWith = R.curry((defaultValue, length, list) =>
  R.times(idx => R.defaultTo(defaultValue, list[idx]), length),
);

module.exports = {
  calcRatio,
  fillWith,
  formatDate,
  formatNumber,
  formatPercentage,
  formatSize,
};
