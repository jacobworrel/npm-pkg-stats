const R = require('ramda');

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

module.exports = {
  calcPercentage,
  formatSize,
};