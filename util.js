const numeral = require('numeral');
const R = require('ramda');

function calcRatio (open, closed) {
  const total = R.add(open, closed);
  return open / total;
}

function formatNumber (x) {
  return numeral(x).format('0,0');
}

function formatPercentage (x) {
  return numeral(x).format('0.00%');
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

module.exports = {
  formatNumber,
  formatPercentage,
  calcRatio,
  formatSize,
};